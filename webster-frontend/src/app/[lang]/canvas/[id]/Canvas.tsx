'use client';

import React, { useState, useRef } from 'react';
import { Stage, Layer, Rect, Circle, Line } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Node as KonvaNode } from 'konva/lib/Node';
import LayerRenderer from './LayerRenderer';
import { useDrawing } from '@/contexts';
import CanvasResizeHandles from './CanvasResizeHandles';
import TextEditor from './TextEditor';
import { useCanvasOperations } from './useCanvasOperations';
import { createPortal } from 'react-dom';
import { useEraserCursor } from './useEraserCursor';
import ImageToolbar from './ImageToolbar';
import ImageResizeHandles from './ImageResizeHandles';
import { useDictionary } from '@/contexts';
import {
    TextElement,
    DrawingElement,
    ArrowElement,
    CircleElement,
    ImageElement,
    LineElement,
    LineShapeElement,
    RectangleElement,
    RectElement,
    TriangleElement,
    CurveElement,
} from '@/types/elements';
import ContextMenu from './ContextMenu';

interface CanvasProps {
    onMouseDown: (e: KonvaEventObject<MouseEvent | TouchEvent>) => void;
    onMouseMove: (e: KonvaEventObject<MouseEvent | TouchEvent>) => void;
    onMouseUp: () => void;
    onResizeStart: (
        direction: string,
        e: React.MouseEvent | React.TouchEvent,
    ) => void;
}

interface SelectionRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Point {
    x: number;
    y: number;
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
        isDrawingCurve,
    } = useDrawing();

    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        isVisible: boolean;
    }>({ x: 0, y: 0, isVisible: false });

    const {
        handleTextEdit,
        handleTextEditDone,
        handleStageDoubleClick,
        handleDeleteSelectedElements,
        handleImageResizeStart,
        fitImageToCanvas,
        fitImageToCanvasWithAspectRatio,
        toggleAspectRatio,
    } = useCanvasOperations({
        clearSelectionRect: () => {
            setSelectionRect(null);
            setIsSelecting(false);
            setSelectionStartPoint(null);
        },
    });

    const handleContextMenu = (e: KonvaEventObject<PointerEvent>) => {
        e.evt.preventDefault();
        e.cancelBubble = true;

        const stage = e.target.getStage();
        if (!stage) return;

        const pos = stage.getPointerPosition();
        if (!pos) return;

        const shapes = stage.getAllIntersections(pos);
        const targetShapes = shapes.filter((shape: KonvaNode) => {
            if (shape === stage || shape.getClassName() === 'Stage') {
                return false;
            }
            return [
                'Rect',
                'Circle',
                'Line',
                'Group',
                'Arrow',
                'RegularPolygon',
                'Text',
                'Image',
            ].includes(shape.getClassName());
        });

        let clickedElementId: string | null = null;
        if (targetShapes.length > 0) {
            for (let i = targetShapes.length - 1; i >= 0; i--) {
                const shape = targetShapes[i];
                const shapeId = shape.attrs.id;
                if (!shapeId) continue;

                let foundElement = false;
                for (const [, elements] of Array.from(
                    elementsByLayer.entries(),
                )) {
                    const element = elements.find(el => el.id === shapeId);
                    if (element) {
                        clickedElementId = shapeId;
                        foundElement = true;
                        break;
                    }
                }
                if (foundElement) break;
            }
        }

        if (clickedElementId) {
            if (!selectedElementIds.includes(clickedElementId)) {
                if (tool === 'select') {
                    setSelectedElementIds([clickedElementId]);
                }
            }
        } else {
            if (tool === 'select') {
                setSelectedElementIds([]);
                setImageEditingId(null);
            }
        }

        setContextMenu({
            x: e.evt.clientX,
            y: e.evt.clientY,
            isVisible: true,
        });
    };

    const handleCloseContextMenu = () => {
        setContextMenu(prev => ({ ...prev, isVisible: false }));
    };

    const handleCopyImage = async () => {
        if (stageRef.current) {
            try {
                const canvas = stageRef.current.toCanvas();
                canvas.toBlob(async blob => {
                    if (blob) {
                        await navigator.clipboard.write([
                            new ClipboardItem({ 'image/png': blob }),
                        ]);
                        console.log('Image copied to clipboard');
                    }
                });
            } catch (error) {
                console.error('Failed to copy image:', error);
            }
        }
    };

    const { dict } = useDictionary();

    useEraserCursor(stageRef, tool, elementsByLayer);

    const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(
        null,
    );
    const [selectionStartPoint, setSelectionStartPoint] =
        useState<Point | null>(null);
    const [cursorPosition, setCursorPosition] = useState<Point>({ x: 0, y: 0 });
    const [isSelecting, setIsSelecting] = useState(false);
    const [imageEditingId, setImageEditingId] = useState<string | null>(null);
    const [curvePreviewPosition, setCurvePreviewPosition] =
        useState<Point | null>(null);

    const lastClickTimes = useRef<Map<string, number>>(new Map());

    const handleImageResizeEnd = () => {
        setIsImageResizing(false);
    };

    const handleStageClick = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
        console.log('Canvas.handleStageClick', e.target.getClassName());

        if (e.evt && 'button' in e.evt && e.evt.button === 2) {
            return;
        }

        if (tool === 'curve') {
            if (isDrawingCurve) {
                const now = Date.now();
                const target = e.target;
                const targetId = target.attrs?.id || 'stage';
                const lastClickTime = lastClickTimes.current.get(targetId) || 0;

                if (now - lastClickTime < 300) {
                    handleStageDoubleClick(e);
                }
                lastClickTimes.current.set(targetId, now);
            }
            return;
        }

        if (isImageResizing) return;

        const stage = e.target.getStage();
        if (!stage) return;

        const pos = stage.getPointerPosition();
        if (!pos) return;

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

                        // Only allow image interaction if tool is 'select'
                        if (tool === 'select') {
                            const now = Date.now();
                            const lastClickTime =
                                lastClickTimes.current.get(element.id) || 0;

                            // Only allow image toolbar on double click if tool is 'select'
                            if (
                                now - lastClickTime < 300 &&
                                tool === 'select'
                            ) {
                                console.log('Double click detected on image');
                                setImageEditingId(element.id);
                                if (!selectedElementIds.includes(element.id)) {
                                    setSelectedElementIds([element.id]);
                                }
                            }
                            lastClickTimes.current.set(element.id, now);
                        }
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
                        const lastClickTime =
                            lastClickTimes.current.get(element.id) || 0;

                        // Only allow text editing on double click if tool is 'select'
                        if (now - lastClickTime < 300 && tool === 'select') {
                            console.log('Double click detected on text');
                            if (typeof handleTextEdit === 'function') {
                                handleTextEdit(element.id);
                            }
                        }
                        lastClickTimes.current.set(element.id, now);
                    }
                }
            });
        });

        // Only clear selection if we didn't hit important elements
        // For images, only clear if tool is 'select' and we didn't hit an image,
        // or if tool is not 'select' (since images can't be selected with other tools)
        if (
            tool === 'select' &&
            !hitText &&
            !hitImage &&
            e.target === e.target.getStage()
        ) {
            setSelectedElementIds([]);
            setImageEditingId(null);
        } else if (tool !== 'select' && e.target === e.target.getStage()) {
            // Clear selections when using non-select tools and clicking on empty space
            setSelectedElementIds([]);
            setImageEditingId(null);
        }
    };

    const handleCanvasMouseDown = (
        e: KonvaEventObject<MouseEvent | TouchEvent>,
    ) => {
        console.log('Canvas.handleCanvasMouseDown', e.target.getClassName());
        if (isImageResizing) {
            console.log('Image is being resized, ignoring canvas mouse down');
            return;
        }

        // Don't interfere with curve drawing
        if (tool === 'curve') {
            onMouseDown(e);
            return;
        }

        const stage = e.target.getStage();
        if (!stage) return;

        const pos = stage.getPointerPosition();
        if (!pos) return;

        if (tool === 'select') {
            setSelectionRect(null);
            setIsSelecting(false);
            setSelectionStartPoint(null);

            const clickedOnStage = e.target === e.target.getStage();
            if (clickedOnStage) {
                console.log('Starting rectangle selection on empty space');
                setSelectionStartPoint({ x: pos.x, y: pos.y });
                setSelectionRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
                setIsSelecting(true);
                setImageEditingId(null);
            }
        }

        onMouseDown(e);
    };

    const handleCanvasMouseMove = (
        e: KonvaEventObject<MouseEvent | TouchEvent>,
    ) => {
        if (isImageResizing) return;

        const stage = e.target.getStage();
        if (!stage) return;

        const pos = stage.getPointerPosition();
        if (!pos) return;

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

        // Handle curve preview
        if (tool === 'curve' && isDrawingCurve) {
            setCurvePreviewPosition(pos);
        } else {
            setCurvePreviewPosition(null);
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

    const handleCanvasMouseUp = (
        e: KonvaEventObject<MouseEvent | TouchEvent>,
    ) => {
        if (isImageResizing) return;

        if (isSelecting && !isMoving && selectionRect && tool === 'select') {
            const selectedIds: string[] = [];
            elementsByLayer.forEach(elements => {
                elements.forEach(element => {
                    if (isElementInSelectionRect(element, selectionRect)) {
                        selectedIds.push(element.id);
                    }
                });
            });

            if (
                e.evt &&
                ((e.evt as MouseEvent).shiftKey ||
                    (e.evt as MouseEvent).ctrlKey)
            ) {
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

    const getCurrentCurve = (): CurveElement | null => {
        const activeElements =
            elementsByLayer.get(layers.find(l => l.id)?.id || '') || [];
        const currentCurve = activeElements
            .filter(el => el.type === 'curve')
            .pop();
        return (currentCurve as CurveElement) || null;
    };

    const isElementInSelectionRect = (
        element: DrawingElement,
        rect: SelectionRect,
    ): boolean => {
        if (!rect) return false;

        const rectLeft = rect.x;
        const rectRight = rect.x + rect.width;
        const rectTop = rect.y;
        const rectBottom = rect.y + rect.height;

        switch (element.type) {
            case 'rectangle':
            case 'rect': {
                const rectElement = element as RectElement | RectangleElement;
                const { x, y, width, height } = rectElement;
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
                const circleElement = element as CircleElement;
                const { x, y, radius } = circleElement;
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
                const triangleElement = element as TriangleElement;
                const { x, y, radius } = triangleElement;
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
                const imageElement = element as ImageElement;
                const { x, y, width, height } = imageElement;
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
            case 'arrow':
            case 'curve': {
                const lineElement = element as
                    | LineElement
                    | LineShapeElement
                    | ArrowElement
                    | CurveElement;
                const { points } = lineElement;
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
                const textElement = element as TextElement;
                const { x, y, width, height, fontSize, text } = textElement;
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

    const getSelectedImageId = (): string | undefined => {
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

    const getTextEditorPosition = (): Point => {
        if (!textEditingId || !stageRef.current) return { x: 0, y: 0 };

        let textElement: TextElement | null = null;
        elementsByLayer.forEach(elements => {
            const found = elements.find(el => el.id === textEditingId);
            if (found && found.type === 'text') {
                textElement = found as TextElement;
            }
        });

        if (!textElement) return { x: 0, y: 0 };

        const stage = stageRef.current;
        const containerRect = stage.container().getBoundingClientRect();
        const typedTextElement = textElement as TextElement;

        return {
            x: typedTextElement.x * scale + containerRect.left,
            y: typedTextElement.y * scale + containerRect.top,
        };
    };

    const renderContextMenu = () => {
        if (!contextMenu.isVisible) return null;

        return createPortal(
            <ContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                isVisible={contextMenu.isVisible}
                onClose={handleCloseContextMenu}
                onDeleteSelected={handleDeleteSelectedElements}
                onCopyImage={handleCopyImage}
            />,
            document.getElementById('canvas-container')!,
        );
    };

    const renderTextEditor = () => {
        if (!textEditingId) return null;

        const position = getTextEditorPosition();
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

    const renderCurveInstructions = () => {
        if (tool !== 'curve') return null;

        return (
            <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm z-10">
                {isDrawingCurve ? (
                    <div>
                        <div>
                            {dict.drawing.curveClickToAdd ||
                                'Click to add points to your curve'}
                        </div>
                        <div className="text-xs opacity-75 mt-1">
                            {dict.drawing.curveDoubleClickFinish ||
                                'Double-click or press Enter to finish'}
                        </div>
                    </div>
                ) : (
                    <div>
                        {dict.drawing.curveClickToStart ||
                            'Click to start drawing a curve'}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            id="canvas-container"
            className="flex-1 bg-slate-100 dark:bg-gray-900 overflow-auto relative">
            <ImageToolbar
                selectedImageId={imageEditingId || getSelectedImageId()}
                onClose={() => setImageEditingId(null)}
                fitImageToCanvas={fitImageToCanvas}
                fitImageToCanvasWithAspectRatio={
                    fitImageToCanvasWithAspectRatio
                }
                toggleAspectRatio={toggleAspectRatio}
            />
            {renderCurveInstructions()}
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
                        onContextMenu={handleContextMenu}
                        onDblClick={handleStageDoubleClick}
                        ref={stageRef}
                        className={`${
                            tool === 'bucket'
                                ? 'cursor-pointer'
                                : tool === 'select'
                                  ? 'cursor-default'
                                  : tool === 'curve'
                                    ? 'cursor-crosshair'
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
                                            ((window.event as KeyboardEvent)
                                                .shiftKey ||
                                                (window.event as KeyboardEvent)
                                                    .ctrlKey)
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
                                    onImageResizeEnd={handleImageResizeEnd}
                                />
                            );
                        })}

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

                        {/*Curve preview layer*/}
                        {tool === 'curve' &&
                            isDrawingCurve &&
                            curvePreviewPosition && (
                                <Layer listening={false}>
                                    {(() => {
                                        const currentCurve = getCurrentCurve();
                                        if (
                                            !currentCurve ||
                                            currentCurve.points.length < 2
                                        )
                                            return null;

                                        const lastPointIndex =
                                            currentCurve.points.length - 2;
                                        const lastX =
                                            currentCurve.points[lastPointIndex];
                                        const lastY =
                                            currentCurve.points[
                                                lastPointIndex + 1
                                            ];

                                        return (
                                            <>
                                                {/*Preview line from last point to cursor*/}
                                                <Line
                                                    points={[
                                                        lastX,
                                                        lastY,
                                                        curvePreviewPosition.x,
                                                        curvePreviewPosition.y,
                                                    ]}
                                                    stroke={color}
                                                    strokeWidth={strokeWidth}
                                                    opacity={0.5}
                                                    dash={[5, 5]}
                                                    lineCap="round"
                                                    lineJoin="round"
                                                    listening={false}
                                                />
                                                {currentCurve.points.length >=
                                                    2 && (
                                                    <Line
                                                        points={[
                                                            ...currentCurve.points,
                                                            curvePreviewPosition.x,
                                                            curvePreviewPosition.y,
                                                        ]}
                                                        stroke={color}
                                                        strokeWidth={
                                                            strokeWidth
                                                        }
                                                        opacity={0.3}
                                                        tension={0.5}
                                                        lineCap="round"
                                                        lineJoin="round"
                                                        listening={false}
                                                    />
                                                )}
                                                <Circle
                                                    x={curvePreviewPosition.x}
                                                    y={curvePreviewPosition.y}
                                                    radius={4}
                                                    fill={color}
                                                    opacity={0.7}
                                                    listening={false}
                                                />
                                            </>
                                        );
                                    })()}
                                </Layer>
                            )}

                        {/*Custom cursor for drawing tools*/}
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

                    {/*Render HTML-based image resize handles for all selected images*/}
                    {selectedElementIds.map(elementId => {
                        let imageElement: ImageElement | null = null;
                        elementsByLayer.forEach(elements => {
                            const found = elements.find(
                                el =>
                                    el.id === elementId && el.type === 'image',
                            );
                            if (found && found.type === 'image') {
                                imageElement = found as ImageElement;
                            }
                        });

                        if (imageElement) {
                            const typedImageElement =
                                imageElement as ImageElement;
                            return (
                                <ImageResizeHandles
                                    key={elementId}
                                    imageElement={{
                                        id: typedImageElement.id,
                                        x: typedImageElement.x,
                                        y: typedImageElement.y,
                                        width: typedImageElement.width,
                                        height: typedImageElement.height,
                                    }}
                                    isSelected={true}
                                    onResizeStart={handleImageResizeStart}
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
                    {renderContextMenu()}
                </div>
            </div>
        </div>
    );
};

export default Canvas;
