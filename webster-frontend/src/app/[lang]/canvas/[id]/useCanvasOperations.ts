'use client';

import { useCallback, useEffect, useRef } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { Node } from 'konva/lib/Node';
import { useHistory } from './useHistory';
import {
    RectangleElement,
    CircleElement,
    LineShapeElement,
    TriangleElement,
    LineElement,
    CurveElement,
    Resolution,
    RectElement,
    TextElement,
    ArrowElement,
    ImageElement,
    DrawingElement,
} from '@/types/elements';
import { API_URL } from '@/config';
import { useAuth, useDrawing } from '@/contexts';
import { jsPDF } from 'jspdf';
import { Stage } from 'konva/lib/Stage';

interface DownloadOptions {
    format: 'webp' | 'png' | 'jpeg' | 'pdf';
    quality?: number;
    pixelRatio?: number;
}

interface CallbacksProps {
    clearSelectionRect?: () => void;
}

interface ResizeState {
    corner: string;
    startPos: { x: number; y: number };
    originalElement: ImageElement | null;
    stage: Stage | null;
}

export const useCanvasOperations = (callbacks: CallbacksProps = {}) => {
    const { clearSelectionRect } = callbacks;
    const {
        stageRef,
        canvasWrapperRef,
        tool,
        color,
        strokeWidth,
        isDrawing,
        setIsDrawing,
        shapeFill,
        layers,
        activeLayerId,
        startPoint,
        setStartPoint,
        dimensions,
        setDimensions,
        scale,
        setSelectedResolution,
        isResizing,
        setIsResizing,
        resizeDirection,
        setResizeDirection,
        resizeStartPos,
        setResizeStartPos,
        originalDimensions,
        setOriginalDimensions,
        setResizeInitialRect,
        elementsByLayer,
        setElementsByLayer,
        getActiveLayerElements,
        updateActiveLayerElements,
        canvasId,
        canvasName,
        canvasDescription,
        backgroundColor,
        selectedElementIds,
        setSelectedElementIds,
        isMoving,
        setIsMoving,
        setTextEditingId,
        setTextValue,
        textFontSize,
        textFontFamily,
        opacity,
        setBackgroundColor,
        setTextFontFamily,
        setTextFontSize,
        setColor,
        isDrawingCurve,
        setIsDrawingCurve,
        maintainAspectRatio,
        setMaintainAspectRatio,
        setIsImageResizing,
    } = useDrawing();

    const { isAuthenticated } = useAuth();
    const { recordHistory } = useHistory();

    const currentCurveId = useRef<string | null>(null);
    const curvePoints = useRef<number[]>([]);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const lastMousePos = useRef({ x: 0, y: 0 });
    const dragOffset = useRef({ x: 0, y: 0 });

    // Image resize state
    const resizeStateRef = useRef<ResizeState>({
        corner: '',
        startPos: { x: 0, y: 0 },
        originalElement: null,
        stage: null,
    });

    // Image-related functions
    const updateImageElement = useCallback(
        (elementId: string, updates: Partial<ImageElement>) => {
            const updatedElementsByLayer = new Map(elementsByLayer);
            updatedElementsByLayer.forEach((elements, layerId) => {
                const updatedElements = elements.map(element => {
                    if (element.id === elementId && element.type === 'image') {
                        return { ...element, ...updates };
                    }
                    return element;
                });
                updatedElementsByLayer.set(layerId, updatedElements);
            });
            setElementsByLayer(updatedElementsByLayer);
        },
        [elementsByLayer, setElementsByLayer],
    );

    const getImageElement = useCallback(
        (imageId: string): ImageElement | null => {
            let imageElement: ImageElement | null = null;
            elementsByLayer.forEach(elements => {
                const found = elements.find(
                    el => el.id === imageId && el.type === 'image',
                ) as ImageElement;
                if (found) {
                    imageElement = found;
                }
            });
            return imageElement;
        },
        [elementsByLayer],
    );

    const handleImageMouseMove = useCallback(
        (e: MouseEvent | TouchEvent) => {
            if (
                !resizeStateRef.current.originalElement ||
                !resizeStateRef.current.stage
            )
                return;

            e.preventDefault();
            e.stopPropagation();

            let clientX = 0;
            let clientY = 0;
            if ('touches' in e) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            const stage = resizeStateRef.current.stage;
            const stageContainer = stage.container();
            const rect = stageContainer.getBoundingClientRect();
            const stageX = (clientX - rect.left) / stage.scaleX();
            const stageY = (clientY - rect.top) / stage.scaleY();

            const deltaX = stageX - resizeStateRef.current.startPos.x;
            const deltaY = stageY - resizeStateRef.current.startPos.y;

            const original = resizeStateRef.current.originalElement;
            let newX = original.x;
            let newY = original.y;
            let newWidth = original.width;
            let newHeight = original.height;

            const aspectRatio = original.width / original.height;
            const corner = resizeStateRef.current.corner;

            switch (corner) {
                case 'top-left':
                    newX = original.x + deltaX;
                    newY = original.y + deltaY;
                    newWidth = original.width - deltaX;
                    newHeight = original.height - deltaY;
                    if (maintainAspectRatio) {
                        const scale = Math.min(
                            newWidth / original.width,
                            newHeight / original.height,
                        );
                        newWidth = original.width * scale;
                        newHeight = original.height * scale;
                        newX = original.x + original.width - newWidth;
                        newY = original.y + original.height - newHeight;
                    }
                    break;
                case 'top-right':
                    newY = original.y + deltaY;
                    newWidth = original.width + deltaX;
                    newHeight = original.height - deltaY;
                    if (maintainAspectRatio) {
                        if (Math.abs(deltaX) > Math.abs(deltaY)) {
                            newHeight = newWidth / aspectRatio;
                            newY = original.y + original.height - newHeight;
                        } else {
                            newWidth = newHeight * aspectRatio;
                        }
                    }
                    break;
                case 'bottom-left':
                    newX = original.x + deltaX;
                    newWidth = original.width - deltaX;
                    newHeight = original.height + deltaY;
                    if (maintainAspectRatio) {
                        if (Math.abs(deltaX) > Math.abs(deltaY)) {
                            newHeight = newWidth / aspectRatio;
                        } else {
                            newWidth = newHeight * aspectRatio;
                            newX = original.x + original.width - newWidth;
                        }
                    }
                    break;
                case 'bottom-right':
                    newWidth = original.width + deltaX;
                    newHeight = original.height + deltaY;
                    if (maintainAspectRatio) {
                        if (Math.abs(deltaX) > Math.abs(deltaY)) {
                            newHeight = newWidth / aspectRatio;
                        } else {
                            newWidth = newHeight * aspectRatio;
                        }
                    }
                    break;
                case 'top-center':
                    newY = original.y + deltaY;
                    newHeight = original.height - deltaY;
                    if (maintainAspectRatio) {
                        newWidth = newHeight * aspectRatio;
                        newX = original.x - (newWidth - original.width) / 2;
                    }
                    break;
                case 'bottom-center':
                    newHeight = original.height + deltaY;
                    if (maintainAspectRatio) {
                        newWidth = newHeight * aspectRatio;
                        newX = original.x - (newWidth - original.width) / 2;
                    }
                    break;
                case 'left-center':
                    newX = original.x + deltaX;
                    newWidth = original.width - deltaX;
                    if (maintainAspectRatio) {
                        newHeight = newWidth / aspectRatio;
                        newY = original.y - (newHeight - original.height) / 2;
                    }
                    break;
                case 'right-center':
                    newWidth = original.width + deltaX;
                    if (maintainAspectRatio) {
                        newHeight = newWidth / aspectRatio;
                        newY = original.y - (newHeight - original.height) / 2;
                    }
                    break;
            }

            newWidth = Math.max(20, newWidth);
            newHeight = Math.max(20, newHeight);

            updateImageElement(original.id, {
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight,
            });
        },
        [maintainAspectRatio, updateImageElement],
    );

    // Also update the handleImageMouseUp function to record history after resize
    const handleImageMouseUp = useCallback(() => {
        console.log('Image resize ended');
        setIsImageResizing(false);

        // Record history after image resize is complete
        recordHistory();

        resizeStateRef.current = {
            corner: '',
            startPos: { x: 0, y: 0 },
            originalElement: null,
            stage: null,
        };

        document.removeEventListener('mousemove', handleImageMouseMove);
        document.removeEventListener('mouseup', handleImageMouseUp);
        document.removeEventListener('touchmove', handleImageMouseMove);
        document.removeEventListener('touchend', handleImageMouseUp);
    }, [handleImageMouseMove, recordHistory]);

    const handleImageResizeStart = useCallback(
        (corner: string, e: KonvaEventObject<MouseEvent | TouchEvent>) => {
            console.log('Image resize started for corner:', corner);

            const hasLockedElement = selectedElementIds.some(id => {
                for (const [layerId, elements] of elementsByLayer.entries()) {
                    const element = elements.find(el => el.id === id);
                    if (element) {
                        const layer = layers.find(l => l.id === layerId);
                        return layer?.locked || false;
                    }
                }
                return false;
            });

            if (hasLockedElement) {
                console.log('Cannot resize image: layer is locked');
                return;
            }

            if (e.evt) {
                e.evt.preventDefault();
                e.evt.stopPropagation();
            }

            const stage = e.target.getStage();
            if (!stage) {
                console.error('No stage found');
                return;
            }

            const pos = stage.getPointerPosition();
            if (!pos) {
                console.error('No pointer position found');
                return;
            }

            let imageElement: ImageElement | null = null;
            selectedElementIds.forEach(id => {
                const element = getImageElement(id);
                if (element) {
                    imageElement = element;
                }
            });

            if (!imageElement) {
                console.error('No image element found for resize');
                return;
            }

            resizeStateRef.current = {
                corner,
                startPos: pos,
                originalElement: JSON.parse(JSON.stringify(imageElement)),
                stage,
            };

            setIsImageResizing(true);

            document.addEventListener('mousemove', handleImageMouseMove, {
                passive: false,
            });
            document.addEventListener('mouseup', handleImageMouseUp);
            document.addEventListener('touchmove', handleImageMouseMove, {
                passive: false,
            });
            document.addEventListener('touchend', handleImageMouseUp);

            return false;
        },
        [
            selectedElementIds,
            getImageElement,
            handleImageMouseMove,
            handleImageMouseUp,
            elementsByLayer,
            layers,
        ],
    );

    const fitImageToCanvas = useCallback(
        (imageId: string) => {
            updateImageElement(imageId, {
                x: 0,
                y: 0,
                width: dimensions.width,
                height: dimensions.height,
            });
            // Record history after image transformation
            recordHistory();
        },
        [updateImageElement, dimensions, recordHistory],
    );

    const fitImageToCanvasWithAspectRatio = useCallback(
        (imageId: string) => {
            const imageElement = getImageElement(imageId);
            if (!imageElement) return;

            const imageAspectRatio = imageElement.width / imageElement.height;
            const canvasAspectRatio = dimensions.width / dimensions.height;

            let newWidth: number;
            let newHeight: number;
            let newX: number;
            let newY: number;

            if (imageAspectRatio > canvasAspectRatio) {
                newWidth = dimensions.width;
                newHeight = dimensions.width / imageAspectRatio;
                newX = 0;
                newY = (dimensions.height - newHeight) / 2;
            } else {
                newHeight = dimensions.height;
                newWidth = dimensions.height * imageAspectRatio;
                newX = (dimensions.width - newWidth) / 2;
                newY = 0;
            }

            updateImageElement(imageId, {
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight,
            });
            // Record history after image transformation
            recordHistory();
        },
        [getImageElement, updateImageElement, dimensions, recordHistory],
    );

    // Make sure to add recordHistory to the dependencies
    const toggleAspectRatio = useCallback(() => {
        setMaintainAspectRatio(prev => !prev);
        // Note: This doesn't modify the canvas directly, so no history recording needed
        // History will be recorded when the user actually resizes an image with the new setting
    }, [setMaintainAspectRatio]);

    // Rest of the existing functions remain the same...
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
            document.removeEventListener('touchmove', handleResizeMove);
            document.removeEventListener('touchend', handleResizeEnd);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                tool === 'curve' &&
                isDrawingCurve &&
                (e.key === 'Enter' || e.key === 'Escape')
            ) {
                finishCurve();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [tool, isDrawingCurve]);

    const finishCurve = () => {
        if (
            isDrawingCurve &&
            currentCurveId.current &&
            curvePoints.current.length >= 4
        ) {
            recordHistory();
        }
        setIsDrawingCurve(false);
        currentCurveId.current = null;
        curvePoints.current = [];
    };

    const addPointToCurve = (x: number, y: number) => {
        const activeElements = getActiveLayerElements();

        if (!isDrawingCurve) {
            const newCurve: CurveElement = {
                id: Date.now().toString(),
                type: 'curve',
                points: [x, y],
                stroke: color,
                strokeWidth,
                layerId: activeLayerId,
                opacity: opacity || 1,
                tension: 0.5,
                lineCap: 'round',
                lineJoin: 'round',
            };

            console.log('Adding new curve:', newCurve);
            setIsDrawingCurve(true);
            currentCurveId.current = newCurve.id;
            curvePoints.current = [x, y];

            const updatedElements = [...activeElements, newCurve];
            updateActiveLayerElements(updatedElements);
        } else {
            console.log('Adding point to existing curve:', x, y);
            const newPoints = [...curvePoints.current, x, y];
            curvePoints.current = newPoints;

            const updatedElements = activeElements.map(element => {
                if (
                    element.id === currentCurveId.current &&
                    element.type === 'curve'
                ) {
                    return { ...element, points: newPoints } as CurveElement;
                }
                return element;
            });
            updateActiveLayerElements(updatedElements);

            if (newPoints.length >= 6) {
                const startX = newPoints[0];
                const startY = newPoints[1];
                const distance = Math.sqrt(
                    (x - startX) ** 2 + (y - startY) ** 2,
                );

                if (distance < 20) {
                    const closedPoints = [...newPoints, startX, startY];
                    const updatedElementsWithClosure = activeElements.map(
                        element => {
                            if (
                                element.id === currentCurveId.current &&
                                element.type === 'curve'
                            ) {
                                return {
                                    ...element,
                                    points: closedPoints,
                                    closed: true,
                                } as CurveElement;
                            }
                            return element;
                        },
                    );
                    updateActiveLayerElements(updatedElementsWithClosure);
                    finishCurve();
                }
            }
        }
    };

    const handleStageDoubleClick = (
        e: KonvaEventObject<MouseEvent | TouchEvent>,
    ) => {
        if (tool === 'curve' && isDrawingCurve) {
            finishCurve();
            e.cancelBubble = true;
        }
    };

    const handleEraserClick = (
        e: KonvaEventObject<MouseEvent | TouchEvent>,
    ): boolean => {
        const stage = e.target.getStage();
        if (!stage) return false;

        const pos = stage.getPointerPosition();
        if (!pos) return false;

        const shapes = stage.getAllIntersections(pos);
        const targetShapes = shapes.filter(
            (shape: Node) =>
                shape !== stage &&
                shape.getClassName() !== 'Stage' &&
                (shape.getClassName() === 'Rect' ||
                    shape.getClassName() === 'Circle' ||
                    shape.getClassName() === 'Line' ||
                    shape.getClassName() === 'Arrow' ||
                    shape.getClassName() === 'RegularPolygon' ||
                    shape.getClassName() === 'Text' ||
                    shape.getClassName() === 'Image'),
        );

        let elementToRemove: DrawingElement | null = null;
        let elementLayerId: string | null = null;

        if (targetShapes.length > 0) {
            for (const shape of targetShapes) {
                const shapeId = shape.attrs.id;
                if (shapeId) {
                    elementsByLayer.forEach((elements, layerId) => {
                        const element = elements.find(el => el.id === shapeId);
                        if (element) {
                            elementToRemove = element;
                            elementLayerId = layerId;
                        }
                    });
                    if (elementToRemove) break;
                }
            }
        }

        if (!elementToRemove) {
            elementsByLayer.forEach((elements, layerId) => {
                elements.forEach(element => {
                    if (isPointInElement(pos.x, pos.y, element)) {
                        elementToRemove = element;
                        elementLayerId = layerId;
                    }
                });
            });
        }

        if (elementToRemove && elementLayerId) {
            const elementLayer = layers.find(l => l.id === elementLayerId);
            if (elementLayer?.locked) {
                console.log('Cannot erase element: layer is locked');
                return false;
            }

            const updatedElementsByLayer = new Map(elementsByLayer);
            const layerElements =
                updatedElementsByLayer.get(elementLayerId) || [];
            const elementToRemoveId = (elementToRemove as DrawingElement).id;
            const updatedElements = layerElements.filter(
                el => el.id !== elementToRemoveId,
            );
            updatedElementsByLayer.set(elementLayerId, updatedElements);
            setElementsByLayer(updatedElementsByLayer);

            if (selectedElementIds.includes(elementToRemoveId)) {
                setSelectedElementIds(
                    selectedElementIds.filter(id => id !== elementToRemoveId),
                );
            }

            recordHistory();
            return true;
        }

        return false;
    };

    const isElementLayerLocked = (elementId: string): boolean => {
        for (const [layerId, elements] of elementsByLayer.entries()) {
            const element = elements.find(el => el.id === elementId);
            if (element) {
                const layer = layers.find(l => l.id === layerId);
                return layer?.locked || false;
            }
        }
        return false;
    };

    const isTextElement = (element: DrawingElement): element is TextElement => {
        return element.type === 'text';
    };

    const handleTextEdit = (id: string) => {
        if (isElementLayerLocked(id)) {
            console.log('Cannot edit text: layer is locked');
            return;
        }

        let textElement: TextElement | null = null;
        for (const [, elements] of elementsByLayer.entries()) {
            const found = elements.find(el => el.id === id);
            if (found && isTextElement(found)) {
                textElement = found;
                break;
            }
        }

        if (textElement) {
            setTextEditingId(id);
            setTextValue(textElement.text);
            setTextFontSize(textElement.fontSize || 20);
            setTextFontFamily(textElement.fontFamily || 'Arial');
            setColor(textElement.fill || '#000000');
        }
    };

    const handleTextEditDone = (
        id: string,
        value: string,
        fontSize: number,
        fontFamily: string,
        color: string,
    ) => {
        let originalElement: TextElement | null = null;
        for (const [, elements] of elementsByLayer.entries()) {
            const found = elements.find(el => el.id === id);
            if (found && isTextElement(found)) {
                originalElement = found;
                break;
            }
        }

        const hasChanges =
            originalElement &&
            (originalElement.text !== value ||
                originalElement.fontSize !== fontSize ||
                originalElement.fontFamily !== fontFamily ||
                originalElement.fill !== color);

        console.log(
            'hasChanges:',
            hasChanges,
            'originalText:',
            originalElement?.text,
            'newText:',
            value,
        );

        const updatedElementsByLayer = new Map(elementsByLayer);
        updatedElementsByLayer.forEach((elements, layerId) => {
            const updatedElements = elements.map(element => {
                if (element.id === id && isTextElement(element)) {
                    return {
                        ...element,
                        text: value,
                        fontSize: fontSize,
                        fontFamily: fontFamily,
                        fill: color,
                    };
                }
                return element;
            });
            updatedElementsByLayer.set(layerId, updatedElements);
        });

        setElementsByLayer(updatedElementsByLayer);
        setTextEditingId(null);
        setTextValue('');

        if (hasChanges) {
            recordHistory(undefined, updatedElementsByLayer);
        }
    };

    const handleMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
        console.log('--------');
        console.log(
            'useCanvasOperations handleMouseDown',
            e.target.getClassName(),
        );

        const stage = e.target.getStage();
        if (!stage) return;

        const pos = stage.getPointerPosition();
        if (!pos) return;

        const activeLayer = layers.find(layer => layer.id === activeLayerId);
        if (!activeLayer || !activeLayer.visible || activeLayer.locked) return;

        if (
            e.target.getClassName() === 'Circle' &&
            e.target.attrs.fill === 'white' &&
            e.target.attrs.stroke === '#0066FF' &&
            e.target.parent &&
            e.target.parent.attrs &&
            e.target.parent.attrs.name === 'image-resize-handles'
        ) {
            console.log('Clicked on resize handle, skipping canvas operations');
            return;
        }

        if (tool === 'curve') {
            if (e.target === stage) {
                addPointToCurve(pos.x, pos.y);
            }
            return;
        }

        if (tool === 'eraser') {
            handleEraserClick(e);
            return;
        }

        if (tool === 'text') {
            const newText: TextElement = {
                x: pos.x,
                y: pos.y,
                text: 'Click to edit',
                fontSize: textFontSize,
                fontFamily: textFontFamily,
                fill: color,
                id: Date.now().toString(),
                type: 'text',
                layerId: activeLayerId,
            };

            const activeElements = getActiveLayerElements();
            const updatedElements = [...activeElements, newText];
            updateActiveLayerElements(updatedElements);

            const updatedElementsByLayer = new Map(elementsByLayer);
            updatedElementsByLayer.set(activeLayerId, updatedElements);
            recordHistory(undefined, updatedElementsByLayer);

            setTextEditingId(newText.id);
            setTextValue('Click to edit');
            return;
        }

        if (tool === 'image') {
            return;
        }

        if (tool === 'select') {
            const shapes = stage.getAllIntersections(pos);
            const targetShapes = shapes.filter((shape: Node) => {
                if (
                    shape === stage ||
                    shape.getClassName() === 'Stage' ||
                    (shape.getClassName() === 'Circle' &&
                        shape.attrs.fill === 'white' &&
                        shape.attrs.stroke === '#0066FF' &&
                        shape.parent?.attrs?.name === 'image-resize-handles')
                ) {
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

            if (targetShapes.length > 0) {
                let foundElement: DrawingElement | null = null;
                let foundElementId: string | null = null;

                for (let i = targetShapes.length - 1; i >= 0; i--) {
                    const shape = targetShapes[i];
                    const shapeId = shape.attrs.id;
                    if (!shapeId) continue;

                    for (const [, elements] of Array.from(
                        elementsByLayer.entries(),
                    )) {
                        const element = elements.find(el => el.id === shapeId);
                        if (element) {
                            foundElement = element;
                            foundElementId = shapeId;
                            break;
                        }
                    }
                    if (foundElement) break;
                }

                if (foundElement && foundElementId) {
                    if (isElementLayerLocked(foundElementId)) {
                        console.log('Cannot select element: layer is locked');
                        return;
                    }

                    const isShiftPressed =
                        e.evt && (e.evt.shiftKey || e.evt.ctrlKey);

                    if (isShiftPressed) {
                        const newSelectedIds = [...selectedElementIds];
                        const index = newSelectedIds.indexOf(foundElementId);
                        if (index !== -1) {
                            newSelectedIds.splice(index, 1);
                        } else {
                            newSelectedIds.push(foundElementId);
                        }
                        setSelectedElementIds(newSelectedIds);
                    } else {
                        if (!selectedElementIds.includes(foundElementId)) {
                            setSelectedElementIds([foundElementId]);
                        }
                    }

                    if (clearSelectionRect) {
                        clearSelectionRect();
                    }

                    setIsMoving(true);
                    dragStartPos.current = pos;
                    lastMousePos.current = pos;
                    dragOffset.current = { x: 0, y: 0 };
                } else if (!e.evt.shiftKey) {
                    setSelectedElementIds([]);
                }
            } else {
                if (!e.evt.shiftKey) {
                    setSelectedElementIds([]);
                }
            }
            return;
        }

        if (tool === 'bucket') {
            handleBucketClick(Math.floor(pos.x), Math.floor(pos.y));
            return;
        }

        if (
            tool === 'rectangle' ||
            tool === 'circle' ||
            tool === 'line' ||
            tool === 'triangle' ||
            tool === 'arrow'
        ) {
            setStartPoint({ x: pos.x, y: pos.y });

            if (tool === 'rectangle') {
                const newRect: RectangleElement = {
                    x: pos.x,
                    y: pos.y,
                    width: 0,
                    height: 0,
                    fill: shapeFill ? color : 'transparent',
                    stroke: color,
                    strokeWidth,
                    id: Date.now().toString(),
                    type: 'rectangle',
                    layerId: activeLayerId,
                    opacity: opacity,
                };

                const activeElements = getActiveLayerElements();
                const updatedElements = [...activeElements, newRect];
                updateActiveLayerElements(updatedElements);
            } else if (tool === 'circle') {
                const newCircle: CircleElement = {
                    x: pos.x,
                    y: pos.y,
                    radius: 0,
                    fill: shapeFill ? color : 'transparent',
                    stroke: color,
                    strokeWidth,
                    id: Date.now().toString(),
                    type: 'circle',
                    layerId: activeLayerId,
                    opacity: opacity,
                };

                const activeElements = getActiveLayerElements();
                const updatedElements = [...activeElements, newCircle];
                updateActiveLayerElements(updatedElements);
            } else if (tool === 'line') {
                const newLine: LineShapeElement = {
                    points: [pos.x, pos.y, pos.x, pos.y],
                    stroke: color,
                    strokeWidth,
                    id: Date.now().toString(),
                    type: 'line-shape',
                    layerId: activeLayerId,
                    opacity: opacity,
                };

                const activeElements = getActiveLayerElements();
                const updatedElements = [...activeElements, newLine];
                updateActiveLayerElements(updatedElements);
            } else if (tool === 'triangle') {
                const newTriangle: TriangleElement = {
                    x: pos.x,
                    y: pos.y,
                    sides: 3,
                    radius: 0,
                    fill: shapeFill ? color : 'transparent',
                    stroke: color,
                    strokeWidth,
                    id: Date.now().toString(),
                    type: 'triangle',
                    layerId: activeLayerId,
                    opacity: opacity,
                };

                const activeElements = getActiveLayerElements();
                const updatedElements = [...activeElements, newTriangle];
                updateActiveLayerElements(updatedElements);
            } else if (tool === 'arrow') {
                const newArrow: ArrowElement = {
                    points: [pos.x, pos.y, pos.x, pos.y],
                    stroke: color,
                    strokeWidth,
                    id: Date.now().toString(),
                    type: 'arrow',
                    layerId: activeLayerId,
                    opacity: opacity,
                };

                const activeElements = getActiveLayerElements();
                const updatedElements = [...activeElements, newArrow];
                updateActiveLayerElements(updatedElements);
            }

            setIsDrawing(true);
            return;
        }

        setIsDrawing(true);

        function getOpacity(tool: string): number {
            switch (tool) {
                case 'pen':
                    return 1.0;
                case 'pencil':
                    return 0.8;
                case 'marker':
                    return 0.3;
                case 'brush':
                    return 0.6;
                default:
                    return 1.0;
            }
        }

        function getShadowBlur(tool: string): number {
            if (tool === 'brush') return 4;
            return 0;
        }

        function getShadowColor(tool: string): string | undefined {
            return tool === 'brush' ? '#000000' : undefined;
        }

        function getDashStyle(tool: string): number[] | undefined {
            switch (tool) {
                case 'pencil':
                    return [1, 2];
                case 'brush':
                    return [5, 4, 1, 3];
                default:
                    return undefined;
            }
        }

        function getTension(tool: string): number {
            switch (tool) {
                case 'pen':
                    return 0.5;
                case 'pencil':
                case 'brush':
                    return 0.2;
                case 'marker':
                    return 0.3;
                default:
                    return 0.5;
            }
        }

        const newLine: LineElement = {
            points: [pos.x, pos.y],
            stroke: color,
            strokeWidth,
            tension: getTension(tool),
            lineCap: 'round',
            lineJoin: 'round',
            globalCompositeOperation: 'source-over',
            id: Date.now().toString(),
            type: 'line',
            layerId: activeLayerId,
            opacity: getOpacity(tool),
            shadowColor: getShadowColor(tool),
            shadowBlur: getShadowBlur(tool),
            dash: getDashStyle(tool),
        };

        const activeElements = getActiveLayerElements();
        const updatedElements = [...activeElements, newLine];
        updateActiveLayerElements(updatedElements);
    };

    const handleMouseMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
        if (!isDrawing && !isMoving) return;

        const activeLayer = layers.find(layer => layer.id === activeLayerId);
        if (!activeLayer || !activeLayer.visible || activeLayer.locked) return;

        const stage = e.target.getStage();
        if (!stage) return;

        const point = stage.getPointerPosition();
        if (!point) return;

        const pos = stage.getPointerPosition();
        if (!pos) return;

        if (isMoving && selectedElementIds.length > 0) {
            const hasLockedElement = selectedElementIds.some(id =>
                isElementLayerLocked(id),
            );

            if (hasLockedElement) {
                console.log(
                    'Cannot move elements: one or more layers are locked',
                );
                return;
            }

            const dx = pos.x - lastMousePos.current.x;
            const dy = pos.y - lastMousePos.current.y;

            dragOffset.current.x += dx;
            dragOffset.current.y += dy;

            const updatedElementsByLayer = new Map(elementsByLayer);
            updatedElementsByLayer.forEach((elements, layerId) => {
                const updatedElements = elements.map(element => {
                    if (!selectedElementIds.includes(element.id)) {
                        return element;
                    }

                    switch (element.type) {
                        case 'line':
                        case 'arrow':
                            const lineElement = element as LineElement;
                            const newPoints = [...lineElement.points];
                            for (let i = 0; i < newPoints.length; i += 2) {
                                newPoints[i] += dx;
                                newPoints[i + 1] += dy;
                            }
                            return { ...lineElement, points: newPoints };

                        case 'curve':
                            const curveElement = element as CurveElement;
                            const newCurvePoints = [...curveElement.points];
                            for (let i = 0; i < newCurvePoints.length; i += 2) {
                                newCurvePoints[i] += dx;
                                newCurvePoints[i + 1] += dy;
                            }
                            return { ...curveElement, points: newCurvePoints };

                        case 'rectangle':
                        case 'rect':
                            const rectElement = element as
                                | RectangleElement
                                | RectElement;
                            return {
                                ...rectElement,
                                x: rectElement.x + dx,
                                y: rectElement.y + dy,
                            };

                        case 'circle':
                            const circleElement = element as CircleElement;
                            return {
                                ...circleElement,
                                x: circleElement.x + dx,
                                y: circleElement.y + dy,
                            };

                        case 'triangle':
                            const triangleElement = element as TriangleElement;
                            return {
                                ...triangleElement,
                                x: triangleElement.x + dx,
                                y: triangleElement.y + dy,
                            };

                        case 'text':
                            const textElement = element as TextElement;
                            return {
                                ...textElement,
                                x: textElement.x + dx,
                                y: textElement.y + dy,
                            };

                        case 'image':
                            const imageElement = element as ImageElement;
                            return {
                                ...imageElement,
                                x: imageElement.x + dx,
                                y: imageElement.y + dy,
                            };

                        case 'line-shape':
                            const lineShapeElement =
                                element as LineShapeElement;
                            const newLinePoints = [...lineShapeElement.points];
                            for (let i = 0; i < newLinePoints.length; i += 2) {
                                newLinePoints[i] += dx;
                                newLinePoints[i + 1] += dy;
                            }
                            return {
                                ...lineShapeElement,
                                points: newLinePoints,
                            };

                        default:
                            return element;
                    }
                });
                updatedElementsByLayer.set(layerId, updatedElements);
            });

            setElementsByLayer(updatedElementsByLayer);
            lastMousePos.current = pos;
            return;
        }

        const activeElements = getActiveLayerElements();
        if (activeElements.length === 0) return;

        const lastElement = activeElements[activeElements.length - 1];

        if (tool === 'rectangle' && lastElement.type === 'rectangle') {
            if (!startPoint) return;

            const updatedRect: RectangleElement = {
                ...(lastElement as RectangleElement),
                width: point.x - startPoint.x,
                height: point.y - startPoint.y,
            };

            const updatedElements = [
                ...activeElements.slice(0, -1),
                updatedRect,
            ];
            updateActiveLayerElements(updatedElements);
            return;
        }

        if (tool === 'circle' && lastElement.type === 'circle') {
            if (!startPoint) return;

            const dx = point.x - startPoint.x;
            const dy = point.y - startPoint.y;
            const radius = Math.sqrt(dx * dx + dy * dy);

            const updatedCircle: CircleElement = {
                ...(lastElement as CircleElement),
                radius,
            };

            const updatedElements = [
                ...activeElements.slice(0, -1),
                updatedCircle,
            ];
            updateActiveLayerElements(updatedElements);
            return;
        }

        if (tool === 'line' && lastElement.type === 'line-shape') {
            if (!startPoint) return;

            const updatedLine: LineShapeElement = {
                ...(lastElement as LineShapeElement),
                points: [startPoint.x, startPoint.y, point.x, point.y],
            };

            const updatedElements = [
                ...activeElements.slice(0, -1),
                updatedLine,
            ];
            updateActiveLayerElements(updatedElements);
            return;
        }

        if (tool === 'arrow' && lastElement.type === 'arrow') {
            if (!startPoint) return;

            const updatedArrow: ArrowElement = {
                ...(lastElement as ArrowElement),
                points: [startPoint.x, startPoint.y, pos.x, pos.y],
            };

            const updatedElements = [
                ...activeElements.slice(0, -1),
                updatedArrow,
            ];
            updateActiveLayerElements(updatedElements);
            return;
        }

        if (tool === 'triangle' && lastElement.type === 'triangle') {
            if (!startPoint) return;

            const dx = point.x - startPoint.x;
            const dy = point.y - startPoint.y;
            const radius = Math.sqrt(dx * dx + dy * dy);

            const updatedTriangle: TriangleElement = {
                ...(lastElement as TriangleElement),
                radius,
            };

            const updatedElements = [
                ...activeElements.slice(0, -1),
                updatedTriangle,
            ];
            updateActiveLayerElements(updatedElements);
            return;
        }

        if (lastElement.type === 'line') {
            const lineElement = lastElement as LineElement;
            lineElement.points = lineElement.points.concat([point.x, point.y]);

            const updatedElements = [
                ...activeElements.slice(0, -1),
                lineElement,
            ];
            updateActiveLayerElements(updatedElements);
        }
    };

    const handleMouseUp = () => {
        if (isMoving) {
            setIsMoving(false);
            dragOffset.current = { x: 0, y: 0 };
            recordHistory();
        }

        setIsDrawing(false);
        setStartPoint(null);

        if (isDrawing) {
            recordHistory();
        }
    };

    const handleBucketClick = (x: number, y: number) => {
        if (!stageRef.current) return;

        const stage = stageRef.current;
        const pos = { x: Math.floor(x), y: Math.floor(y) };

        const shapes = stage.getAllIntersections(pos);
        const targetShapes = shapes.filter(
            (shape: Node) =>
                shape !== stage && shape.getClassName() !== 'Stage',
        );

        if (
            targetShapes.length === 0 ||
            (targetShapes.length === 1 &&
                targetShapes[0].getAttrs().y === 0 &&
                targetShapes[0].getAttrs().x === 0 &&
                targetShapes[0].getAttrs().width === dimensions.width &&
                targetShapes[0].getAttrs().height === dimensions.height)
        ) {
            setBackgroundColor(color);
            recordHistory(color);
            return;
        }

        let targetElement: DrawingElement | null = null;
        let targetLayerId: string | null = null;
        let targetElementIdx = -1;

        for (let i = targetShapes.length - 1; i >= 0; i--) {
            const shape = targetShapes[i];
            const shapeId = shape.attrs.id;
            if (!shapeId) continue;

            for (const [layerId, elements] of elementsByLayer.entries()) {
                const elementIdx = elements.findIndex(el => el.id === shapeId);
                if (elementIdx !== -1) {
                    const element = elements[elementIdx];
                    const layer = layers.find(l => l.id === layerId);
                    if (layer?.locked) {
                        console.log('Cannot fill element: layer is locked');
                        continue;
                    }

                    if (
                        ['rectangle', 'rect', 'circle', 'triangle'].includes(
                            element.type,
                        )
                    ) {
                        targetElement = element;
                        targetLayerId = layerId;
                        targetElementIdx = elementIdx;
                        break;
                    }
                }
            }
            if (targetElement) break;
        }

        if (targetElement && targetLayerId && targetElementIdx !== -1) {
            console.log(
                `Filling ${targetElement.type} element with color ${color}`,
            );

            const updatedElementsByLayer = new Map(elementsByLayer);
            const layerElements =
                updatedElementsByLayer.get(targetLayerId) || [];
            const updatedElements = [...layerElements];
            updatedElements[targetElementIdx] = {
                ...targetElement,
                fill: color,
            } as DrawingElement;

            updatedElementsByLayer.set(targetLayerId, updatedElements);
            setElementsByLayer(updatedElementsByLayer);
            recordHistory();
            return;
        }

        console.log('Bucket tool: No fillable element found at this position');
    };

    const isPointInElement = (
        x: number,
        y: number,
        element: DrawingElement,
    ): boolean => {
        switch (element.type) {
            case 'rectangle':
            case 'rect': {
                const { x: ex, y: ey, width, height } = element;
                return (
                    x >= ex && x <= ex + width && y >= ey && y <= ey + height
                );
            }
            case 'circle': {
                const { x: ex, y: ey, radius } = element;
                const dx = x - ex;
                const dy = y - ey;
                return dx * dx + dy * dy <= radius * radius;
            }
            case 'triangle': {
                const { x: ex, y: ey, radius } = element;
                const dx = x - ex;
                const dy = y - ey;
                return dx * dx + dy * dy <= radius * radius;
            }
            case 'image': {
                const { x: ex, y: ey, width, height } = element;
                return (
                    x >= ex && x <= ex + width && y >= ey && y <= ey + height
                );
            }
            case 'line':
            case 'line-shape':
            case 'arrow':
            case 'curve': {
                const { points } = element;
                for (let i = 0; i < points.length - 2; i += 2) {
                    const x1 = points[i];
                    const y1 = points[i + 1];
                    const x2 = points[i + 2];
                    const y2 = points[i + 3];
                    const distToSegment = distanceToLineSegment(
                        x1,
                        y1,
                        x2,
                        y2,
                        x,
                        y,
                    );
                    if (distToSegment <= 5) {
                        return true;
                    }
                }
                return false;
            }
            default:
                return false;
        }
    };

    const distanceToLineSegment = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        x: number,
        y: number,
    ): number => {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq !== 0) {
            param = dot / len_sq;
        }

        let xx: number, yy: number;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = x - xx;
        const dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleResizeStart = (
        direction: string,
        e: React.MouseEvent | React.TouchEvent,
    ) => {
        e.preventDefault();
        e.stopPropagation();

        let clientX = 0;
        let clientY = 0;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const canvasRect =
            canvasWrapperRef.current?.getBoundingClientRect() || {
                left: 0,
                top: 0,
                width: dimensions.width * scale,
                height: dimensions.height * scale,
            };

        setIsResizing(true);
        setResizeDirection(direction);
        setResizeStartPos({ x: clientX, y: clientY });
        setOriginalDimensions({ ...dimensions });
        setResizeInitialRect({
            x: canvasRect.left,
            y: canvasRect.top,
            width: canvasRect.width,
            height: canvasRect.height,
        });

        document.addEventListener('mousemove', handleResizeMove);
        document.addEventListener('mouseup', handleResizeEnd);
        document.addEventListener('touchmove', handleResizeMove);
        document.addEventListener('touchend', handleResizeEnd);
    };

    const handleResizeMove = useCallback(
        (e: MouseEvent | TouchEvent) => {
            if (!isResizing) return;

            let clientX = 0;
            let clientY = 0;
            if ('touches' in e) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            const deltaX = (clientX - resizeStartPos.x) / scale;
            const deltaY = (clientY - resizeStartPos.y) / scale;

            let newWidth = originalDimensions.width;
            let newHeight = originalDimensions.height;

            if (resizeDirection.includes('right')) {
                newWidth = Math.max(100, originalDimensions.width + deltaX);
            } else if (resizeDirection.includes('left')) {
                newWidth = Math.max(100, originalDimensions.width - deltaX);
            }

            if (resizeDirection.includes('bottom')) {
                newHeight = Math.max(100, originalDimensions.height + deltaY);
            } else if (resizeDirection.includes('top')) {
                newHeight = Math.max(100, originalDimensions.height - deltaY);
            }

            setDimensions({
                width: Math.round(newWidth),
                height: Math.round(newHeight),
            });
        },
        [isResizing, dimensions, handleMouseDown],
    );

    const handleResizeEnd = useCallback(() => {
        if (!isResizing) return;

        setIsResizing(false);

        const customResolution: Resolution = {
            name: `Custom (${Math.round(dimensions.width)}×${Math.round(
                dimensions.height,
            )})`,
            width: Math.round(dimensions.width),
            height: Math.round(dimensions.height),
        };

        setSelectedResolution(customResolution);
        recordHistory();

        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.removeEventListener('touchmove', handleResizeMove);
        document.removeEventListener('touchend', handleResizeEnd);
    }, [isResizing, dimensions, handleResizeMove]);

    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleResizeMove);
            document.addEventListener('mouseup', handleResizeEnd);
        }
        return () => {
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
        };
    }, [isResizing, handleResizeMove, handleResizeEnd]);

    const handleResolutionChange = (resolution: Resolution) => {
        setSelectedResolution(resolution);
        setDimensions({ width: resolution.width, height: resolution.height });
        recordHistory();
    };

    const handleSave = async () => {
        if (!stageRef.current) {
            console.error('Cannot save: Stage reference not available');
            return { success: false, message: 'Failed to save canvas' };
        }

        try {
            const thumbnailDataURL = stageRef.current.toDataURL({
                pixelRatio: 0.5,
                mimeType: 'image/jpeg',
                quality: 0.8,
            });

            const elementsObject: Record<string, DrawingElement[]> = {};
            elementsByLayer.forEach((elements, layerId) => {
                elementsObject[layerId] = elements;
            });

            const canvasData = {
                name: canvasName || 'Untitled Design',
                width: dimensions.width,
                height: dimensions.height,
                description: canvasDescription,
                backgroundColor: backgroundColor,
                layers,
                elementsByLayer: elementsObject,
                thumbnail: thumbnailDataURL,
                lastModified: new Date().toISOString(),
            };

            if (!isAuthenticated) {
                localStorage.setItem(
                    'local_canvas_data',
                    JSON.stringify(canvasData),
                );
                return {
                    success: true,
                    message: 'Drawing saved locally! Sign in to save to cloud.',
                    isLocal: true,
                };
            }

            const url = canvasId
                ? `${API_URL}/canvases/${canvasId}`
                : `${API_URL}/canvases`;
            const method = canvasId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                },
                body: JSON.stringify(canvasData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save canvas');
            }

            const result = await response.json();
            return {
                success: true,
                message: 'Drawing saved successfully!',
                isLocal: false,
                canvasId: result.data?.id || canvasId,
            };
        } catch (error) {
            console.error('Error saving canvas:', error);

            if (isAuthenticated) {
                try {
                    const thumbnailDataURL = stageRef.current.toDataURL({
                        pixelRatio: 0.5,
                        mimeType: 'image/jpeg',
                        quality: 0.8,
                    });

                    const elementsObject: Record<string, DrawingElement[]> = {};
                    elementsByLayer.forEach((elements, layerId) => {
                        elementsObject[layerId] = elements;
                    });

                    const canvasData = {
                        name: canvasName || 'Untitled Design',
                        width: dimensions.width,
                        height: dimensions.height,
                        description: canvasDescription,
                        backgroundColor: backgroundColor,
                        layers,
                        elementsByLayer: elementsObject,
                        thumbnail: thumbnailDataURL,
                        lastModified: new Date().toISOString(),
                    };

                    localStorage.setItem(
                        'backup_canvas_data',
                        JSON.stringify(canvasData),
                    );

                    return {
                        success: false,
                        message: `Failed to save to cloud: ${
                            error instanceof Error
                                ? error.message
                                : 'Unknown error'
                        }. A local backup was created.`,
                        isLocal: true,
                    };
                } catch {
                    return {
                        success: false,
                        message: `Failed to save canvas: ${
                            error instanceof Error
                                ? error.message
                                : 'Unknown error'
                        }`,
                    };
                }
            }

            return {
                success: false,
                message: `Failed to save canvas: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
            };
        }
    };

    const handleDownload = ({
        format,
        quality = 1,
        pixelRatio = 2,
    }: DownloadOptions) => {
        if (!stageRef.current) return;

        const stage = stageRef.current;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `PixelPerfect_Drawing_${timestamp}.${format}`;

        try {
            if (format === 'pdf') {
                const dataURL = stage.toDataURL({ pixelRatio });
                const img = new Image();
                img.src = dataURL;
                img.onload = () => {
                    const { width, height } = stage.size();
                    const pdf = new jsPDF({
                        orientation: width > height ? 'landscape' : 'portrait',
                        unit: 'px',
                        format: [width, height],
                    });
                    pdf.addImage(dataURL, 'PNG', 0, 0, width, height);
                    pdf.save(filename);
                };
            } else {
                const dataURL = stage.toDataURL({
                    mimeType: `image/${format}`,
                    quality: format === 'jpeg' ? quality : undefined,
                    pixelRatio,
                });

                const link = document.createElement('a');
                link.download = filename;
                link.href = dataURL;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    const handleSaveAsTemplate = async (): Promise<{
        success: boolean;
        message: string;
    }> => {
        if (!stageRef.current) {
            console.error(
                'Cannot save template: Stage reference not available',
            );
            return { success: false, message: 'Failed to save template' };
        }

        if (!canvasId) {
            return {
                success: false,
                message: 'Canvas must be saved before creating a template',
            };
        }

        try {
            const saveResult = await handleSave();
            if (!saveResult.success) {
                return {
                    success: false,
                    message:
                        'Please save the canvas first before creating a template',
                };
            }

            const templateName = prompt(
                'Enter template name:',
                `${canvasName || 'Untitled'} Template`,
            );
            if (!templateName) {
                return {
                    success: false,
                    message: 'Template creation cancelled',
                };
            }

            const templateDescription = prompt(
                'Enter template description (optional):',
            );

            const templateData = {
                name: templateName.trim(),
                description: templateDescription?.trim() || null,
            };

            const response = await fetch(
                `${API_URL}/templates/from-canvas/${canvasId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                    },
                    body: JSON.stringify(templateData),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || 'Failed to create template',
                );
            }

            const result = await response.json();
            console.log('Template created successfully:', result);

            return {
                success: true,
                message: `Template "${templateName}" created successfully!`,
            };
        } catch (error) {
            console.error('Error creating template:', error);
            return {
                success: false,
                message: `Failed to create template: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
            };
        }
    };

    const handleDeleteSelectedElements = useCallback((): boolean => {
        if (selectedElementIds.length === 0) {
            console.log('No elements selected for deletion');
            return false;
        }

        const hasLockedElement = selectedElementIds.some(id => {
            for (const [layerId, elements] of elementsByLayer.entries()) {
                const element = elements.find(el => el.id === id);
                if (element) {
                    const layer = layers.find(l => l.id === layerId);
                    return layer?.locked || false;
                }
            }
            return false;
        });

        if (hasLockedElement) {
            console.log(
                'Cannot delete elements: one or more layers are locked',
            );
            return false;
        }

        const updatedElementsByLayer = new Map(elementsByLayer);
        let deletedCount = 0;

        updatedElementsByLayer.forEach((elements, layerId) => {
            const filteredElements = elements.filter(element => {
                const shouldDelete = selectedElementIds.includes(element.id);
                if (shouldDelete) {
                    deletedCount++;
                }
                return !shouldDelete;
            });
            updatedElementsByLayer.set(layerId, filteredElements);
        });

        if (deletedCount > 0) {
            setElementsByLayer(updatedElementsByLayer);
            setSelectedElementIds([]);
            recordHistory(undefined, updatedElementsByLayer);
            console.log(`Deleted ${deletedCount} element(s)`);
            return true;
        }

        return false;
    }, [
        selectedElementIds,
        elementsByLayer,
        layers,
        setElementsByLayer,
        setSelectedElementIds,
        recordHistory,
    ]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                (e.key === 'Delete' || e.key === 'Backspace') &&
                (e.target as HTMLElement).tagName !== 'INPUT' &&
                (e.target as HTMLElement).tagName !== 'TEXTAREA'
            ) {
                e.preventDefault();
                handleDeleteSelectedElements();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleDeleteSelectedElements]);

    const handleElementColorChange = (
        elementIds: string[],
        colorType: 'stroke' | 'fill',
        color: string,
    ) => {
        const hasLockedElement = elementIds.some(id =>
            isElementLayerLocked(id),
        );

        if (hasLockedElement) {
            console.log('Cannot change color: one or more layers are locked');
            return false;
        }

        const updatedElementsByLayer = new Map(elementsByLayer);
        let hasChanges = false;

        updatedElementsByLayer.forEach((elements, layerId) => {
            const updatedElements = elements.map(element => {
                if (elementIds.includes(element.id)) {
                    if (colorType === 'stroke' && 'stroke' in element) {
                        hasChanges = true;
                        return { ...element, stroke: color };
                    } else if (colorType === 'fill' && 'fill' in element) {
                        hasChanges = true;
                        return { ...element, fill: color };
                    }
                }
                return element;
            });
            updatedElementsByLayer.set(layerId, updatedElements);
        });

        if (hasChanges) {
            setElementsByLayer(updatedElementsByLayer);
            recordHistory(undefined, updatedElementsByLayer);
            return true;
        }

        return false;
    };

    return {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleResizeStart,
        handleResolutionChange,
        handleSave,
        handleDownload,
        handleTextEdit,
        handleTextEditDone,
        handleSaveAsTemplate,
        handleElementColorChange,
        handleStageDoubleClick,
        handleDeleteSelectedElements,
        finishCurve,
        // Image-related functions
        updateImageElement,
        getImageElement,
        handleImageResizeStart,
        fitImageToCanvas,
        fitImageToCanvasWithAspectRatio,
        toggleAspectRatio,
    };
};
