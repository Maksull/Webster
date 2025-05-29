'use client';
import React, { useEffect, useState } from 'react';
import { Stage, Layer, Rect, Circle } from 'react-konva';
import LayerRenderer from './LayerRenderer';
import { useDrawing } from '@/contexts';
import CanvasResizeHandles from './CanvasResizeHandles';
import TextEditor from './TextEditor';
import { useCanvasOperations } from './useCanvasOperations';
import { createPortal } from 'react-dom';
import { useEraserCursor } from './useEraserCursor';
import ImageToolbar from './ImageToolbar';
import ImageResizeHandles from './ImageResizeHandles';
import { TextElement } from '@/types/elements';

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
        isImageResizing,
        textFontFamily,
        textFontSize,
        setTextFontSize,
        setTextFontFamily,
        color,
        setColor,
        setIsImageResizing,
        handleImageResizeStart: contextHandleImageResizeStart,
    } = useDrawing();

    useEraserCursor(stageRef, tool, elementsByLayer);

    const [selectionRect, setSelectionRect] = useState(null);
    const [selectionStartPoint, setSelectionStartPoint] = useState(null);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [isSelecting, setIsSelecting] = useState(false);
    const [imageEditingId, setImageEditingId] = useState<string | null>(null);

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

    const handleImageResizeStart = () => {
        setIsImageResizing(true);
    };

    const handleImageResizeEnd = () => {
        setIsImageResizing(false);
    };

    const handleStageClick = e => {
        console.log('Canvas.handleStageClick', e.target.getClassName());
        if (isImageResizing) return;

        const stage = e.target.getStage();
        if (!stage) return;
        const pos = stage.getPointerPosition();

        let hitText = false;
        let hitImage = false;

        elementsByLayer.forEach(elements => {
            elements.forEach(element => {
                if (element.type === 'image') {
                    if (
                        pos.x >= element.x &&
                        pos.x <= element.x + element.width &&
                        pos.y >= element.y &&
                        pos.y <= element.y + element.height
                    ) {
                        hitImage = true;

                        const now = Date.now();
                        if (
                            element._lastClickTime &&
                            now - element._lastClickTime < 300
                        ) {
                            console.log('Double click detected on image');
                            setImageEditingId(element.id);
                            if (!selectedElementIds.includes(element.id)) {
                                setSelectedElementIds([element.id]);
                            }
                        }
                        element._lastClickTime = now;
                    }
                } else if (element.type === 'text') {
                    const textWidth =
                        element.width ||
                        (element.text?.length * element.fontSize) / 2 ||
                        20;
                    const textHeight = element.height || element.fontSize || 20;
                    const padding = 10;

                    if (
                        pos.x >= element.x - padding &&
                        pos.x <= element.x + textWidth + padding &&
                        pos.y >= element.y - padding &&
                        pos.y <= element.y + textHeight + padding
                    ) {
                        hitText = true;

                        const now = Date.now();
                        if (
                            element._lastClickTime &&
                            now - element._lastClickTime < 300
                        ) {
                            console.log('Double click detected on text');
                            if (typeof handleTextEdit === 'function') {
                                handleTextEdit(element.id);
                            }
                        }
                        element._lastClickTime = now;
                    }
                }
            });
        });

        // Only clear selection if we didn't hit important elements
        if (
            tool === 'select' &&
            !hitText &&
            !hitImage &&
            e.target === e.target.getStage()
        ) {
            setSelectedElementIds([]);
            setImageEditingId(null);
        }
    };

    const handleCanvasMouseDown = e => {
        console.log('Canvas.handleCanvasMouseDown', e.target.getClassName());

        // Don't handle mouse down during image resizing
        if (isImageResizing) {
            console.log('Image is being resized, ignoring canvas mouse down');
            return;
        }

        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        const now = Date.now();

        // Store current click info for future double click detection
        setLastClickInfo({ time: now, target: e.target });

        if (tool === 'select') {
            // Clear selection rectangle state
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
                setImageEditingId(null);
            }
        }

        // Call the original mouse down handler
        onMouseDown(e);
    };

    const handleCanvasMouseMove = e => {
        // Don't handle mouse move during image resizing
        if (isImageResizing) return;

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
        if (isImageResizing) return;

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

    const getSelectedImageId = () => {
        if (selectedElementIds.length !== 1) return undefined;

        const selectedId = selectedElementIds[0];
        let isImage = false;
        elementsByLayer.forEach(elements => {
            const element = elements.find(el => el.id === selectedId);
            if (element && element.type === 'image') {
                isImage = true;
            }
        });

        return isImage ? selectedId : undefined;
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

        // Get the current text element being edited
        let currentTextElement: TextElement | null = null;
        elementsByLayer.forEach(elements => {
            const found = elements.find(
                el => el.id === textEditingId && el.type === 'text',
            ) as TextElement;
            if (found) {
                currentTextElement = found;
            }
        });

        if (!currentTextElement) return null;

        return createPortal(
            <TextEditor
                value={textValue}
                onChange={setTextValue}
                onDone={() =>
                    handleTextEditDone(
                        textEditingId,
                        textValue,
                        textFontSize,
                        textFontFamily,
                        color,
                    )
                }
                position={position}
                fontSize={textFontSize}
                onFontSizeChange={setTextFontSize}
                fontFamily={textFontFamily}
                onFontFamilyChange={setTextFontFamily}
                color={color}
                onColorChange={setColor}
            />,
            document.getElementById('canvas-container')!,
        );
    };

    return (
        <div
            id="canvas-container"
            className="flex-1 bg-slate-100 dark:bg-gray-900 overflow-auto relative">
            {/* Image Toolbar - positioned above canvas */}
            <ImageToolbar
                selectedImageId={imageEditingId || getSelectedImageId()}
                onClose={() => setImageEditingId(null)}
            />

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
                                      tool === 'marker'
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

                        {/* Render each layer */}
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
                                        setSelectionRect(null);
                                        setIsSelecting(false);
                                        setSelectionStartPoint(null);

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
                                    onImageResizeStart={handleImageResizeStart}
                                    onImageResizeEnd={handleImageResizeEnd}
                                />
                            );
                        })}

                        {/* Selection rectangle */}
                        {selectionRect &&
                            tool === 'select' &&
                            isSelecting &&
                            !isMoving &&
                            !isImageResizing && (
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

                        {/* Custom cursor for drawing tools */}
                        {(tool === 'pencil' ||
                            tool === 'brush' ||
                            tool === 'pen' ||
                            tool === 'marker') && (
                            <Layer listening={false}>
                                <Circle
                                    x={cursorPosition.x}
                                    y={cursorPosition.y}
                                    radius={Math.max(strokeWidth / 2, 6)}
                                    stroke="rgba(0, 0, 0, 0.6)"
                                    strokeWidth={1}
                                    dash={[2, 2]}
                                    fill={`${color}80`}
                                />
                            </Layer>
                        )}
                    </Stage>

                    {/* Render HTML-based image resize handles for all selected images */}
                    {selectedElementIds.map(elementId => {
                        let imageElement = null;
                        elementsByLayer.forEach(elements => {
                            const found = elements.find(
                                el =>
                                    el.id === elementId && el.type === 'image',
                            );
                            if (found) {
                                imageElement = found;
                            }
                        });

                        if (imageElement) {
                            return (
                                <ImageResizeHandles
                                    key={elementId}
                                    imageElement={{
                                        id: imageElement.id,
                                        x: imageElement.x,
                                        y: imageElement.y,
                                        width: imageElement.width,
                                        height: imageElement.height,
                                    }}
                                    isSelected={true}
                                    onResizeStart={
                                        contextHandleImageResizeStart
                                    }
                                />
                            );
                        }
                        return null;
                    })}

                    <CanvasResizeHandles
                        isDrawing={isDrawing}
                        onResizeStart={onResizeStart}
                    />
                    {renderTextEditor()}

                    {/* Remove ImageToolbar from here - it's now above the canvas */}
                </div>
            </div>
        </div>
    );
};

export default Canvas;
