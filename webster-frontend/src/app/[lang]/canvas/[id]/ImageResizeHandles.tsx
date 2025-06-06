import React from 'react';
import { createPortal } from 'react-dom';
import { KonvaEventObject } from 'konva/lib/Node';
import { Stage } from 'konva/lib/Stage';
import { useDrawing } from '@/contexts';

interface ImageResizeHandlesProps {
    imageElement: {
        id: string;
        x: number;
        y: number;
        width: number;
        height: number;
    };
    isSelected: boolean;
    onResizeStart: (
        corner: string,
        e: KonvaEventObject<MouseEvent | TouchEvent>,
    ) => void;
}

interface SyntheticTarget {
    getStage: () => Stage;
}

const ImageResizeHandles: React.FC<ImageResizeHandlesProps> = ({
    imageElement,
    isSelected,
    onResizeStart,
}) => {
    const { scale, stageRef } = useDrawing();

    if (!isSelected || !stageRef.current) return null;

    const stage = stageRef.current;
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) return null;

    const canvasRect = canvasContainer.getBoundingClientRect();
    const stageContainer = stage.container();
    const stageRect = stageContainer.getBoundingClientRect();

    const { x, y, width, height } = imageElement;
    const stageOffsetX = stageRect.left - canvasRect.left;
    const stageOffsetY = stageRect.top - canvasRect.top;

    const imageLeft = stageOffsetX + x * scale;
    const imageTop = stageOffsetY + y * scale;
    const imageWidth = width * scale;
    const imageHeight = height * scale;

    console.log('ImageResizeHandles Debug - Fixed approach:', {
        imageElement: { x, y, width, height },
        scale,
        canvasRect: { left: canvasRect.left, top: canvasRect.top },
        stageRect: { left: stageRect.left, top: stageRect.top },
        stageOffset: { x: stageOffsetX, y: stageOffsetY },
        calculated: { imageLeft, imageTop, imageWidth, imageHeight },
    });

    const handleSize = 12;
    const handleHitArea = 16;

    const handles = [
        {
            name: 'top-left',
            style: {
                left: imageLeft - handleSize / 2,
                top: imageTop - handleSize / 2,
                cursor: 'nw-resize',
            },
        },
        {
            name: 'top-right',
            style: {
                left: imageLeft + imageWidth - handleSize / 2,
                top: imageTop - handleSize / 2,
                cursor: 'ne-resize',
            },
        },
        {
            name: 'bottom-left',
            style: {
                left: imageLeft - handleSize / 2,
                top: imageTop + imageHeight - handleSize / 2,
                cursor: 'sw-resize',
            },
        },
        {
            name: 'bottom-right',
            style: {
                left: imageLeft + imageWidth - handleSize / 2,
                top: imageTop + imageHeight - handleSize / 2,
                cursor: 'se-resize',
            },
        },
        {
            name: 'top-center',
            style: {
                left: imageLeft + imageWidth / 2 - handleSize / 2,
                top: imageTop - handleSize / 2,
                cursor: 'n-resize',
            },
        },
        {
            name: 'bottom-center',
            style: {
                left: imageLeft + imageWidth / 2 - handleSize / 2,
                top: imageTop + imageHeight - handleSize / 2,
                cursor: 's-resize',
            },
        },
        {
            name: 'left-center',
            style: {
                left: imageLeft - handleSize / 2,
                top: imageTop + imageHeight / 2 - handleSize / 2,
                cursor: 'w-resize',
            },
        },
        {
            name: 'right-center',
            style: {
                left: imageLeft + imageWidth - handleSize / 2,
                top: imageTop + imageHeight / 2 - handleSize / 2,
                cursor: 'e-resize',
            },
        },
    ];

    const handleMouseDown = (
        handleName: string,
        e: React.MouseEvent | React.TouchEvent,
    ) => {
        console.log('Image resize handle mouse down:', handleName);
        e.preventDefault();
        e.stopPropagation();

        const syntheticEvent: KonvaEventObject<MouseEvent | TouchEvent> = {
            target: {
                getStage: () => stage,
            } as SyntheticTarget,
            evt: e.nativeEvent,
            cancelBubble: true,
        } as KonvaEventObject<MouseEvent | TouchEvent>;

        onResizeStart(handleName, syntheticEvent);
    };

    const renderHandles = () => (
        <>
            {/* Selection outline */}
            <div
                style={{
                    position: 'absolute',
                    left: imageLeft,
                    top: imageTop,
                    width: imageWidth,
                    height: imageHeight,
                    border: '2px dashed #0066FF',
                    pointerEvents: 'none',
                    zIndex: 999,
                }}
            />

            {/* Resize handles */}
            {handles.map(handle => (
                <div
                    key={handle.name}
                    style={{
                        position: 'absolute',
                        left:
                            handle.style.left -
                            (handleHitArea - handleSize) / 2,
                        top:
                            handle.style.top - (handleHitArea - handleSize) / 2,
                        width: handleHitArea,
                        height: handleHitArea,
                        cursor: handle.style.cursor,
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onMouseDown={e => handleMouseDown(handle.name, e)}
                    onTouchStart={e => handleMouseDown(handle.name, e)}>
                    <div
                        style={{
                            width: handleSize,
                            height: handleSize,
                            backgroundColor: 'white',
                            border: '2px solid #0066FF',
                            borderRadius: '50%',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                            pointerEvents: 'none', // Let parent handle events
                        }}
                    />
                </div>
            ))}
        </>
    );

    return createPortal(renderHandles(), canvasContainer);
};

export default ImageResizeHandles;
