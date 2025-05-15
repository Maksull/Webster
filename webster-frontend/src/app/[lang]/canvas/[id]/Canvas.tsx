'use client';
import React from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import LayerRenderer from './LayerRenderer';
import { useDrawing } from '@/contexts';

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
        activeLayerId,
        selectedElementIds,
        setSelectedElementIds,
    } = useDrawing();

    // Custom function to handle clicks on the stage
    const handleStageClick = (e: any) => {
        if (tool !== 'select' || e.target !== e.currentTarget) return;

        // Using Konva's hit detection
        const stage = e.target;
        const pos = stage.getPointerPosition();

        // Clear selection if clicked on empty area
        setSelectedElementIds([]);
    };

    return (
        <div className="flex-1 bg-slate-100 dark:bg-gray-900 overflow-auto relative">
            <div className="absolute top-0 left-0 min-w-full min-h-full flex items-center justify-center p-4">
                <div
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'center center',
                    }}
                    className="border border-slate-300 dark:border-gray-600 shadow-md relative">
                    <Stage
                        width={dimensions.width}
                        height={dimensions.height}
                        onMouseDown={onMouseDown}
                        onMousemove={onMouseMove}
                        onMouseup={onMouseUp}
                        onTouchStart={onMouseDown}
                        onTouchMove={onMouseMove}
                        onTouchEnd={onMouseUp}
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
                            console.log('Layer elements:', layerElements);

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
                                        console.log(
                                            'Selection triggered for:',
                                            id,
                                        );
                                        setSelectedElementIds([id]);
                                    }}
                                />
                            );
                        })}
                    </Stage>

                    {/* Rest of your code */}
                </div>
            </div>

            {/* Selection info */}
            {selectedElementIds.length > 0 && (
                <div className="absolute bottom-3 left-3 bg-white/80 dark:bg-gray-800/80 text-slate-600 dark:text-gray-300 text-xs py-1 px-2 rounded-md backdrop-blur-sm">
                    Selected: {selectedElementIds.join(', ')}
                </div>
            )}
        </div>
    );
};

export default Canvas;
