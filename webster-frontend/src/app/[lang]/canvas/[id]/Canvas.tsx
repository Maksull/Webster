'use client';
import React, { useEffect, useState } from 'react';
import { Stage, Layer, Rect, Circle } from 'react-konva';
import LayerRenderer from './LayerRenderer';
import { useDrawing } from '@/contexts';
import CanvasResizeHandles from './CanvasResizeHandles';
import TextEditor from './TextEditor';
import { useCanvasOperations } from './useCanvasOperations';
import { createPortal } from 'react-dom';
import { useEraserCursor } from './useEraserCursorю';

interface CanvasProps {
    onMouseDown: (e: any) => void;
    onMouseMove: (e: any) => void;
    onMouseUp: () => void;
    onResizeStart: (
        direction: string,
        e: React.MouseEvent | React.TouchEvent,
    ) => void;
}

const Canvas: React.FC<CanvasProps> = ({
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onResizeStart,
}) => {
    const {
        stageRef,
        layerRefs,
        dimensions,
        backgroundColor,
        isDrawing,
        scale,
        tool,
        layers,
        elementsByLayer,
        selectedElementIds,
        setSelectedElementIds,
        textEditingId,
        textValue,
        setTextValue,
        activeLayerId,
        isMoving,
        strokeWidth,
        color,
    } = useDrawing();
    useEraserCursor(stageRef, tool, elementsByLayer);

    const [selectionRect, setSelectionRect] = useState(null);
    const [selectionStartPoint, setSelectionStartPoint] = useState(null);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [isSelecting, setIsSelecting] = useState(false);

    const { handleTextEdit, handleTextEditDone } = useCanvasOperations({
        clearSelectionRect: () => {
            setSelectionRect(null);
            setIsSelecting(false);
            setSelectionStartPoint(null);
        },
    });
    const [lastClickInfo, setLastClickInfo] = useState({
        time: 0,
        target: null,
    });

    const handleStageClick = e => {
        console.log('----------------');
        console.log('Canvas.handleStageClick', e);
        const stage = e.target.getStage();
        if (!stage) return;

        const pos = stage.getPointerPosition();
        const layers = stage.getLayers();
        let hitText = false;

        layers.forEach(layer => {
            const textNodes = layer.find('Text');
            textNodes.forEach(textNode => {
                const textNodeWidth =
                    textNode.width() ||
                    (textNode.text()?.length * textNode.fontSize()) / 2 ||
                    20;
                const textNodeHeight =
                    textNode.height() || textNode.fontSize() || 20;
                const padding = 10;

                const textNodeRect = {
                    x: textNode.x() - padding,
                    y: textNode.y() - padding,
                    width: textNodeWidth + padding * 2,
                    height: textNodeHeight + padding * 2,
                };

                if (
                    pos.x >= textNodeRect.x &&
                    pos.x <= textNodeRect.x + textNodeRect.width &&
                    pos.y >= textNodeRect.y &&
                    pos.y <= textNodeRect.y + textNodeRect.height
                ) {
                    hitText = true;

                    const now = Date.now();
                    const lastClickTime = textNode.attrs._lastClickTime || 0;
                    textNode.attrs._lastClickTime = now;

                    if (now - lastClickTime < 300) {
                        console.log('Double click detected on text');
                        const elementId = textNode.attrs.id;
                        if (elementId && typeof handleTextEdit === 'function') {
                            handleTextEdit(elementId);
                        }
                    }
                }
            });
        });

        // Only clear selection if we didn't hit a text element
        if (tool === 'select' && !hitText && e.target === e.target.getStage()) {
            setSelectedElementIds([]);
        }
    };

    // Custom mouse handlers that incorporate selection rectangle
    const handleCanvasMouseDown = e => {
        console.log('----------------');
        console.log('Canvas.handleCanvasMouseDown', e);

        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        const now = Date.now();

        // Check for double click on any element (including text)
        if (
            e.target === lastClickInfo.target &&
            now - lastClickInfo.time < 300
        ) {
            console.log('Double click detected manually');

            if (
                e.target.className === 'Text' ||
                (e.target.className === 'Rect' &&
                    e.target.attrs.id &&
                    elementsByLayer
                        .get(activeLayerId)
                        ?.find(
                            el =>
                                el.id === e.target.attrs.id &&
                                el.type === 'text',
                        ))
            ) {
                const elementId = e.target.attrs.id;
                if (elementId) {
                    console.log(
                        'Double click on text, starting edit:',
                        elementId,
                    );
                    handleTextEdit(elementId);
                    e.cancelBubble = true;
                    setLastClickInfo({ time: 0, target: null });
                    return;
                }
            }
        }

        // Store current click info for future double click detection
        setLastClickInfo({ time: now, target: e.target });

        if (tool === 'select') {
            // First, always clear any existing selection rectangle state
            setSelectionRect(null);
            setIsSelecting(false);
            setSelectionStartPoint(null);

            // Check if we clicked on the stage itself (empty space)
            const clickedOnStage = e.target === e.target.getStage();

            if (clickedOnStage) {
                console.log('Starting rectangle selection on empty space');
                setSelectionStartPoint({ x: pos.x, y: pos.y });
                setSelectionRect({
                    x: pos.x,
                    y: pos.y,
                    width: 0,
                    height: 0,
                });
                setIsSelecting(true);
            } else {
                // We clicked on an object - this will be handled by useCanvasOperations
                // Make sure we don't set up selection rectangle
                console.log('Clicked on object, no selection rectangle');
            }
        }

        // Call the original mouse down handler
        onMouseDown(e);
    };

    const handleCanvasMouseMove = e => {
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();

        if (
            pos &&
            (tool === 'pencil' ||
                tool === 'brush' ||
                tool === 'pen' ||
                tool === 'marker' ||
                tool === 'eraser')
        ) {
            setCursorPosition(pos);
        }

        // Only update selection rectangle if we're actually selecting (not moving objects)
        if (
            isSelecting &&
            tool === 'select' &&
            !isMoving &&
            selectionStartPoint
        ) {
            setSelectionRect({
                x: Math.min(selectionStartPoint.x, pos.x),
                y: Math.min(selectionStartPoint.y, pos.y),
                width: Math.abs(pos.x - selectionStartPoint.x),
                height: Math.abs(pos.y - selectionStartPoint.y),
            });
        }

        onMouseMove(e);
    };

    const handleCanvasMouseUp = e => {
        // Handle selection rectangle completion only if we were actually selecting
        if (isSelecting && !isMoving && selectionRect && tool === 'select') {
            const selectedIds = [];
            elementsByLayer.forEach((elements, layerId) => {
                elements.forEach(element => {
                    if (isElementInSelectionRect(element, selectionRect)) {
                        selectedIds.push(element.id);
                    }
                });
            });

            if (e.evt && (e.evt.shiftKey || e.evt.ctrlKey)) {
                setSelectedElementIds([
                    ...new Set([...selectedElementIds, ...selectedIds]),
                ]);
            } else {
                setSelectedElementIds(selectedIds);
            }
        }

        // Always clear selection rectangle state on mouse up
        // This ensures no leftover selection rectangles appear
        setIsSelecting(false);
        setSelectionRect(null);
        setSelectionStartPoint(null);

        onMouseUp();
    };

    const isElementInSelectionRect = (element, rect) => {
        if (!rect) return false;

        const rectLeft = rect.x;
        const rectRight = rect.x + rect.width;
        const rectTop = rect.y;
        const rectBottom = rect.y + rect.height;

        switch (element.type) {
            case 'rectangle':
            case 'rect': {
                const { x, y, width, height } = element;
                const elementRight = x + width;
                const elementBottom = y + height;
                return !(
                    elementRight < rectLeft ||
                    x > rectRight ||
                    elementBottom < rectTop ||
                    y > rectBottom
                );
            }
            case 'circle': {
                const { x, y, radius } = element;
                const elementLeft = x - radius;
                const elementRight = x + radius;
                const elementTop = y - radius;
                const elementBottom = y + radius;
                return !(
                    elementRight < rectLeft ||
                    elementLeft > rectRight ||
                    elementBottom < rectTop ||
                    elementTop > rectBottom
                );
            }
            case 'triangle': {
                const { x, y, radius } = element;
                const elementLeft = x - radius;
                const elementRight = x + radius;
                const elementTop = y - radius;
                const elementBottom = y + radius;
                return !(
                    elementRight < rectLeft ||
                    elementLeft > rectRight ||
                    elementBottom < rectTop ||
                    elementTop > rectBottom
                );
            }
            case 'image': {
                const { x, y, width, height } = element;
                const elementRight = x + width;
                const elementBottom = y + height;
                return !(
                    elementRight < rectLeft ||
                    x > rectRight ||
                    elementBottom < rectTop ||
                    y > rectBottom
                );
            }
            case 'line':
            case 'line-shape':
            case 'arrow': {
                const { points } = element;
                for (let i = 0; i < points.length; i += 2) {
                    const pointX = points[i];
                    const pointY = points[i + 1];
                    if (
                        pointX >= rectLeft &&
                        pointX <= rectRight &&
                        pointY >= rectTop &&
                        pointY <= rectBottom
                    ) {
                        return true;
                    }
                }
                return false;
            }
            case 'text': {
                const { x, y, width, height, fontSize, text } = element;
                const textWidth = width || (text?.length * fontSize) / 2 || 0;
                const textHeight = height || fontSize || 0;
                const elementRight = x + textWidth;
                const elementBottom = y + textHeight;
                return !(
                    elementRight < rectLeft ||
                    x > rectRight ||
                    elementBottom < rectTop ||
                    y > rectBottom
                );
            }
            default:
                return false;
        }
    };

    const getTextEditorPosition = () => {
        if (!textEditingId || !stageRef.current) return { x: 0, y: 0 };

        let textElement = null;
        elementsByLayer.forEach(elements => {
            const found = elements.find(el => el.id === textEditingId);
            if (found && found.type === 'text') {
                textElement = found;
            }
        });

        if (!textElement) return { x: 0, y: 0 };

        const stage = stageRef.current;
        const containerRect = stage.container().getBoundingClientRect();

        return {
            x: textElement.x * scale + containerRect.left,
            y: textElement.y * scale + containerRect.top,
        };
    };

    const renderTextEditor = () => {
        if (!textEditingId) return null;

        const position = getTextEditorPosition();
        return createPortal(
            <TextEditor
                value={textValue}
                onChange={setTextValue}
                onDone={() => handleTextEditDone(textEditingId, textValue)}
                position={position}
            />,
            document.getElementById('canvas-container')!,
        );
    };

    return (
        <div
            id="canvas-container"
            className="flex-1 bg-slate-100 dark:bg-gray-900 overflow-auto relative">
            <div className="absolute top-0 left-0 min-w-full min-h-full flex items-center justify-center p-4">
                <div
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'center center',
                    }}
                    className={`border border-slate-300 dark:border-gray-600 shadow-md relative ${
                        backgroundColor === 'transparent'
                            ? 'bg-checkerboard'
                            : ''
                    }`}>
                    <Stage
                        width={dimensions.width}
                        height={dimensions.height}
                        onMouseDown={handleCanvasMouseDown}
                        onMousemove={handleCanvasMouseMove}
                        onMouseup={handleCanvasMouseUp}
                        onTouchStart={handleCanvasMouseDown}
                        onTouchMove={handleCanvasMouseMove}
                        onTouchEnd={handleCanvasMouseUp}
                        onClick={handleStageClick}
                        ref={stageRef}
                        className={`${
                            tool === 'bucket'
                                ? 'cursor-pointer'
                                : tool === 'select'
                                  ? 'cursor-default'
                                  : tool === 'pencil' ||
                                      tool === 'brush' ||
                                      tool === 'pen' ||
                                      tool === 'marker' ||
                                      tool === 'eraser'
                                    ? 'cursor-none'
                                    : 'cursor-crosshair'
                        }`}>
                        <Layer>
                            <Rect
                                x={0}
                                y={0}
                                width={dimensions.width}
                                height={dimensions.height}
                                fill={backgroundColor}
                                listening={false}
                            />
                        </Layer>

                        {/*Render each layer*/}
                        {layers.map(layer => {
                            const layerElements =
                                elementsByLayer.get(layer.id) || [];

                            return (
                                <LayerRenderer
                                    key={layer.id}
                                    layer={layer}
                                    elements={layerElements}
                                    onRef={(id, node) =>
                                        layerRefs.current.set(id, node)
                                    }
                                    selectedElementIds={selectedElementIds}
                                    onSelectElement={id => {
                                        // Clear selection rectangle when selecting individual elements
                                        setSelectionRect(null);
                                        setIsSelecting(false);
                                        setSelectionStartPoint(null);

                                        // Handle shift key for multi-select
                                        if (
                                            window.event &&
                                            (window.event.shiftKey ||
                                                window.event.ctrlKey)
                                        ) {
                                            const newSelectedIds = [
                                                ...selectedElementIds,
                                            ];
                                            const index =
                                                newSelectedIds.indexOf(id);

                                            if (index !== -1) {
                                                newSelectedIds.splice(index, 1);
                                            } else {
                                                newSelectedIds.push(id);
                                            }

                                            setSelectedElementIds(
                                                newSelectedIds,
                                            );
                                        } else {
                                            setSelectedElementIds([id]);
                                        }
                                    }}
                                    onTextEdit={handleTextEdit}
                                />
                            );
                        })}

                        {/* Only render selection rectangle when actually selecting (not moving) */}
                        {selectionRect &&
                            tool === 'select' &&
                            isSelecting &&
                            !isMoving && (
                                <Layer>
                                    <Rect
                                        x={selectionRect.x}
                                        y={selectionRect.y}
                                        width={selectionRect.width}
                                        height={selectionRect.height}
                                        stroke="#0066FF"
                                        strokeWidth={2}
                                        dash={[5, 5]}
                                        fill="#0066FF"
                                        opacity={0.1}
                                        listening={false}
                                    />
                                </Layer>
                            )}

                        {(tool === 'pencil' ||
                            tool === 'brush' ||
                            tool === 'pen' ||
                            tool === 'marker' ||
                            tool === 'eraser') && (
                            <Layer listening={false}>
                                <Circle
                                    x={cursorPosition.x}
                                    y={cursorPosition.y}
                                    radius={Math.max(strokeWidth / 2, 6)}
                                    stroke="rgba(0, 0, 0, 0.6)"
                                    strokeWidth={1}
                                    dash={[2, 2]}
                                    fill={
                                        tool === 'eraser'
                                            ? 'white'
                                            : `${color}80`
                                    }
                                />
                            </Layer>
                        )}
                    </Stage>

                    <CanvasResizeHandles
                        isDrawing={isDrawing}
                        onResizeStart={onResizeStart}
                    />
                    {renderTextEditor()}
                </div>
            </div>
        </div>
    );
};

export default Canvas;
