'use client';

import React from 'react';

interface CanvasResizeHandlesProps {
    isDrawing: boolean;
    onResizeStart: (
        direction: string,
        e: React.MouseEvent | React.TouchEvent,
    ) => void;
}

const CanvasResizeHandles: React.FC<CanvasResizeHandlesProps> = ({
    isDrawing,
    onResizeStart,
}) => {
    if (isDrawing) return null;

    return (
        <>
            {/* Left handle */}
            <div
                className="absolute top-0 left-0 w-4 h-full cursor-w-resize hover:bg-indigo-500/10"
                onMouseDown={e => onResizeStart('left', e)}
                onTouchStart={e => onResizeStart('left', e)}>
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-1 h-12 bg-indigo-500 rounded opacity-70"></div>
            </div>

            {/* Right handle */}
            <div
                className="absolute top-0 right-0 w-4 h-full cursor-e-resize hover:bg-indigo-500/10"
                onMouseDown={e => onResizeStart('right', e)}
                onTouchStart={e => onResizeStart('right', e)}>
                <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-1 h-12 bg-indigo-500 rounded opacity-70"></div>
            </div>

            {/* Top handle */}
            <div
                className="absolute top-0 left-0 w-full h-4 cursor-n-resize hover:bg-indigo-500/10"
                onMouseDown={e => onResizeStart('top', e)}
                onTouchStart={e => onResizeStart('top', e)}>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-1 w-12 bg-indigo-500 rounded opacity-70"></div>
            </div>

            {/* Bottom handle */}
            <div
                className="absolute bottom-0 left-0 w-full h-4 cursor-s-resize hover:bg-indigo-500/10"
                onMouseDown={e => onResizeStart('bottom', e)}
                onTouchStart={e => onResizeStart('bottom', e)}>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-12 bg-indigo-500 rounded opacity-70"></div>
            </div>

            {/* Top-left corner handle */}
            <div
                className="absolute top-0 left-0 w-6 h-6 cursor-nw-resize hover:bg-indigo-500/10"
                onMouseDown={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('mousedown on top-left');
                    onResizeStart('top-left', e);
                }}
                onTouchStart={e => onResizeStart('top-left', e)}>
                <div className="absolute top-0 left-0 w-4 h-4 bg-indigo-500 rounded-br opacity-70"></div>
            </div>

            {/* Top-right corner handle */}
            <div
                className="absolute top-0 right-0 w-6 h-6 cursor-ne-resize hover:bg-indigo-500/10"
                onMouseDown={e => onResizeStart('top-right', e)}
                onTouchStart={e => onResizeStart('top-right', e)}>
                <div className="absolute top-0 right-0 w-4 h-4 bg-indigo-500 rounded-bl opacity-70"></div>
            </div>

            {/* Bottom-left corner handle */}
            <div
                className="absolute bottom-0 left-0 w-6 h-6 cursor-sw-resize hover:bg-indigo-500/10"
                onMouseDown={e => onResizeStart('bottom-left', e)}
                onTouchStart={e => onResizeStart('bottom-left', e)}>
                <div className="absolute bottom-0 left-0 w-4 h-4 bg-indigo-500 rounded-tr opacity-70"></div>
            </div>

            {/* Bottom-right corner handle */}
            <div
                className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize hover:bg-indigo-500/10"
                onMouseDown={e => onResizeStart('bottom-right', e)}
                onTouchStart={e => onResizeStart('bottom-right', e)}>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-indigo-500 rounded-tl opacity-70"></div>
            </div>
        </>
    );
};

export default CanvasResizeHandles;
