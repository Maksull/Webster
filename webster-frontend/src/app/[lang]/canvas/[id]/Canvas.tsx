'use client';

import React, { useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import LayerRenderer from './LayerRenderer';
import { useDrawing } from '@/contexts';
import CanvasResizeHandles from './CanvasResizeHandles';
import TextEditor from './TextEditor';
import { useCanvasOperations } from './useCanvasOperations';
import { createPortal } from 'react-dom';

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
    } = useDrawing();

    // Add selection rectangle state directly in Canvas component
    const [selectionRect, setSelectionRect] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const { handleTextEdit, handleTextEditDone } = useCanvasOperations();

    const handleStageClick = (e: any) => {
        // Don't clear selection if we clicked on a text element
        const stage = e.target.getStage();
        if (!stage) return;

        const pos = stage.getPointerPosition();

        // Check if we clicked on a text element
        const layers = stage.getLayers();
        let hitText = false;

        // Check all layers for text hits
        layers.forEach(layer => {
            const textNodes = layer.find('Text');
            textNodes.forEach(textNode => {
                const textNodeRect = textNode.getClientRect();
                if (
                    pos.x >= textNodeRect.x &&
                    pos.x <= textNodeRect.x + textNodeRect.width &&
                    pos.y >= textNodeRect.y &&
                    pos.y <= textNodeRect.y + textNodeRect.height
                ) {
                    hitText = true;
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
        // If we're using the select tool and clicking on the stage (not an element)
        if (tool === 'select' && e.target === e.target.getStage()) {
            const stage = e.target.getStage();
            const pos = stage.getPointerPosition();

            // Start selection rectangle
            setSelectionRect({
                x: pos.x,
                y: pos.y,
                width: 0,
                height: 0,
            });
            setIsSelecting(true);
        }

        // Call the original mouse down handler
        onMouseDown(e);
    };

    const handleCanvasMouseMove = e => {
        // Update selection rectangle if we're selecting
        if (isSelecting && tool === 'select') {
            const stage = e.target.getStage();
            const pos = stage.getPointerPosition();
            const startX = selectionRect.x;
            const startY = selectionRect.y;

            setSelectionRect({
                x: Math.min(startX, pos.x),
                y: Math.min(startY, pos.y),
                width: Math.abs(pos.x - startX),
                height: Math.abs(pos.y - startY),
            });
        }

        // Call the original mouse move handler
        onMouseMove(e);
    };

    const handleCanvasMouseUp = e => {
        if (isSelecting) {
            // Find elements in the selection rectangle
            const selectedIds = [];

            elementsByLayer.forEach((elements, layerId) => {
                elements.forEach(element => {
                    if (isElementInSelectionRect(element, selectionRect)) {
                        selectedIds.push(element.id);
                    }
                });
            });

            // Update selected elements, considering shift key for multi-select
            if (e.evt && (e.evt.shiftKey || e.evt.ctrlKey)) {
                setSelectedElementIds([
                    ...new Set([...selectedElementIds, ...selectedIds]),
                ]);
            } else {
                setSelectedElementIds(selectedIds);
            }

            setIsSelecting(false);
            setSelectionRect(null);
        }

        // Call the original mouse up handler
        onMouseUp();
    };

    // Helper function to check if an element is within the selection rectangle
    const isElementInSelectionRect = (element, rect) => {
        if (!rect) return false;

        switch (element.type) {
            case 'rectangle':
            case 'rect': {
                const { x, y, width, height } = element;
                return (
                    x < rect.x + rect.width &&
                    x + width > rect.x &&
                    y < rect.y + rect.height &&
                    y + height > rect.y
                );
            }

            case 'circle': {
                const { x, y, radius } = element;
                return (
                    x + radius > rect.x &&
                    x - radius < rect.x + rect.width &&
                    y + radius > rect.y &&
                    y - radius < rect.y + rect.height
                );
            }

            case 'triangle': {
                const { x, y, radius } = element;
                return (
                    x + radius > rect.x &&
                    x - radius < rect.x + rect.width &&
                    y + radius > rect.y &&
                    y - radius < rect.y + rect.height
                );
            }

            case 'line':
            case 'line-shape': {
                const { points } = element;
                for (let i = 0; i < points.length; i += 2) {
                    const pointX = points[i];
                    const pointY = points[i + 1];

                    if (
                        pointX >= rect.x &&
                        pointX <= rect.x + rect.width &&
                        pointY >= rect.y &&
                        pointY <= rect.y + rect.height
                    ) {
                        return true;
                    }
                }
                return false;
            }

            default:
                return false;
        }
    };

    const getTextEditorPosition = () => {
        if (!textEditingId || !stageRef.current) return { x: 0, y: 0 };

        // Find the text element being edited
        let textElement = null;
        elementsByLayer.forEach(elements => {
            const found = elements.find(el => el.id === textEditingId);
            if (found && found.type === 'text') {
                textElement = found;
            }
        });

        if (!textElement) return { x: 0, y: 0 };

        // Get the position in screen coordinates
        const stage = stageRef.current;
        const containerRect = stage.container().getBoundingClientRect();

        return {
            x: textElement.x * scale + containerRect.left,
            y: textElement.y * scale + containerRect.top,
        };
    };

    // Render the text editor if needed
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
                                    onTextEdit={handleTextEdit} // Add this line
                                />
                            );
                        })}

                        {/* Render selection rectangle with high visibility */}
                        {selectionRect && tool === 'select' && (
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
