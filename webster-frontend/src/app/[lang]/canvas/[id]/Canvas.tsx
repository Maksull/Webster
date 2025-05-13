'use client';
import React from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import CanvasResizeHandles from './CanvasResizeHandles';
import LayerRenderer from './LayerRenderer';
import { useDrawing } from '@/contexts/DrawingContext';
import { Layers } from 'lucide-react';

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
        activeLayerId, // Add this line to destructure activeLayerId
    } = useDrawing();

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
                        ref={stageRef}
                        className={`${tool === 'bucket' ? 'cursor-pointer' : 'cursor-crosshair'}`}>
                        <Layer>
                            <Rect
                                x={0}
                                y={0}
                                width={dimensions.width}
                                height={dimensions.height}
                                fill={backgroundColor}
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
                                />
                            );
                        })}
                    </Stage>

                    {/* Resize handles */}
                    <CanvasResizeHandles
                        isDrawing={isDrawing}
                        onResizeStart={onResizeStart}
                    />
                </div>
            </div>

            {/* Canvas dimensions indicator */}
            <div className="absolute top-3 left-3 bg-white/80 dark:bg-gray-800/80 text-slate-600 dark:text-gray-300 text-xs py-1 px-2 rounded-md backdrop-blur-sm">
                {Math.round(dimensions.width)} × {Math.round(dimensions.height)}
            </div>

            {/* Active layer indicator */}
            <div className="absolute top-3 right-3 bg-white/80 dark:bg-gray-800/80 text-slate-600 dark:text-gray-300 text-xs py-1 px-2 rounded-md backdrop-blur-sm flex items-center">
                <Layers className="h-3 w-3 mr-1.5 text-indigo-500" />
                {layers.find(l => l.id === activeLayerId)?.name || 'Layer'}
            </div>
        </div>
    );
};

export default Canvas;
