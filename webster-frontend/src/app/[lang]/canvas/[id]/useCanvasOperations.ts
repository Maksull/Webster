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
import { jsPDF } from 'jspdf';

interface DownloadOptions {
    format: 'png' | 'jpeg' | 'pdf';
    quality?: number; // For JPEG quality (0 to 1)
    pixelRatio?: number; // For canvas scaling
}

export const useCanvasOperations = (callbacks = {}) => {
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
    } = useDrawing();

    const { recordHistory } = useHistory();
    const dragStartPos = useRef({ x: 0, y: 0 });
    const lastMousePos = useRef({ x: 0, y: 0 });
    const dragOffset = useRef({ x: 0, y: 0 });

    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
            document.removeEventListener('touchmove', handleResizeMove);
            document.removeEventListener('touchend', handleResizeEnd);
        };
    }, []);

    const handleEraserClick = (e: any) => {
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();

        // Get all shapes at the clicked position
        const shapes = stage.getAllIntersections(pos);
        const targetShapes = shapes.filter(
            shape =>
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

        let elementToRemove = null;
        let elementLayerId = null;

        // First, try to find element by shape ID
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

        // If not found by ID, try position-based detection
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

        // Remove the element if found
        if (elementToRemove && elementLayerId) {
            const updatedElementsByLayer = new Map(elementsByLayer);
            const layerElements =
                updatedElementsByLayer.get(elementLayerId) || [];
            const updatedElements = layerElements.filter(
                el => el.id !== elementToRemove.id,
            );
            updatedElementsByLayer.set(elementLayerId, updatedElements);

            setElementsByLayer(updatedElementsByLayer);

            // Clear selection if the removed element was selected
            if (selectedElementIds.includes(elementToRemove.id)) {
                setSelectedElementIds(
                    selectedElementIds.filter(id => id !== elementToRemove.id),
                );
            }

            recordHistory();
            return true; // Indicate that an element was removed
        }

        return false; // No element was removed
    };

    const handleTextEdit = (id: string) => {
        const activeElements = getActiveLayerElements();
        const textElement = activeElements.find(
            el => el.id === id,
        ) as TextElement;

        if (textElement) {
            setTextEditingId(id);
            setTextValue(textElement.text);
            // Set the current text properties for editing
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
        const updatedElementsByLayer = new Map(elementsByLayer);

        updatedElementsByLayer.forEach((elements, layerId) => {
            const updatedElements = elements.map(element => {
                if (element.id === id && element.type === 'text') {
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
        recordHistory();
    };

    const handleMouseDown = (e: any) => {
        console.log('--------');
        console.log(
            'useCanvasOperations handleMouseDown',
            e.target.getClassName(),
        );

        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();

        const activeLayer = layers.find(layer => layer.id === activeLayerId);
        if (!activeLayer || !activeLayer.visible || activeLayer.locked) return;

        // Check if clicking on a resize handle - if so, don't interfere
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

            setTextEditingId(newText.id);
            setTextValue('Click to edit');
            return;
        }

        if (tool === 'image') {
            return;
        }

        if (tool === 'select') {
            const shapes = stage.getAllIntersections(pos);
            const targetShapes = shapes.filter(
                shape =>
                    shape !== stage &&
                    shape.getClassName() !== 'Stage' &&
                    // Exclude resize handles from selection
                    !(
                        shape.getClassName() === 'Circle' &&
                        shape.attrs.fill === 'white' &&
                        shape.attrs.stroke === '#0066FF' &&
                        shape.parent?.attrs?.name === 'image-resize-handles'
                    ) &&
                    (shape.getClassName() === 'Rect' ||
                        shape.getClassName() === 'Circle' ||
                        shape.getClassName() === 'Line' ||
                        shape.getClassName() === 'Arrow' ||
                        shape.getClassName() === 'RegularPolygon' ||
                        shape.getClassName() === 'Text' ||
                        shape.getClassName() === 'Image'),
            );

            if (targetShapes.length > 0) {
                let foundElement = null;
                let foundElementId = null;

                // First try to find element by shape ID
                for (const shape of targetShapes) {
                    const shapeId = shape.attrs.id;
                    if (shapeId) {
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

                // Fallback to position-based matching if needed (rest of the logic remains the same)
                // ... (keep the existing fallback logic)

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

                    // Clear any selection rectangle from Canvas component
                    if (clearSelectionRect) {
                        clearSelectionRect();
                    }

                    // Set up for dragging with improved tracking
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

        // Handle drawing tools (pencil, brush, pen, marker) - eraser is now handled above
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

    const handleMouseMove = (e: any) => {
        if (!isDrawing && !isMoving) return;

        const activeLayer = layers.find(layer => layer.id === activeLayerId);
        if (!activeLayer || !activeLayer.visible || activeLayer.locked) return;

        const stage = e.target.getStage();
        const point = stage.getPointerPosition();
        const pos = stage.getPointerPosition();

        // Handle element movement first (highest priority)
        if (isMoving && selectedElementIds.length > 0) {
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

        // Handle shape drawing
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

    // ... (rest of the functions remain the same - handleBucketClick, isPointInElement, etc.)

    const handleBucketClick = (x: number, y: number) => {
        if (!stageRef.current) return;

        const activeLayer = layers.find(layer => layer.id === activeLayerId);
        if (!activeLayer || activeLayer.locked) return;

        const stage = stageRef.current;
        const pos = { x: Math.floor(x), y: Math.floor(y) };

        const shapes = stage.getAllIntersections(pos);
        const targetShapes = shapes.filter(
            shape => shape !== stage && shape.getClassName() !== 'Stage',
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

        if (targetElement && targetElementIdx !== -1) {
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

        const dataURL = stage.toDataURL();
        const img = new Image();
        img.src = dataURL;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = dimensions.width;
            canvas.height = dimensions.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(
                0,
                0,
                dimensions.width,
                dimensions.height,
            );
            const data = imageData.data;

            const targetPos =
                (Math.floor(y) * dimensions.width + Math.floor(x)) * 4;
            const targetR = data[targetPos];
            const targetG = data[targetPos + 1];
            const targetB = data[targetPos + 2];
            const targetA = data[targetPos + 3];

            const fillColorObj = hexToRgb(color);
            if (!fillColorObj) return;

            if (
                colorsMatch(
                    [targetR, targetG, targetB, targetA],
                    [fillColorObj.r, fillColorObj.g, fillColorObj.b, 255],
                )
            ) {
                return;
            }

            const width = dimensions.width;
            const height = dimensions.height;
            const mask = new Uint8Array(width * height);
            const queue: number[] = [];

            queue.push(Math.floor(y) * width + Math.floor(x));

            const tolerance = 20;
            const dx = [0, 1, 0, -1];
            const dy = [-1, 0, 1, 0];

            let visitedCount = 0;

            while (queue.length > 0) {
                const pos = queue.shift()!;
                const y = Math.floor(pos / width);
                const x = pos % width;

                if (
                    x < 0 ||
                    x >= width ||
                    y < 0 ||
                    y >= height ||
                    mask[pos] === 1
                ) {
                    continue;
                }

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

                mask[pos] = 1;
                visitedCount++;

                data[pixelPos] = fillColorObj.r;
                data[pixelPos + 1] = fillColorObj.g;
                data[pixelPos + 2] = fillColorObj.b;
                data[pixelPos + 3] = 255;

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

            ctx.putImageData(imageData, 0, 0);

            const fillImage = new window.Image();
            fillImage.src = canvas.toDataURL();

            fillImage.onload = () => {
                const newRect = {
                    x: 0,
                    y: 0,
                    width: dimensions.width,
                    height: dimensions.height,
                    fill: 'transparent',
                    id: Date.now().toString(),
                    type: 'rect',
                    image: fillImage,
                    layerId: activeLayerId,
                };

                const activeElements = getActiveLayerElements();
                const newElements = [...activeElements, newRect];
                updateActiveLayerElements(newElements);
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
            case 'line-shape':
            case 'arrow': {
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

    // ... (rest of the resize and save/download functions remain the same)

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
            name: `Custom (${Math.round(dimensions.width)}×${Math.round(
                dimensions.height,
            )})`,
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

    const handleResolutionChange = (resolution: Resolution) => {
        const oldDimensions = { ...dimensions };
        const scaleX = resolution.width / oldDimensions.width;
        const scaleY = resolution.height / oldDimensions.height;

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
                }
                return element;
            });
            scaledElementsByLayer.set(layerId, scaledElements);
        }

        setSelectedResolution(resolution);
        setElementsByLayer(scaledElementsByLayer);
        setDimensions({ width: resolution.width, height: resolution.height });
        recordHistory();
    };

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

            return {
                success: true,
                message: 'Drawing saved successfully!',
            };
        } catch (error) {
            console.error('Error saving canvas:', error);
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
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Clean timestamp for filename
        const filename = `PixelPerfect_Drawing_${timestamp}.${format}`;

        try {
            if (format === 'pdf') {
                // Generate PDF using jsPDF
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
                // Generate PNG or JPEG
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
            // First, ensure the canvas is saved with latest changes
            const saveResult = await handleSave();
            if (!saveResult.success) {
                return {
                    success: false,
                    message:
                        'Please save the canvas first before creating a template',
                };
            }

            // Show a simple prompt for template name and description
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
            const isPublic = confirm(
                'Make this template public for other users?',
            );

            const templateData = {
                name: templateName.trim(),
                description: templateDescription?.trim() || null,
                isPublic: isPublic,
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
                message: `Failed to create template: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
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
        handleSaveAsTemplate,
    };
};
