'use client';

import { useState, useRef, useEffect } from 'react';
import { useDictionary } from '@/contexts/DictionaryContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Stage, Layer, Line, Rect, Circle, RegularPolygon } from 'react-konva';
import {
    ArrowLeft,
    Pencil,
    Eraser,
    Trash2,
    Save,
    Download,
    Undo,
    Redo,
    X,
    Palette,
    CheckCircle,
    Menu,
    Layers,
    ZoomIn,
    ZoomOut,
    Maximize,
    Droplet,
    Square,
    Circle as CircleIcon,
    Minus,
    Triangle as TriangleIcon,
} from 'lucide-react';

interface LineElement {
    points: number[];
    stroke: string;
    strokeWidth: number;
    tension: number;
    lineCap: 'round' | 'butt' | 'square';
    lineJoin: 'round' | 'bevel' | 'miter';
    globalCompositeOperation: 'source-over' | 'destination-out';
    id: string;
    type: 'line';
}

interface RectElement {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    id: string;
    type: 'rect';
    image?: HTMLImageElement;
}

interface CircleElement {
    x: number;
    y: number;
    radius: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    id: string;
    type: 'circle';
}

interface LineShapeElement {
    points: number[];
    stroke: string;
    strokeWidth: number;
    id: string;
    type: 'line-shape';
}

interface RectangleElement {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    id: string;
    type: 'rectangle';
}

interface TriangleElement {
    x: number;
    y: number;
    sides: number;
    radius: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    id: string;
    type: 'triangle';
}

type DrawingElement =
    | LineElement
    | RectElement
    | CircleElement
    | LineShapeElement
    | RectangleElement
    | TriangleElement;

export default function DrawingEditor() {
    const { dict, lang } = useDictionary();
    const stageRef = useRef<any>(null);
    const layerRef = useRef<any>(null);

    // Canvas state
    const [elements, setElements] = useState<DrawingElement[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [historyStep, setHistoryStep] = useState(0);
    const [history, setHistory] = useState<DrawingElement[][]>([[]]);

    // Tool settings
    const [tool, setTool] = useState<
        | 'pencil'
        | 'eraser'
        | 'bucket'
        | 'rectangle'
        | 'circle'
        | 'line'
        | 'triangle'
    >('pencil');
    const [color, setColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(5);
    const [showSettings, setShowSettings] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scale, setScale] = useState(1); // Track zoom level

    // Track shape drawing
    const [startPoint, setStartPoint] = useState<{
        x: number;
        y: number;
    } | null>(null);

    // Filled shapes toggle
    const [shapeFill, setShapeFill] = useState(true);

    // Canvas dimensions
    const [dimensions, setDimensions] = useState({
        width: 800,
        height: 600,
    });

    // Available colors
    const colors = [
        '#000000',
        '#FFFFFF',
        '#FF0000',
        '#FF8C00',
        '#FFFF00',
        '#008000',
        '#0000FF',
        '#4B0082',
        '#800080',
        '#FFC0CB',
    ];

    // Initialize dimensions after component mounts
    useEffect(() => {
        const updateDimensions = () => {
            // Calculate available space - account for the toolbar width (64px on desktop)
            // and the header height (56px) and mobile toolbar (48px) without extra padding
            const toolbarWidth = window.innerWidth < 768 ? 0 : 64; // md:w-16 = 64px
            const headerHeight = 56; // Based on the header's height
            const mobileToolbarHeight = window.innerWidth < 768 ? 48 : 0; // Mobile bottom toolbar

            // Subtract 1 more pixel to ensure no overflow
            setDimensions({
                width: Math.floor(window.innerWidth - toolbarWidth - 1),
                height: Math.floor(
                    window.innerHeight - headerHeight - mobileToolbarHeight - 1,
                ),
            });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Handle bucket tool click
    const handleBucketClick = (x: number, y: number) => {
        if (!stageRef.current) return;

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
                const newRect: RectElement = {
                    x: 0,
                    y: 0,
                    width: dimensions.width,
                    height: dimensions.height,
                    fill: 'transparent', // Fill is transparent because we'll use the image
                    id: Date.now().toString(),
                    type: 'rect',
                    image: fillImage, // Add the image to the element
                };

                const newElements = [...elements, newRect];
                setElements(newElements);

                // Save to history
                const newHistory = history.slice(0, historyStep + 1);
                newHistory.push(newElements);
                setHistory(newHistory);
                setHistoryStep(newHistory.length - 1);
            };
        };
    };

    // Helper to check if two colors match
    const colorsMatch = (color1: number[], color2: number[]) => {
        return (
            color1[0] === color2[0] &&
            color1[1] === color2[1] &&
            color1[2] === color2[2] &&
            color1[3] === color2[3]
        );
    };

    // Helper to check if color matches with tolerance
    const colorMatchesWithTolerance = (
        color1: number[],
        color2: number[],
        tolerance: number,
    ) => {
        return (
            Math.abs(color1[0] - color2[0]) <= tolerance &&
            Math.abs(color1[1] - color2[1]) <= tolerance &&
            Math.abs(color1[2] - color2[2]) <= tolerance &&
            Math.abs(color1[3] - color2[3]) <= tolerance
        );
    };

    // Helper to convert hex color to RGB
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16),
              }
            : null;
    };

    // Handle mouse down event on canvas
    const handleMouseDown = (e: any) => {
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();

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
                    fill: shapeFill ? color : 'transparent',
                    stroke: color,
                    strokeWidth,
                    id: Date.now().toString(),
                    type: 'rectangle',
                };
                setElements([...elements, newRect]);
            } else if (tool === 'circle') {
                // Create initial circle with 0 radius
                const newCircle: CircleElement = {
                    x: pos.x,
                    y: pos.y,
                    radius: 0,
                    fill: shapeFill ? color : 'transparent',
                    stroke: color,
                    strokeWidth,
                    id: Date.now().toString(),
                    type: 'circle',
                };
                setElements([...elements, newCircle]);
            } else if (tool === 'line') {
                // Create initial line with just start and end points at same position
                const newLine: LineShapeElement = {
                    points: [pos.x, pos.y, pos.x, pos.y],
                    stroke: color,
                    strokeWidth,
                    id: Date.now().toString(),
                    type: 'line-shape',
                };
                setElements([...elements, newLine]);
            } else if (tool === 'triangle') {
                // Create initial triangle at the current point
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
                };
                setElements([...elements, newTriangle]);
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
        };

        setElements([...elements, newLine]);
    };

    // Handle mouse move event on canvas
    const handleMouseMove = (e: any) => {
        if (!isDrawing) return;

        const stage = e.target.getStage();
        const point = stage.getPointerPosition();
        const lastElement = elements[elements.length - 1];

        if (tool === 'rectangle' && lastElement.type === 'rectangle') {
            // For rectangle, update width and height based on drag
            if (!startPoint) return;

            const updatedRect: RectangleElement = {
                ...lastElement,
                width: point.x - startPoint.x,
                height: point.y - startPoint.y,
            };

            const updatedElements = [...elements.slice(0, -1), updatedRect];
            setElements(updatedElements);
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
                ...lastElement,
                radius,
            };

            const updatedElements = [...elements.slice(0, -1), updatedCircle];
            setElements(updatedElements);
            return;
        }

        if (tool === 'line' && lastElement.type === 'line-shape') {
            // For line, update end point
            if (!startPoint) return;

            const updatedLine: LineShapeElement = {
                ...lastElement,
                points: [startPoint.x, startPoint.y, point.x, point.y],
            };

            const updatedElements = [...elements.slice(0, -1), updatedLine];
            setElements(updatedElements);
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
                ...lastElement,
                radius,
            };

            const updatedElements = [...elements.slice(0, -1), updatedTriangle];
            setElements(updatedElements);
            return;
        }

        if (lastElement.type === 'line') {
            // Add point to the last line
            lastElement.points = lastElement.points.concat([point.x, point.y]);

            // Replace last element with updated one
            const updatedElements = [...elements.slice(0, -1), lastElement];
            setElements(updatedElements);
        }
    };

    // Handle mouse up event on canvas
    const handleMouseUp = () => {
        setIsDrawing(false);
        setStartPoint(null);

        // Save to history
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push([...elements]);
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    // Handle undo
    const handleUndo = () => {
        if (historyStep > 0) {
            setHistoryStep(historyStep - 1);
            setElements(history[historyStep - 1]);
        }
    };

    // Handle redo
    const handleRedo = () => {
        if (historyStep < history.length - 1) {
            setHistoryStep(historyStep + 1);
            setElements(history[historyStep + 1]);
        }
    };

    // Clear canvas
    const handleClear = () => {
        setElements([]);

        // Save to history
        const newHistory = [...history, []];
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    // Save drawing (would connect to backend in full implementation)
    const handleSave = () => {
        // Here we would integrate with the backend API
        // For now, just show a success message

        alert(dict.drawing?.drawingSaved || 'Drawing saved successfully!');
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

    // Handle zoom in
    const handleZoomIn = () => {
        setScale(prevScale => Math.min(prevScale + 0.1, 3)); // Max zoom 3x
    };

    // Handle zoom out
    const handleZoomOut = () => {
        setScale(prevScale => Math.max(prevScale - 0.1, 0.5)); // Min zoom 0.5x
    };

    // Reset zoom
    const handleResetZoom = () => {
        setScale(1);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="h-screen w-full flex flex-col bg-slate-50 dark:bg-gray-900 overflow-hidden">
            {/* Header - Fixed height */}
            <header className="h-14 flex-shrink-0 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 px-4 flex items-center justify-between z-10">
                <div className="flex items-center">
                    <Link
                        href={`/${lang}/account`}
                        className="mr-3 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                        title={dict.drawing?.back || 'Back'}>
                        <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-gray-300" />
                    </Link>
                    <h1 className="text-lg font-medium text-slate-800 dark:text-white">
                        {dict.drawing?.untitledDesign || 'Untitled Design'}
                    </h1>
                </div>

                {/* Mobile menu toggle */}
                <button
                    className="md:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700"
                    onClick={toggleMobileMenu}>
                    <Menu className="h-5 w-5 text-slate-600 dark:text-gray-300" />
                </button>

                {/* Desktop actions */}
                <div className="hidden md:flex items-center space-x-3">
                    <button
                        onClick={handleSave}
                        className="flex items-center h-9 px-3 py-0 border border-slate-200 dark:border-gray-700 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                        <Save className="h-4 w-4 mr-1.5" />
                        {dict.drawing?.save || 'Save'}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center h-9 px-3 py-0 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                        <Download className="h-4 w-4 mr-1.5" />
                        {dict.drawing?.download || 'Download'}
                    </button>
                </div>
            </header>

            {/* Mobile menu drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={toggleMobileMenu}></div>
                    <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg p-4 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                                Tools
                            </h3>
                            <button onClick={toggleMobileMenu}>
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                className={`flex items-center px-3 py-2 rounded-lg ${tool === 'pencil' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}
                                onClick={() => {
                                    setTool('pencil');
                                    toggleMobileMenu();
                                }}>
                                <Pencil className="h-5 w-5 mr-2" />
                                Pencil
                            </button>
                            <button
                                className={`flex items-center px-3 py-2 rounded-lg ${tool === 'eraser' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}
                                onClick={() => {
                                    setTool('eraser');
                                    toggleMobileMenu();
                                }}>
                                <Eraser className="h-5 w-5 mr-2" />
                                Eraser
                            </button>
                            <button
                                className={`flex items-center px-3 py-2 rounded-lg ${tool === 'bucket' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}
                                onClick={() => {
                                    setTool('bucket');
                                    toggleMobileMenu();
                                }}>
                                <Droplet className="h-5 w-5 mr-2" />
                                Fill
                            </button>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                            <button
                                className={`flex items-center px-3 py-2 rounded-lg ${tool === 'rectangle' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}
                                onClick={() => {
                                    setTool('rectangle');
                                    toggleMobileMenu();
                                }}>
                                <Square className="h-5 w-5 mr-2" />
                                Rectangle
                            </button>
                            <button
                                className={`flex items-center px-3 py-2 rounded-lg ${tool === 'circle' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}
                                onClick={() => {
                                    setTool('circle');
                                    toggleMobileMenu();
                                }}>
                                <CircleIcon className="h-5 w-5 mr-2" />
                                Circle
                            </button>
                            <button
                                className={`flex items-center px-3 py-2 rounded-lg ${tool === 'line' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}
                                onClick={() => {
                                    setTool('line');
                                    toggleMobileMenu();
                                }}>
                                <Minus className="h-5 w-5 mr-2" />
                                Line
                            </button>
                            <button
                                className={`flex items-center px-3 py-2 rounded-lg ${tool === 'triangle' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}
                                onClick={() => {
                                    setTool('triangle');
                                    toggleMobileMenu();
                                }}>
                                <TriangleIcon className="h-5 w-5 mr-2" />
                                Triangle
                            </button>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                            <button
                                className="flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400"
                                onClick={() => {
                                    setShowSettings(true);
                                    toggleMobileMenu();
                                }}>
                                <Palette className="h-5 w-5 mr-2" />
                                Color & Size
                            </button>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                            <button
                                className={`flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 ${historyStep === 0 ? 'opacity-50' : ''}`}
                                onClick={handleUndo}
                                disabled={historyStep === 0}>
                                <Undo className="h-5 w-5 mr-2" />
                                Undo
                            </button>
                            <button
                                className={`flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 ${historyStep === history.length - 1 ? 'opacity-50' : ''}`}
                                onClick={handleRedo}
                                disabled={historyStep === history.length - 1}>
                                <Redo className="h-5 w-5 mr-2" />
                                Redo
                            </button>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                            <button
                                className="flex items-center px-3 py-2 rounded-lg text-red-500"
                                onClick={() => {
                                    handleClear();
                                    toggleMobileMenu();
                                }}>
                                <Trash2 className="h-5 w-5 mr-2" />
                                Clear
                            </button>

                            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                            <div className="flex justify-between items-center px-3 py-2">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Zoom
                                </span>
                                <div className="flex items-center space-x-2">
                                    <button
                                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                        onClick={() =>
                                            setScale(prevScale =>
                                                Math.max(prevScale - 0.1, 0.5),
                                            )
                                        }>
                                        <ZoomOut className="h-4 w-4" />
                                    </button>
                                    <button
                                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                        onClick={() => setScale(1)}>
                                        <span className="text-xs font-medium">
                                            {Math.round(scale * 100)}%
                                        </span>
                                    </button>
                                    <button
                                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                        onClick={() =>
                                            setScale(prevScale =>
                                                Math.min(prevScale + 0.1, 3),
                                            )
                                        }>
                                        <ZoomIn className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="mt-auto">
                            <button
                                onClick={() => {
                                    handleSave();
                                    toggleMobileMenu();
                                }}
                                className="w-full flex items-center justify-center h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 mb-2">
                                <Save className="h-4 w-4 mr-1.5" />
                                {dict.drawing?.save || 'Save'}
                            </button>
                            <button
                                onClick={() => {
                                    handleDownload();
                                    toggleMobileMenu();
                                }}
                                className="w-full flex items-center justify-center h-10 px-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-lg text-sm font-medium shadow-sm">
                                <Download className="h-4 w-4 mr-1.5" />
                                {dict.drawing?.download || 'Download'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Desktop Toolbar */}
                <div className="hidden md:flex w-16 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 flex-col items-center py-4 gap-2">
                    <button
                        className={`p-2 rounded-lg ${tool === 'pencil' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'} transition-colors duration-200`}
                        onClick={() => setTool('pencil')}
                        title={dict.drawing?.pencil || 'Pencil'}>
                        <Pencil className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-lg ${tool === 'eraser' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'} transition-colors duration-200`}
                        onClick={() => setTool('eraser')}
                        title={dict.drawing?.eraser || 'Eraser'}>
                        <Eraser className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-lg ${tool === 'bucket' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'} transition-colors duration-200`}
                        onClick={() => setTool('bucket')}
                        title={dict.drawing?.bucket || 'Fill'}>
                        <Droplet className="h-5 w-5" />
                    </button>

                    <div className="my-2 border-t border-slate-200 dark:border-gray-700 w-10"></div>

                    <button
                        className={`p-2 rounded-lg ${tool === 'rectangle' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'} transition-colors duration-200`}
                        onClick={() => setTool('rectangle')}
                        title={dict.drawing?.rectangle || 'Rectangle'}>
                        <Square className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-lg ${tool === 'circle' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'} transition-colors duration-200`}
                        onClick={() => setTool('circle')}
                        title={dict.drawing?.circle || 'Circle'}>
                        <CircleIcon className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-lg ${tool === 'line' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'} transition-colors duration-200`}
                        onClick={() => setTool('line')}
                        title={dict.drawing?.line || 'Line'}>
                        <Minus className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-lg ${tool === 'triangle' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'} transition-colors duration-200`}
                        onClick={() => setTool('triangle')}
                        title={dict.drawing?.triangle || 'Triangle'}>
                        <TriangleIcon className="h-5 w-5" />
                    </button>

                    <div className="my-2 border-t border-slate-200 dark:border-gray-700 w-10"></div>

                    <button
                        className="p-2 rounded-lg text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors duration-200 relative"
                        onClick={() => setShowSettings(!showSettings)}
                        title={dict.drawing?.settings || 'Settings'}>
                        <Palette className="h-5 w-5" />
                        <div
                            className="absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white dark:ring-gray-800"
                            style={{ backgroundColor: color }}></div>
                    </button>

                    <div className="my-2 border-t border-slate-200 dark:border-gray-700 w-10"></div>

                    <button
                        className={`p-2 rounded-lg text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors duration-200 ${historyStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleUndo}
                        disabled={historyStep === 0}
                        title={dict.drawing?.undo || 'Undo'}>
                        <Undo className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-lg text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors duration-200 ${historyStep === history.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleRedo}
                        disabled={historyStep === history.length - 1}
                        title={dict.drawing?.redo || 'Redo'}>
                        <Redo className="h-5 w-5" />
                    </button>

                    <div className="my-2 border-t border-slate-200 dark:border-gray-700 w-10"></div>

                    <button
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                        onClick={handleClear}
                        title={dict.drawing?.clear || 'Clear'}>
                        <Trash2 className="h-5 w-5" />
                    </button>

                    <div className="my-2 border-t border-slate-200 dark:border-gray-700 w-10"></div>

                    <button
                        className="p-2 rounded-lg text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        onClick={handleZoomIn}
                        title="Zoom In">
                        <ZoomIn className="h-5 w-5" />
                    </button>

                    <div className="flex items-center justify-center text-xs font-medium text-slate-600 dark:text-gray-400">
                        {Math.round(scale * 100)}%
                    </div>

                    <button
                        className="p-2 rounded-lg text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        onClick={handleZoomOut}
                        title="Zoom Out">
                        <ZoomOut className="h-5 w-5" />
                    </button>

                    <button
                        className="p-2 rounded-lg text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        onClick={handleResetZoom}
                        title="Reset Zoom">
                        <Maximize className="h-5 w-5" />
                    </button>
                </div>

                {/* Canvas - Take all available space with no padding */}
                <div className="flex-1 bg-slate-100 dark:bg-gray-900 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                        <div
                            style={{
                                transform: `scale(${scale})`,
                                transformOrigin: 'center center',
                            }}
                            className="border border-slate-300 dark:border-gray-600 shadow-md">
                            <Stage
                                width={dimensions.width}
                                height={dimensions.height}
                                onMouseDown={handleMouseDown}
                                onMousemove={handleMouseMove}
                                onMouseup={handleMouseUp}
                                onTouchStart={handleMouseDown}
                                onTouchMove={handleMouseMove}
                                onTouchEnd={handleMouseUp}
                                ref={stageRef}
                                className={`${tool === 'bucket' ? 'cursor-pointer' : 'cursor-crosshair'} bg-white dark:bg-gray-800`}>
                                <Layer ref={layerRef}>
                                    {elements.map(element => {
                                        if (element.type === 'line') {
                                            return (
                                                <Line
                                                    key={element.id}
                                                    points={element.points}
                                                    stroke={element.stroke}
                                                    strokeWidth={
                                                        element.strokeWidth
                                                    }
                                                    tension={element.tension}
                                                    lineCap={element.lineCap}
                                                    lineJoin={element.lineJoin}
                                                    globalCompositeOperation={
                                                        element.globalCompositeOperation
                                                    }
                                                />
                                            );
                                        } else if (element.type === 'rect') {
                                            const rectElement =
                                                element as RectElement;
                                            return rectElement.image ? (
                                                <Rect
                                                    key={rectElement.id}
                                                    x={rectElement.x}
                                                    y={rectElement.y}
                                                    width={rectElement.width}
                                                    height={rectElement.height}
                                                    fillPatternImage={
                                                        rectElement.image
                                                    }
                                                    fillPatternRepeat="no-repeat"
                                                />
                                            ) : (
                                                <Rect
                                                    key={rectElement.id}
                                                    x={rectElement.x}
                                                    y={rectElement.y}
                                                    width={rectElement.width}
                                                    height={rectElement.height}
                                                    fill={rectElement.fill}
                                                />
                                            );
                                        } else if (
                                            element.type === 'rectangle'
                                        ) {
                                            const rectElement =
                                                element as RectangleElement;
                                            return (
                                                <Rect
                                                    key={rectElement.id}
                                                    x={rectElement.x}
                                                    y={rectElement.y}
                                                    width={rectElement.width}
                                                    height={rectElement.height}
                                                    fill={rectElement.fill}
                                                    stroke={rectElement.stroke}
                                                    strokeWidth={
                                                        rectElement.strokeWidth
                                                    }
                                                />
                                            );
                                        } else if (element.type === 'circle') {
                                            const circleElement =
                                                element as CircleElement;
                                            return (
                                                <Circle
                                                    key={circleElement.id}
                                                    x={circleElement.x}
                                                    y={circleElement.y}
                                                    radius={
                                                        circleElement.radius
                                                    }
                                                    fill={circleElement.fill}
                                                    stroke={
                                                        circleElement.stroke
                                                    }
                                                    strokeWidth={
                                                        circleElement.strokeWidth
                                                    }
                                                />
                                            );
                                        } else if (
                                            element.type === 'line-shape'
                                        ) {
                                            const lineElement =
                                                element as LineShapeElement;
                                            return (
                                                <Line
                                                    key={lineElement.id}
                                                    points={lineElement.points}
                                                    stroke={lineElement.stroke}
                                                    strokeWidth={
                                                        lineElement.strokeWidth
                                                    }
                                                    tension={0}
                                                    lineCap="round"
                                                    lineJoin="round"
                                                />
                                            );
                                        } else if (
                                            element.type === 'triangle'
                                        ) {
                                            const triangleElement =
                                                element as TriangleElement;
                                            return (
                                                <RegularPolygon
                                                    key={triangleElement.id}
                                                    x={triangleElement.x}
                                                    y={triangleElement.y}
                                                    sides={3}
                                                    radius={
                                                        triangleElement.radius
                                                    }
                                                    fill={triangleElement.fill}
                                                    stroke={
                                                        triangleElement.stroke
                                                    }
                                                    strokeWidth={
                                                        triangleElement.strokeWidth
                                                    }
                                                />
                                            );
                                        } else {
                                            return null;
                                        }
                                    })}
                                </Layer>
                            </Stage>
                        </div>
                    </div>

                    {/* Canvas dimensions indicator */}
                    <div className="absolute top-3 left-3 bg-white/80 dark:bg-gray-800/80 text-slate-600 dark:text-gray-300 text-xs py-1 px-2 rounded-md backdrop-blur-sm">
                        {Math.round(dimensions.width)} ×{' '}
                        {Math.round(dimensions.height)}
                    </div>

                    {/* Floating zoom controls for mobile */}
                    <div className="md:hidden absolute bottom-16 right-4 bg-white dark:bg-gray-800 rounded-full shadow-lg p-1 flex space-x-1">
                        <button
                            className="p-2 rounded-full bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400"
                            onClick={handleZoomOut}>
                            <ZoomOut className="h-5 w-5" />
                        </button>
                        <button
                            className="p-2 rounded-full bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400"
                            onClick={handleResetZoom}>
                            <span className="text-xs font-medium">
                                {Math.round(scale * 100)}%
                            </span>
                        </button>
                        <button
                            className="p-2 rounded-full bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400"
                            onClick={handleZoomIn}>
                            <ZoomIn className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile toolbar - fixed at bottom */}
            <div className="md:hidden flex justify-center items-center h-12 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex space-x-3">
                    <button
                        className={`p-2 rounded-full ${tool === 'pencil' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-gray-400'}`}
                        onClick={() => setTool('pencil')}
                        title="Pencil">
                        <Pencil className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-full ${tool === 'eraser' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-gray-400'}`}
                        onClick={() => setTool('eraser')}
                        title="Eraser">
                        <Eraser className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-full ${tool === 'bucket' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-gray-400'}`}
                        onClick={() => setTool('bucket')}
                        title="Fill">
                        <Droplet className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-full ${tool === 'rectangle' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-gray-400'}`}
                        onClick={() => setTool('rectangle')}
                        title="Rectangle">
                        <Square className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-full ${tool === 'circle' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-gray-400'}`}
                        onClick={() => setTool('circle')}
                        title="Circle">
                        <CircleIcon className="h-5 w-5" />
                    </button>

                    <button
                        className="p-2 rounded-full text-slate-600 dark:text-gray-400 relative"
                        onClick={() => setShowSettings(!showSettings)}
                        title="Color & Size">
                        <Palette className="h-5 w-5" />
                        <div
                            className="absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-white dark:ring-gray-800"
                            style={{ backgroundColor: color }}></div>
                    </button>

                    <button
                        className={`p-2 rounded-full text-slate-600 dark:text-gray-400 ${historyStep === 0 ? 'opacity-50' : ''}`}
                        onClick={handleUndo}
                        disabled={historyStep === 0}
                        title="Undo">
                        <Undo className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-full text-slate-600 dark:text-gray-400 ${historyStep === history.length - 1 ? 'opacity-50' : ''}`}
                        onClick={handleRedo}
                        disabled={historyStep === history.length - 1}
                        title="Redo">
                        <Redo className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Settings panel */}
            {showSettings && (
                <div className="fixed right-4 top-16 md:right-6 md:top-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-20 w-72 border border-slate-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-slate-900 dark:text-white flex items-center">
                            <Layers className="h-4 w-4 mr-2 text-indigo-500" />
                            {dict.drawing?.toolSettings || 'Tool Settings'}
                        </h3>
                        <button
                            className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700"
                            onClick={() => setShowSettings(false)}>
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                                {dict.drawing?.brushSize || 'Brush Size'}
                            </label>
                            <div className="flex items-center">
                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    value={strokeWidth}
                                    onChange={e =>
                                        setStrokeWidth(Number(e.target.value))
                                    }
                                    className="flex-1 h-2 bg-slate-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
                                />
                                <span className="ml-3 text-sm text-slate-600 dark:text-gray-400 w-6 text-center">
                                    {strokeWidth}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                                {dict.drawing?.brushColor || 'Color'}
                            </label>
                            <div className="grid grid-cols-5 gap-2 mb-3">
                                {colors.map(c => (
                                    <button
                                        key={c}
                                        className={`w-10 h-10 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-indigo-400 dark:ring-offset-gray-800' : 'ring-1 ring-slate-200 dark:ring-gray-700'} flex items-center justify-center shadow-sm`}
                                        style={{ backgroundColor: c }}
                                        onClick={() => setColor(c)}
                                        title={c}>
                                        {color === c && (
                                            <CheckCircle
                                                className={`h-4 w-4 ${c === '#FFFFFF' || c === '#FFFF00' ? 'text-black' : 'text-white'}`}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center">
                                <label
                                    htmlFor="customColor"
                                    className="text-sm font-medium text-slate-700 dark:text-gray-300 mr-3">
                                    {dict.drawing?.custom || 'Custom'}:
                                </label>
                                <div className="relative">
                                    <input
                                        type="color"
                                        id="customColor"
                                        value={color}
                                        onChange={e => setColor(e.target.value)}
                                        className="w-10 h-10 p-0 border-0 rounded-full cursor-pointer"
                                    />
                                </div>
                                <span className="ml-3 text-sm font-mono text-slate-600 dark:text-gray-400">
                                    {color.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {(tool === 'rectangle' ||
                            tool === 'circle' ||
                            tool === 'triangle') && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                                    Shape Fill
                                </label>
                                <div className="flex items-center space-x-4">
                                    <button
                                        className={`flex items-center px-3 py-2 rounded-lg ${
                                            shapeFill
                                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                                : 'text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                                        }`}
                                        onClick={() => setShapeFill(true)}>
                                        <div className="h-4 w-4 bg-current mr-2 rounded"></div>
                                        Filled
                                    </button>
                                    <button
                                        className={`flex items-center px-3 py-2 rounded-lg ${
                                            !shapeFill
                                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                                : 'text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                                        }`}
                                        onClick={() => setShapeFill(false)}>
                                        <div className="h-4 w-4 border border-current mr-2 rounded"></div>
                                        Outline
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
