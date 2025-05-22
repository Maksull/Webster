'use client';

import { useEffect, useRef, useState } from 'react';
import { useHistory } from './useHistory';

import { hexToRgb, colorsMatch, colorMatchesWithTolerance } from './colorUtils';
import {
    RectangleElement,
    CircleElement,
    LineShapeElement,
    TriangleElement,
    LineElement,
    Resolution,
    RectElement,
    TextElement,
    ArrowElement,
    ImageElement,
} from '@/types/elements';
import { API_URL } from '@/config';
import { useDrawing } from '@/contexts';

export const useCanvasOperations = () => {
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
    } = useDrawing();

    const { recordHistory } = useHistory();

    const dragStartPos = useRef({ x: 0, y: 0 });

    const [selectionRect, setSelectionRect] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);

    const lastMousePos = useRef({ x: 0, y: 0 }); // Add this new ref
    const dragOffset = useRef({ x: 0, y: 0 });

    // Handle resize
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
            document.removeEventListener('touchmove', handleResizeMove);
            document.removeEventListener('touchend', handleResizeEnd);
        };
    }, []);

    const handleTextEdit = (id: string) => {
        // Find the text element
        const activeElements = getActiveLayerElements();
        const textElement = activeElements.find(
            el => el.id === id,
        ) as TextElement;

        if (textElement) {
            setTextEditingId(id);
            setTextValue(textElement.text);
        }
    };
    const handleTextEditDone = (id: string, value: string) => {
        const updatedElementsByLayer = new Map(elementsByLayer);

        updatedElementsByLayer.forEach((elements, layerId) => {
            const updatedElements = elements.map(element => {
                if (element.id === id && element.type === 'text') {
                    return {
                        ...element,
                        text: value,
                    };
                }
                return element;
            });

            updatedElementsByLayer.set(layerId, updatedElements);
        });

        setElementsByLayer(updatedElementsByLayer);
        setTextEditingId(null);
        setTextValue('');
        recordHistory();
    };

    // Handle mouse down event on canvas
    const handleMouseDown = (e: any) => {
        console.log('--------');
        console.log('useCanvasOperations handleMouseDown', e);
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        const activeLayer = layers.find(layer => layer.id === activeLayerId);

        if (!activeLayer || !activeLayer.visible || activeLayer.locked) return;

        if (tool === 'text') {
            const stage = e.target.getStage();
            const pos = stage.getPointerPosition();

            // Create a new text element
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

            // Add element to active layer
            const activeElements = getActiveLayerElements();
            const updatedElements = [...activeElements, newText];
            updateActiveLayerElements(updatedElements);

            // Set this text element for editing
            setTextEditingId(newText.id);
            setTextValue('Click to edit');

            return;
        }
        if (tool === 'image') {
            // Image tool should trigger file selection instead of mouse down behavior
            // The actual image insertion is handled by the toolbar component
            return;
        }
        if (tool === 'select') {
            const shapes = stage.getAllIntersections(pos);
            const targetShapes = shapes.filter(
                shape =>
                    shape !== stage &&
                    shape.getClassName() !== 'Stage' &&
                    (shape.getClassName() === 'Rect' ||
                        shape.getClassName() === 'Circle' ||
                        shape.getClassName() === 'Line' ||
                        shape.getClassName() === 'RegularPolygon' ||
                        shape.getClassName() === 'Text' ||
                        shape.getClassName() === 'Image'),
            );

            if (targetShapes.length > 0) {
                let foundElement = null;
                let foundElementId = null;

                // Check if we clicked on an element by looking at the shape's ID
                for (const shape of targetShapes) {
                    const shapeId = shape.attrs.id;
                    if (shapeId) {
                        // Look for the element with this ID in our element layers
                        elementsByLayer.forEach((elements, layerId) => {
                            const element = elements.find(
                                el => el.id === shapeId,
                            );
                            if (element) {
                                foundElement = element;
                                foundElementId = shapeId;
                            }
                        });

                        if (foundElement) break;
                    }
                }

                // Fallback to position-based matching if ID lookup failed
                if (!foundElement) {
                    elementsByLayer.forEach((elements, layerId) => {
                        elements.forEach(element => {
                            if (element.type === 'text') {
                                // For text elements, check if click is within the text bounds (with padding)
                                const textWidth =
                                    element.width ||
                                    (element.text?.length * element.fontSize) /
                                        2 ||
                                    20;
                                const textHeight =
                                    element.height || element.fontSize || 20;
                                const padding = 10;

                                if (
                                    pos.x >= element.x - padding &&
                                    pos.x <= element.x + textWidth + padding &&
                                    pos.y >= element.y - padding &&
                                    pos.y <= element.y + textHeight + padding
                                ) {
                                    foundElement = element;
                                    foundElementId = element.id;
                                }
                            } else if (
                                (element.type === 'rectangle' ||
                                    element.type === 'rect' ||
                                    element.type === 'circle' ||
                                    element.type === 'triangle') &&
                                'x' in element &&
                                'y' in element
                            ) {
                                // Existing logic for other shapes
                                const elementPos = {
                                    x: element.x,
                                    y: element.y,
                                };
                                const shapePos = {
                                    x: targetShapes[0].attrs.x,
                                    y: targetShapes[0].attrs.y,
                                };
                                if (
                                    Math.abs(elementPos.x - shapePos.x) < 5 &&
                                    Math.abs(elementPos.y - shapePos.y) < 5
                                ) {
                                    foundElement = element;
                                    foundElementId = element.id;
                                }
                            } else if (
                                element.type === 'line' ||
                                element.type === 'line-shape'
                            ) {
                                // Existing line logic
                                if (
                                    targetShapes[0].getClassName() === 'Line' &&
                                    'points' in element &&
                                    'points' in targetShapes[0].attrs &&
                                    element.points.length > 0 &&
                                    targetShapes[0].attrs.points.length > 0
                                ) {
                                    if (
                                        Math.abs(
                                            element.points[0] -
                                                targetShapes[0].attrs.points[0],
                                        ) < 5 &&
                                        Math.abs(
                                            element.points[1] -
                                                targetShapes[0].attrs.points[1],
                                        ) < 5
                                    ) {
                                        foundElement = element;
                                        foundElementId = element.id;
                                    }
                                }
                            }
                        });
                    });
                }

                if (foundElement && foundElementId) {
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

                    // Clear selection rectangle when starting to move
                    setSelectionRect(null);
                    setIsSelecting(false);

                    // Set up for dragging with improved tracking
                    setIsMoving(true);
                    dragStartPos.current = pos;
                    lastMousePos.current = pos; // Track last mouse position
                    dragOffset.current = { x: 0, y: 0 }; // Reset offset
                } else if (!e.evt.shiftKey) {
                    setSelectedElementIds([]);
                }
            } else {
                if (!e.evt.shiftKey) {
                    setSelectedElementIds([]);
                }
                setSelectionRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
                setIsSelecting(true);
                setStartPoint({ x: pos.x, y: pos.y });
            }
            return;
        }

        if (tool === 'bucket') {
            // For bucket tool, trigger fill
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
            // For shape tools, store the start point
            setStartPoint({ x: pos.x, y: pos.y });

            if (tool === 'rectangle') {
                // Create initial rectangle with 0 dimensions
                const newRect: RectangleElement = {
                    x: pos.x,
                    y: pos.y,
                    width: 0,
                    height: 0,
                    fill: 'transparent',
                    stroke: color,
                    strokeWidth,
                    id: Date.now().toString(),
                    type: 'rectangle',
                    layerId: activeLayerId,
                    opacity: opacity,
                };

                // Add element to active layer
                const activeElements = getActiveLayerElements();
                const updatedElements = [...activeElements, newRect];
                updateActiveLayerElements(updatedElements);
            } else if (tool === 'circle') {
                // Create initial circle with 0 radius
                const newCircle: CircleElement = {
                    x: pos.x,
                    y: pos.y,
                    radius: 0,
                    fill: 'transparent',
                    stroke: color,
                    strokeWidth,
                    id: Date.now().toString(),
                    type: 'circle',
                    layerId: activeLayerId,
                    opacity: opacity,
                };

                // Add element to active layer
                const activeElements = getActiveLayerElements();
                const updatedElements = [...activeElements, newCircle];
                updateActiveLayerElements(updatedElements);
            } else if (tool === 'line') {
                // Create initial line with just start and end points at same position
                const newLine: LineShapeElement = {
                    points: [pos.x, pos.y, pos.x, pos.y],
                    stroke: color,
                    strokeWidth,
                    id: Date.now().toString(),
                    type: 'line-shape',
                    layerId: activeLayerId,
                    opacity: opacity,
                };

                // Add element to active layer
                const activeElements = getActiveLayerElements();
                const updatedElements = [...activeElements, newLine];
                updateActiveLayerElements(updatedElements);
            } else if (tool === 'triangle') {
                // Create initial triangle at the current point
                const newTriangle: TriangleElement = {
                    x: pos.x,
                    y: pos.y,
                    sides: 3,
                    radius: 0,
                    fill: 'transparent',
                    stroke: color,
                    strokeWidth,
                    id: Date.now().toString(),
                    type: 'triangle',
                    layerId: activeLayerId,
                    opacity: opacity,
                };

                // Add element to active layer
                const activeElements = getActiveLayerElements();
                const updatedElements = [...activeElements, newTriangle];
                updateActiveLayerElements(updatedElements);
            } else if (tool === 'arrow') {
                // Create initial arrow with start and end points at same position
                const newArrow: ArrowElement = {
                    points: [pos.x, pos.y, pos.x, pos.y], // start and end the same initially
                    stroke: color,
                    strokeWidth,
                    id: Date.now().toString(),
                    type: 'arrow',
                    layerId: activeLayerId,
                    opacity: opacity,
                };

                // Add element to active layer
                const activeElements = getActiveLayerElements();
                const updatedElements = [...activeElements, newArrow];
                updateActiveLayerElements(updatedElements);
            }

            setIsDrawing(true);
            return;
        }

        setIsDrawing(true);

        const newLine: LineElement = {
            points: [pos.x, pos.y],
            stroke: tool === 'eraser' ? '#ffffff' : color,
            strokeWidth,
            tension: 0.5,
            lineCap: 'round',
            lineJoin: 'round',
            globalCompositeOperation:
                tool === 'eraser' ? 'destination-out' : 'source-over',
            id: Date.now().toString(),
            type: 'line',
            layerId: activeLayerId,
            opacity: opacity,
        };

        // Add element to active layer
        const activeElements = getActiveLayerElements();
        const updatedElements = [...activeElements, newLine];
        updateActiveLayerElements(updatedElements);
    };

    // Handle mouse move event on canvas
    const handleMouseMove = (e: any) => {
        // Update condition to include isSelecting but prioritize isMoving
        if (!isDrawing && !isMoving && !isSelecting) return;

        const activeLayer = layers.find(layer => layer.id === activeLayerId);
        if (!activeLayer || !activeLayer.visible || activeLayer.locked) return;

        const stage = e.target.getStage();
        const point = stage.getPointerPosition();
        const pos = stage.getPointerPosition();

        // Handle element movement first (highest priority)
        if (isMoving && selectedElementIds.length > 0) {
            // Calculate delta from last mouse position (not from start)
            const dx = pos.x - lastMousePos.current.x;
            const dy = pos.y - lastMousePos.current.y;

            // Update cumulative offset
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
                            const lineElement = element as LineElement;
                            const newPoints = [...lineElement.points];
                            for (let i = 0; i < newPoints.length; i += 2) {
                                newPoints[i] += dx;
                                newPoints[i + 1] += dy;
                            }
                            return { ...lineElement, points: newPoints };

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

            // Update last mouse position for next iteration
            lastMousePos.current = pos;
            return; // Exit early to prevent selection rectangle updates
        }

        // Handle area selection only if not moving
        if (isSelecting && tool === 'select' && !isMoving) {
            if (!startPoint) return;

            setSelectionRect({
                x: Math.min(startPoint.x, pos.x),
                y: Math.min(startPoint.y, pos.y),
                width: Math.abs(pos.x - startPoint.x),
                height: Math.abs(pos.y - startPoint.y),
            });

            return;
        }

        // Rest of existing drawing logic for shapes and lines...
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

    // Handle mouse up event on canvas
    const handleMouseUp = () => {
        // Handle selection rectangle completion (only if not moving)
        if (isSelecting && selectionRect && !isMoving) {
            const newSelectedIds = [];
            elementsByLayer.forEach((elements, layerId) => {
                elements.forEach(element => {
                    if (isElementInSelectionRect(element, selectionRect)) {
                        newSelectedIds.push(element.id);
                    }
                });
            });

            if (
                window.event &&
                (window.event.shiftKey || window.event.ctrlKey)
            ) {
                setSelectedElementIds([
                    ...new Set([...selectedElementIds, ...newSelectedIds]),
                ]);
            } else {
                setSelectedElementIds(newSelectedIds);
            }

            setIsSelecting(false);
            setSelectionRect(null);
        }

        // Handle end of moving
        if (isMoving) {
            setIsMoving(false);
            // Reset drag tracking
            dragOffset.current = { x: 0, y: 0 };
            recordHistory();
        }

        // Handle end of drawing
        setIsDrawing(false);
        setStartPoint(null);

        if (isDrawing) {
            recordHistory();
        }
    };
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
            case 'image': {
                const { x, y, width, height } = element;
                return (
                    x < rect.x + rect.width &&
                    x + width > rect.x &&
                    y < rect.y + rect.height &&
                    y + height > rect.y
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
            case 'text': {
                // Handle text elements
                const { x, y, width, height, fontSize, text } = element;
                // If width and height are defined, use them
                // Otherwise, estimate based on text length and fontSize
                const textWidth = width || (text?.length * fontSize) / 2 || 0;
                const textHeight = height || fontSize || 0;

                return (
                    x < rect.x + rect.width &&
                    x + textWidth > rect.x &&
                    y < rect.y + rect.height &&
                    y + textHeight > rect.y
                );
            }
            default:
                return false;
        }
    };

    // Handle bucket tool click
    const handleBucketClick = (x: number, y: number) => {
        if (!stageRef.current) return;
        const activeLayer = layers.find(layer => layer.id === activeLayerId);
        if (!activeLayer || activeLayer.locked) return;

        // First, check if we're clicking directly on the canvas background
        // by checking if there are any elements at the click position
        const stage = stageRef.current;
        const pos = { x: Math.floor(x), y: Math.floor(y) };
        const shapes = stage.getAllIntersections(pos);

        // Filter out the stage itself and any background rectangle
        const targetShapes = shapes.filter(
            shape => shape !== stage && shape.getClassName() !== 'Stage',
        );

        // If we're clicking on the empty canvas (no objects at this position)
        // or only hitting the background rect (which is always the first layer)
        if (
            targetShapes.length === 0 ||
            (targetShapes.length === 1 &&
                targetShapes[0].getAttrs().y === 0 &&
                targetShapes[0].getAttrs().x === 0 &&
                targetShapes[0].getAttrs().width === dimensions.width &&
                targetShapes[0].getAttrs().height === dimensions.height)
        ) {
            // This is a click on the background, update backgroundColor
            setBackgroundColor(color);
            recordHistory(color);
            return;
        }

        // Find the specific element we clicked on
        let targetElement = null;
        let targetElementIdx = -1;
        const elements = getActiveLayerElements();

        for (let i = elements.length - 1; i >= 0; i--) {
            const element = elements[i];
            if (isPointInElement(pos.x, pos.y, element)) {
                targetElement = element;
                targetElementIdx = i;
                break;
            }
        }

        // If we found a specific element to fill
        if (targetElement && targetElementIdx !== -1) {
            // For simple shapes like rectangle, circle, and triangle
            // directly update their fill property instead of creating a new element
            if (
                ['rectangle', 'rect', 'circle', 'triangle'].includes(
                    targetElement.type,
                )
            ) {
                const updatedElements = [...elements];
                updatedElements[targetElementIdx] = {
                    ...targetElement,
                    fill: color,
                };
                updateActiveLayerElements(updatedElements);
                recordHistory();
                return;
            }
        }

        // For more complex cases (line shapes, or if element detection fails),
        // proceed with the pixel-based flood fill
        const dataURL = stage.toDataURL();

        // Create a temporary image from the stage
        const img = new Image();
        img.src = dataURL;

        img.onload = () => {
            // Create a temporary canvas to analyze the image
            const canvas = document.createElement('canvas');
            canvas.width = dimensions.width;
            canvas.height = dimensions.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Draw the stage image onto our temporary canvas
            ctx.drawImage(img, 0, 0);

            // Get the image data
            const imageData = ctx.getImageData(
                0,
                0,
                dimensions.width,
                dimensions.height,
            );
            const data = imageData.data;

            // The target color we're replacing (the color at the clicked position)
            const targetPos =
                (Math.floor(y) * dimensions.width + Math.floor(x)) * 4;
            const targetR = data[targetPos];
            const targetG = data[targetPos + 1];
            const targetB = data[targetPos + 2];
            const targetA = data[targetPos + 3];

            // The replacement color (from our color picker)
            const fillColorObj = hexToRgb(color);
            if (!fillColorObj) return;

            // Early return if we're trying to fill an area with the same color
            if (
                colorsMatch(
                    [targetR, targetG, targetB, targetA],
                    [fillColorObj.r, fillColorObj.g, fillColorObj.b, 255],
                )
            ) {
                return;
            }

            // Create a mask for the filled pixels
            const width = dimensions.width;
            const height = dimensions.height;
            const mask = new Uint8Array(width * height);

            // Queue for the flood fill
            const queue: number[] = [];
            queue.push(Math.floor(y) * width + Math.floor(x));

            // Color tolerance
            const tolerance = 20;

            // Arrays for 4-way connectivity
            const dx = [0, 1, 0, -1];
            const dy = [-1, 0, 1, 0];

            // Count visited pixels to determine if we should fill the whole canvas
            let visitedCount = 0;

            // Process the queue
            while (queue.length > 0) {
                const pos = queue.shift()!;
                const y = Math.floor(pos / width);
                const x = pos % width;

                // Check bounds and if already processed
                if (
                    x < 0 ||
                    x >= width ||
                    y < 0 ||
                    y >= height ||
                    mask[pos] === 1
                ) {
                    continue;
                }

                // Check if current pixel matches target color (with tolerance)
                const pixelPos = pos * 4;
                if (
                    !colorMatchesWithTolerance(
                        [
                            data[pixelPos],
                            data[pixelPos + 1],
                            data[pixelPos + 2],
                            data[pixelPos + 3],
                        ],
                        [targetR, targetG, targetB, targetA],
                        tolerance,
                    )
                ) {
                    continue;
                }

                // Mark pixel as processed
                mask[pos] = 1;
                visitedCount++;

                // Change the pixel color in the image data
                data[pixelPos] = fillColorObj.r;
                data[pixelPos + 1] = fillColorObj.g;
                data[pixelPos + 2] = fillColorObj.b;
                data[pixelPos + 3] = 255; // Full opacity

                // Add neighbors to queue
                for (let i = 0; i < 4; i++) {
                    const nx = x + dx[i];
                    const ny = y + dy[i];
                    const npos = ny * width + nx;

                    if (
                        nx >= 0 &&
                        nx < width &&
                        ny >= 0 &&
                        ny < height &&
                        mask[npos] === 0
                    ) {
                        queue.push(npos);
                    }
                }
            }

            // Put modified image data back to canvas
            ctx.putImageData(imageData, 0, 0);

            // Create an image element for Konva
            const fillImage = new window.Image();
            fillImage.src = canvas.toDataURL();

            fillImage.onload = () => {
                // Create a new Rectangle element with the fill color
                const newRect = {
                    x: 0,
                    y: 0,
                    width: dimensions.width,
                    height: dimensions.height,
                    fill: 'transparent', // Fill is transparent because we'll use the image
                    id: Date.now().toString(),
                    type: 'rect',
                    image: fillImage, // Add the image to the element
                    layerId: activeLayerId, // Assign to active layer
                };

                // Add the new element to the active layer
                const activeElements = getActiveLayerElements();
                const newElements = [...activeElements, newRect];
                updateActiveLayerElements(newElements);

                // Save to history
                recordHistory();
            };
        };
    };

    const isPointInElement = (x, y, element) => {
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
            case 'line-shape': {
                const { points } = element;
                // For lines, check if point is near any segment
                for (let i = 0; i < points.length - 2; i += 2) {
                    const x1 = points[i];
                    const y1 = points[i + 1];
                    const x2 = points[i + 2];
                    const y2 = points[i + 3];

                    // Check if point is near this line segment
                    const distToSegment = distanceToLineSegment(
                        x1,
                        y1,
                        x2,
                        y2,
                        x,
                        y,
                    );
                    if (distToSegment <= 5) {
                        // 5px tolerance
                        return true;
                    }
                }
                return false;
            }
            default:
                return false;
        }
    };

    // Helper function to calculate distance from point to line segment
    const distanceToLineSegment = (x1, y1, x2, y2, x, y) => {
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

        let xx, yy;

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

    // Handle resize start
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

    const handleResizeMove = (e: MouseEvent | TouchEvent) => {
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
    };

    const handleResizeEnd = () => {
        if (!isResizing) return;

        setIsResizing(false);

        const scaleX = dimensions.width / originalDimensions.width;
        const scaleY = dimensions.height / originalDimensions.height;

        // Scale all elements
        const scaledElementsByLayer = new Map();

        for (const [layerId, layerElements] of elementsByLayer.entries()) {
            const scaledElements = layerElements.map(element => {
                if (element.type === 'line') {
                    const lineElement = element as LineElement;
                    const newPoints = [...lineElement.points];
                    for (let i = 0; i < newPoints.length; i += 2) {
                        newPoints[i] = newPoints[i] * scaleX;
                        newPoints[i + 1] = newPoints[i + 1] * scaleY;
                    }
                    return { ...lineElement, points: newPoints };
                } else if (
                    element.type === 'rect' ||
                    element.type === 'rectangle'
                ) {
                    const rectElement = element as any;
                    return {
                        ...rectElement,
                        x: rectElement.x * scaleX,
                        y: rectElement.y * scaleY,
                        width: rectElement.width * scaleX,
                        height: rectElement.height * scaleY,
                    };
                } else if (element.type === 'circle') {
                    const circleElement = element as CircleElement;
                    return {
                        ...circleElement,
                        x: circleElement.x * scaleX,
                        y: circleElement.y * scaleY,
                        radius: circleElement.radius * Math.min(scaleX, scaleY),
                    };
                } else if (element.type === 'line-shape') {
                    const lineElement = element as LineShapeElement;
                    const newPoints = [...lineElement.points];
                    for (let i = 0; i < newPoints.length; i += 2) {
                        newPoints[i] = newPoints[i] * scaleX;
                        newPoints[i + 1] = newPoints[i + 1] * scaleY;
                    }
                    return { ...lineElement, points: newPoints };
                } else if (element.type === 'triangle') {
                    const triangleElement = element as TriangleElement;
                    return {
                        ...triangleElement,
                        x: triangleElement.x * scaleX,
                        y: triangleElement.y * scaleY,
                        radius:
                            triangleElement.radius * Math.min(scaleX, scaleY),
                    };
                } else if (element.type === 'image') {
                    const imageElement = element as ImageElement;
                    return {
                        ...imageElement,
                        x: imageElement.x * scaleX,
                        y: imageElement.y * scaleY,
                        width: imageElement.width * scaleX,
                        height: imageElement.height * scaleY,
                    };
                }
                return element;
            });
            scaledElementsByLayer.set(layerId, scaledElements);
        }

        const customResolution: Resolution = {
            name: `Custom (${Math.round(dimensions.width)}×${Math.round(dimensions.height)})`,
            width: Math.round(dimensions.width),
            height: Math.round(dimensions.height),
        };

        setElementsByLayer(scaledElementsByLayer);
        setSelectedResolution(customResolution);
        recordHistory();

        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.removeEventListener('touchmove', handleResizeMove);
        document.removeEventListener('touchend', handleResizeEnd);
    };

    // Handle resolution change
    const handleResolutionChange = (resolution: Resolution) => {
        const oldDimensions = { ...dimensions };

        const scaleX = resolution.width / oldDimensions.width;
        const scaleY = resolution.height / oldDimensions.height;

        // Scale all elements
        const scaledElementsByLayer = new Map();

        for (const [layerId, layerElements] of elementsByLayer.entries()) {
            const scaledElements = layerElements.map(element => {
                if (element.type === 'line') {
                    const lineElement = element as LineElement;
                    const newPoints = [...lineElement.points];

                    for (let i = 0; i < newPoints.length; i += 2) {
                        newPoints[i] = newPoints[i] * scaleX;
                        newPoints[i + 1] = newPoints[i + 1] * scaleY;
                    }

                    return { ...lineElement, points: newPoints };
                } else if (
                    element.type === 'rect' ||
                    element.type === 'rectangle'
                ) {
                    const rectElement = element as any; // Using any to handle both rect types

                    return {
                        ...rectElement,
                        x: rectElement.x * scaleX,
                        y: rectElement.y * scaleY,
                        width: rectElement.width * scaleX,
                        height: rectElement.height * scaleY,
                    };
                } else if (element.type === 'circle') {
                    const circleElement = element as CircleElement;

                    return {
                        ...circleElement,
                        x: circleElement.x * scaleX,
                        y: circleElement.y * scaleY,
                        radius: circleElement.radius * Math.min(scaleX, scaleY),
                    };
                } else if (element.type === 'line-shape') {
                    const lineElement = element as LineShapeElement;
                    const newPoints = [...lineElement.points];

                    for (let i = 0; i < newPoints.length; i += 2) {
                        newPoints[i] = newPoints[i] * scaleX;
                        newPoints[i + 1] = newPoints[i + 1] * scaleY;
                    }

                    return { ...lineElement, points: newPoints };
                } else if (element.type === 'triangle') {
                    const triangleElement = element as TriangleElement;

                    return {
                        ...triangleElement,
                        x: triangleElement.x * scaleX,
                        y: triangleElement.y * scaleY,
                        radius:
                            triangleElement.radius * Math.min(scaleX, scaleY),
                    };
                }

                return element;
            });

            scaledElementsByLayer.set(layerId, scaledElements);
        }

        setSelectedResolution(resolution);
        setElementsByLayer(scaledElementsByLayer);
        setDimensions({ width: resolution.width, height: resolution.height });

        // Reset history since this is a major change
        recordHistory();
    };

    // Handle save (would connect to backend in full implementation)
    const handleSave = async () => {
        if (!stageRef.current) {
            console.error('Cannot save: Stage reference not available');
            return {
                success: false,
                message: `Failed to save canvas`,
            };
        }

        try {
            const thumbnailDataURL = stageRef.current.toDataURL({
                pixelRatio: 0.5,
                mimeType: 'image/jpeg',
                quality: 0.8,
            });

            const elementsObject: Record<string, any> = {};
            elementsByLayer.forEach((elements, layerId) => {
                elementsObject[layerId] = elements;
            });

            // Include the canvas name in the canvas data
            const canvasData = {
                name: canvasName || 'Untitled Design', // Include canvas name
                width: dimensions.width,
                height: dimensions.height,
                backgroundColor: backgroundColor,
                layers,
                elementsByLayer: elementsObject,
                thumbnail: thumbnailDataURL,
                lastModified: new Date().toISOString(),
            };

            // Handle both creating new canvases and updating existing ones
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

            return { success: true, message: 'Drawing saved successfully!' };
        } catch (error) {
            console.error('Error saving canvas:', error);
            return {
                success: false,
                message: `Failed to save canvas: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    };

    // Download drawing as image
    const handleDownload = () => {
        if (stageRef.current) {
            const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `PixelPerfect_Drawing_${new Date().toISOString()}.png`;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
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
    };
};
