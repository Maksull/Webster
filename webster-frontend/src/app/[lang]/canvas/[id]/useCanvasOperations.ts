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
        opacity,
    } = useDrawing();

    const { recordHistory } = useHistory();

    const dragStartPos = useRef({ x: 0, y: 0 });

    const [selectionRect, setSelectionRect] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);

    // Handle resize
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
            document.removeEventListener('touchmove', handleResizeMove);
            document.removeEventListener('touchend', handleResizeEnd);
        };
    }, []);

    // Handle mouse down event on canvas
    const handleMouseDown = e => {
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        const activeLayer = layers.find(layer => layer.id === activeLayerId);
        if (!activeLayer || !activeLayer.visible || activeLayer.locked) return;

        if (tool === 'select') {
            const shapes = stage.getAllIntersections(pos);
            const targetShapes = shapes.filter(
                shape =>
                    shape !== stage &&
                    shape.getClassName() !== 'Stage' &&
                    (shape.getClassName() === 'Rect' ||
                        shape.getClassName() === 'Circle' ||
                        shape.getClassName() === 'Line' ||
                        shape.getClassName() === 'RegularPolygon'),
            );

            if (targetShapes.length > 0) {
                let foundElement = null;
                let foundElementId = null;

                elementsByLayer.forEach((elements, layerId) => {
                    elements.forEach(element => {
                        if (
                            (element.type === 'rectangle' ||
                                element.type === 'rect' ||
                                element.type === 'circle' ||
                                element.type === 'triangle') &&
                            'x' in element &&
                            'y' in element
                        ) {
                            const elementPos = { x: element.x, y: element.y };
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

                if (foundElement && foundElementId) {
                    // Check if shift key is pressed for multi-select
                    const isShiftPressed =
                        e.evt && (e.evt.shiftKey || e.evt.ctrlKey);

                    if (isShiftPressed) {
                        // Toggle selection of the clicked element
                        const newSelectedIds = [...selectedElementIds];
                        const index = newSelectedIds.indexOf(foundElementId);

                        if (index !== -1) {
                            // Remove if already selected
                            newSelectedIds.splice(index, 1);
                        } else {
                            // Add if not selected
                            newSelectedIds.push(foundElementId);
                        }

                        setSelectedElementIds(newSelectedIds);
                    } else {
                        // If element is already selected and no shift key, keep selection for dragging
                        if (!selectedElementIds.includes(foundElementId)) {
                            setSelectedElementIds([foundElementId]);
                        }
                    }

                    setIsMoving(true);
                    dragStartPos.current = pos;
                } else if (!e.evt.shiftKey) {
                    // Clear selection only if shift is not pressed
                    setSelectedElementIds([]);
                }
            } else {
                // Start area selection if we're clicking on empty space
                if (!e.evt.shiftKey) {
                    setSelectedElementIds([]);
                }

                // Start selection rectangle
                setSelectionRect({
                    x: pos.x,
                    y: pos.y,
                    width: 0,
                    height: 0,
                });

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
            tool === 'triangle'
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
    const handleMouseMove = e => {
        if (!isDrawing && !isMoving && !isSelecting) return;

        const activeLayer = layers.find(layer => layer.id === activeLayerId);
        if (!activeLayer || !activeLayer.visible || activeLayer.locked) return;

        const stage = e.target.getStage();
        const point = stage.getPointerPosition();
        const pos = stage.getPointerPosition();

        // Handle area selection
        if (isSelecting && tool === 'select') {
            if (!startPoint) return;

            setSelectionRect({
                x: Math.min(startPoint.x, pos.x),
                y: Math.min(startPoint.y, pos.y),
                width: Math.abs(pos.x - startPoint.x),
                height: Math.abs(pos.y - startPoint.y),
            });

            return;
        }

        if (isMoving && selectedElementIds.length > 0) {
            const dx = pos.x - dragStartPos.current.x;
            const dy = pos.y - dragStartPos.current.y;

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
            dragStartPos.current = pos;
            return;
        }

        // Get active layer elements
        const activeElements = getActiveLayerElements();
        if (activeElements.length === 0) return;

        const lastElement = activeElements[activeElements.length - 1];

        if (tool === 'rectangle' && lastElement.type === 'rectangle') {
            // For rectangle, update width and height based on drag
            if (!startPoint) return;

            const updatedRect: RectangleElement = {
                ...(lastElement as RectangleElement),
                width: point.x - startPoint.x,
                height: point.y - startPoint.y,
            };

            // Replace the last element
            const updatedElements = [
                ...activeElements.slice(0, -1),
                updatedRect,
            ];
            updateActiveLayerElements(updatedElements);
            return;
        }

        if (tool === 'circle' && lastElement.type === 'circle') {
            // For circle, update radius based on distance from start
            if (!startPoint) return;

            // Calculate radius as distance from center
            const dx = point.x - startPoint.x;
            const dy = point.y - startPoint.y;
            const radius = Math.sqrt(dx * dx + dy * dy);

            const updatedCircle: CircleElement = {
                ...(lastElement as CircleElement),
                radius,
            };

            // Replace the last element
            const updatedElements = [
                ...activeElements.slice(0, -1),
                updatedCircle,
            ];
            updateActiveLayerElements(updatedElements);
            return;
        }

        if (tool === 'line' && lastElement.type === 'line-shape') {
            // For line, update end point
            if (!startPoint) return;

            const updatedLine: LineShapeElement = {
                ...(lastElement as LineShapeElement),
                points: [startPoint.x, startPoint.y, point.x, point.y],
            };

            // Replace the last element
            const updatedElements = [
                ...activeElements.slice(0, -1),
                updatedLine,
            ];
            updateActiveLayerElements(updatedElements);
            return;
        }

        if (tool === 'triangle' && lastElement.type === 'triangle') {
            // For triangle, update size based on distance from start
            if (!startPoint) return;

            // Calculate radius as distance from center to corner
            const dx = point.x - startPoint.x;
            const dy = point.y - startPoint.y;
            const radius = Math.sqrt(dx * dx + dy * dy);

            const updatedTriangle: TriangleElement = {
                ...(lastElement as TriangleElement),
                radius,
            };

            // Replace the last element
            const updatedElements = [
                ...activeElements.slice(0, -1),
                updatedTriangle,
            ];
            updateActiveLayerElements(updatedElements);
            return;
        }

        if (lastElement.type === 'line') {
            // Add point to the last line
            const lineElement = lastElement as LineElement;
            lineElement.points = lineElement.points.concat([point.x, point.y]);

            // Replace last element with updated one
            const updatedElements = [
                ...activeElements.slice(0, -1),
                lineElement,
            ];
            updateActiveLayerElements(updatedElements);
        }
    };

    // Handle mouse up event on canvas
    const handleMouseUp = () => {
        if (isSelecting && selectionRect) {
            // Finalize area selection
            const newSelectedIds = [];

            // Find all elements that intersect with the selection rectangle
            elementsByLayer.forEach((elements, layerId) => {
                elements.forEach(element => {
                    if (isElementInSelectionRect(element, selectionRect)) {
                        newSelectedIds.push(element.id);
                    }
                });
            });

            // If shift key is pressed, add to existing selection
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

        if (isMoving) {
            setIsMoving(false);
            recordHistory();
        }

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
                // Check if any part of the rectangle overlaps with selection
                return (
                    x < rect.x + rect.width &&
                    x + width > rect.x &&
                    y < rect.y + rect.height &&
                    y + height > rect.y
                );
            }

            case 'circle': {
                const { x, y, radius } = element;
                // Check if circle overlaps with selection
                return (
                    x + radius > rect.x &&
                    x - radius < rect.x + rect.width &&
                    y + radius > rect.y &&
                    y - radius < rect.y + rect.height
                );
            }

            case 'triangle': {
                const { x, y, radius } = element;
                // Similar to circle for simplicity
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
                // Check if any point of the line is in the selection
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

    // Handle bucket tool click
    const handleBucketClick = (x: number, y: number) => {
        if (!stageRef.current) return;

        // Get the active layer
        const activeLayer = layers.find(layer => layer.id === activeLayerId);
        if (!activeLayer || activeLayer.locked) return;

        // Get the canvas from the stage
        const stage = stageRef.current;
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
            return;
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

            const result = await response.json();
            console.log('Canvas saved successfully:', result);

            alert('Drawing saved successfully!');
        } catch (error) {
            console.error('Error saving canvas:', error);
            alert(
                `Failed to save canvas: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
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
    };
};
