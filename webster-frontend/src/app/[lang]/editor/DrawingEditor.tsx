'use client';

import { useState, useRef, useEffect } from 'react';
import { useDictionary } from '@/contexts/DictionaryContext';
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
    Eye,
    EyeOff,
    Lock,
    Unlock,
    Plus,
    ArrowUp,
    ArrowDown,
    Edit,
    Copy,
    Trash,
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
    layerId: string; // Add layerId to track which layer this element belongs to
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
    layerId: string; // Add layerId
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
    layerId: string; // Add layerId
}

interface LineShapeElement {
    points: number[];
    stroke: string;
    strokeWidth: number;
    id: string;
    type: 'line-shape';
    layerId: string; // Add layerId
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
    layerId: string; // Add layerId
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
    layerId: string; // Add layerId
}

interface Resolution {
    name: string;
    width: number;
    height: number;
}

// Define Layer interface
interface DrawingLayer {
    id: string;
    name: string;
    visible: boolean;
    locked: boolean;
    opacity: number; // New property for layer opacity
}

const POPULAR_RESOLUTIONS: Resolution[] = [
    { name: 'HD (16:9)', width: 1280, height: 720 },
    { name: 'Full HD', width: 1920, height: 1080 },
    { name: 'Square', width: 1080, height: 1080 },
    { name: 'Instagram Post', width: 1080, height: 1350 },
    { name: 'Instagram Story', width: 1080, height: 1920 },
    { name: 'Twitter Post', width: 1200, height: 675 },
    { name: 'Facebook Post', width: 1200, height: 630 },
    { name: 'A4 Document', width: 2480, height: 3508 },
];

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
    const layerRefs = useRef<Map<string, any>>(new Map());

    // Changed from elements array to a map of elements by layer ID
    const [elementsByLayer, setElementsByLayer] = useState<
        Map<string, DrawingElement[]>
    >(new Map());

    // Layers management
    const [layers, setLayers] = useState<DrawingLayer[]>([]);
    const [activeLayerId, setActiveLayerId] = useState<string>('');
    const [showLayersPanel, setShowLayersPanel] = useState<boolean>(false);

    const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
    const [isDrawing, setIsDrawing] = useState(false);

    // Modified history to track layers and elements
    const [historyStep, setHistoryStep] = useState(0);
    const [history, setHistory] = useState<
        {
            layers: DrawingLayer[];
            elementsByLayer: Map<string, DrawingElement[]>;
        }[]
    >([]);

    const [resizeInitialRect, setResizeInitialRect] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    const DEFAULT_RESOLUTION = POPULAR_RESOLUTIONS[0];
    const [dimensions, setDimensions] = useState({
        width: DEFAULT_RESOLUTION.width,
        height: DEFAULT_RESOLUTION.height,
    });
    const [selectedResolution, setSelectedResolution] =
        useState<Resolution>(DEFAULT_RESOLUTION);
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
    const [scale, setScale] = useState(1);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeDirection, setResizeDirection] = useState('');
    const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
    const [originalDimensions, setOriginalDimensions] = useState({
        width: 0,
        height: 0,
    });
    const canvasWrapperRef = useRef<HTMLDivElement>(null);
    const [startPoint, setStartPoint] = useState<{
        x: number;
        y: number;
    } | null>(null);
    const [shapeFill, setShapeFill] = useState(true);
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

    // Initialize with a default layer
    useEffect(() => {
        const defaultLayerId = Date.now().toString();
        const defaultLayer: DrawingLayer = {
            id: defaultLayerId,
            name: 'Layer 1',
            visible: true,
            locked: false,
            opacity: 1,
        };

        setLayers([defaultLayer]);
        setActiveLayerId(defaultLayerId);
        setElementsByLayer(new Map([[defaultLayerId, []]]));

        // Initialize history
        setHistory([
            {
                layers: [defaultLayer],
                elementsByLayer: new Map([[defaultLayerId, []]]),
            },
        ]);

        return () => {
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
            document.removeEventListener('touchmove', handleResizeMove);
            document.removeEventListener('touchend', handleResizeEnd);
        };
    }, []);

    // Helper function to get elements from active layer
    const getActiveLayerElements = (): DrawingElement[] => {
        return elementsByLayer.get(activeLayerId) || [];
    };

    // Helper function to update elements in active layer
    const updateActiveLayerElements = (newElements: DrawingElement[]) => {
        const updatedMap = new Map(elementsByLayer);
        updatedMap.set(activeLayerId, newElements);
        setElementsByLayer(updatedMap);
    };

    // Add a new layer
    const addLayer = () => {
        const newLayerId = Date.now().toString();
        const newLayer: DrawingLayer = {
            id: newLayerId,
            name: `Layer ${layers.length + 1}`,
            visible: true,
            locked: false,
            opacity: 1,
        };

        const updatedLayers = [...layers, newLayer];
        setLayers(updatedLayers);
        setActiveLayerId(newLayerId);

        // Add empty elements array for this layer
        const updatedElementsByLayer = new Map(elementsByLayer);
        updatedElementsByLayer.set(newLayerId, []);
        setElementsByLayer(updatedElementsByLayer);

        // Save to history
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers: updatedLayers,
            elementsByLayer: updatedElementsByLayer,
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    // Delete layer
    const deleteLayer = (layerId: string) => {
        if (layers.length <= 1) {
            // Don't allow deleting the last layer
            alert('Cannot delete the only layer');
            return;
        }

        const updatedLayers = layers.filter(layer => layer.id !== layerId);
        setLayers(updatedLayers);

        // Update elementsByLayer
        const updatedElementsByLayer = new Map(elementsByLayer);
        updatedElementsByLayer.delete(layerId);
        setElementsByLayer(updatedElementsByLayer);

        // If active layer was deleted, set active to the last layer
        if (activeLayerId === layerId) {
            setActiveLayerId(updatedLayers[updatedLayers.length - 1].id);
        }

        // Save to history
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers: updatedLayers,
            elementsByLayer: updatedElementsByLayer,
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    // Toggle layer visibility
    const toggleLayerVisibility = (layerId: string) => {
        const updatedLayers = layers.map(layer =>
            layer.id === layerId
                ? { ...layer, visible: !layer.visible }
                : layer,
        );
        setLayers(updatedLayers);

        // Save to history
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers: updatedLayers,
            elementsByLayer: elementsByLayer,
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    // Toggle layer lock
    const toggleLayerLock = (layerId: string) => {
        const updatedLayers = layers.map(layer =>
            layer.id === layerId ? { ...layer, locked: !layer.locked } : layer,
        );
        setLayers(updatedLayers);

        // Save to history
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers: updatedLayers,
            elementsByLayer: elementsByLayer,
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    // Rename layer
    const renameLayer = (layerId: string, newName: string) => {
        const updatedLayers = layers.map(layer =>
            layer.id === layerId ? { ...layer, name: newName } : layer,
        );
        setLayers(updatedLayers);

        // Save to history
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers: updatedLayers,
            elementsByLayer: elementsByLayer,
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    // Move layer up
    const moveLayerUp = (layerId: string) => {
        const layerIndex = layers.findIndex(layer => layer.id === layerId);
        if (layerIndex <= 0) return; // Already at the top

        const updatedLayers = [...layers];
        const temp = updatedLayers[layerIndex];
        updatedLayers[layerIndex] = updatedLayers[layerIndex - 1];
        updatedLayers[layerIndex - 1] = temp;

        setLayers(updatedLayers);

        // Save to history
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers: updatedLayers,
            elementsByLayer: elementsByLayer,
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    // Move layer down
    const moveLayerDown = (layerId: string) => {
        const layerIndex = layers.findIndex(layer => layer.id === layerId);
        if (layerIndex >= layers.length - 1) return; // Already at the bottom

        const updatedLayers = [...layers];
        const temp = updatedLayers[layerIndex];
        updatedLayers[layerIndex] = updatedLayers[layerIndex + 1];
        updatedLayers[layerIndex + 1] = temp;

        setLayers(updatedLayers);

        // Save to history
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers: updatedLayers,
            elementsByLayer: elementsByLayer,
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    // Duplicate layer
    const duplicateLayer = (layerId: string) => {
        const sourceLayer = layers.find(layer => layer.id === layerId);
        if (!sourceLayer) return;

        const newLayerId = Date.now().toString();
        const newLayer: DrawingLayer = {
            id: newLayerId,
            name: `${sourceLayer.name} (Copy)`,
            visible: true,
            locked: false,
            opacity: sourceLayer.opacity,
        };

        // Copy elements from source layer
        const sourceElements = elementsByLayer.get(layerId) || [];
        const duplicatedElements = sourceElements.map(element => ({
            ...element,
            id: `${element.id}-copy-${Date.now()}`,
            layerId: newLayerId,
        }));

        const updatedLayers = [...layers, newLayer];
        setLayers(updatedLayers);
        setActiveLayerId(newLayerId);

        // Add duplicated elements for this layer
        const updatedElementsByLayer = new Map(elementsByLayer);
        updatedElementsByLayer.set(newLayerId, duplicatedElements);
        setElementsByLayer(updatedElementsByLayer);

        // Save to history
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers: updatedLayers,
            elementsByLayer: updatedElementsByLayer,
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    // Update layer opacity
    const updateLayerOpacity = (layerId: string, opacity: number) => {
        const updatedLayers = layers.map(layer =>
            layer.id === layerId ? { ...layer, opacity: opacity } : layer,
        );
        setLayers(updatedLayers);

        // Save to history
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers: updatedLayers,
            elementsByLayer: elementsByLayer,
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    // Merge layer down
    const mergeLayerDown = (layerId: string) => {
        const layerIndex = layers.findIndex(layer => layer.id === layerId);
        if (layerIndex >= layers.length - 1) return; // No layer below to merge with

        const upperLayerId = layerId;
        const lowerLayerId = layers[layerIndex + 1].id;

        const upperElements = elementsByLayer.get(upperLayerId) || [];
        const lowerElements = elementsByLayer.get(lowerLayerId) || [];

        // Merge elements into the lower layer
        const mergedElements = [
            ...lowerElements,
            ...upperElements.map(el => ({
                ...el,
                layerId: lowerLayerId,
            })),
        ];

        // Remove the upper layer
        const updatedLayers = layers.filter(layer => layer.id !== upperLayerId);

        // Update elements
        const updatedElementsByLayer = new Map(elementsByLayer);
        updatedElementsByLayer.delete(upperLayerId);
        updatedElementsByLayer.set(lowerLayerId, mergedElements);

        setLayers(updatedLayers);
        setElementsByLayer(updatedElementsByLayer);
        setActiveLayerId(lowerLayerId);

        // Save to history
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers: updatedLayers,
            elementsByLayer: updatedElementsByLayer,
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    const handleResolutionChange = (resolution: Resolution) => {
        const oldDimensions = { ...dimensions };
        setSelectedResolution(resolution);
        const scaleX = resolution.width / oldDimensions.width;
        const scaleY = resolution.height / oldDimensions.height;

        // Scale elements in all layers
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
                    const rectElement = element as
                        | RectElement
                        | RectangleElement;
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

        setElementsByLayer(scaledElementsByLayer);
        setDimensions({ width: resolution.width, height: resolution.height });

        // Save to history
        const newHistory = [
            {
                layers: layers,
                elementsByLayer: scaledElementsByLayer,
            },
        ];
        setHistory(newHistory);
        setHistoryStep(0);
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

        // Scale elements in all layers
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
                    const rectElement = element as
                        | RectElement
                        | RectangleElement;
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
            name: `Custom (${Math.round(dimensions.width)}×${Math.round(
                dimensions.height,
            )})`,
            width: Math.round(dimensions.width),
            height: Math.round(dimensions.height),
        };
        setElementsByLayer(scaledElementsByLayer);
        setSelectedResolution(customResolution);

        // Save to history
        const newHistory = [
            ...history.slice(0, historyStep + 1),
            {
                layers: layers,
                elementsByLayer: scaledElementsByLayer,
            },
        ];
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);

        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.removeEventListener('touchmove', handleResizeMove);
        document.removeEventListener('touchend', handleResizeEnd);
    };

    const CustomResolutionInput = () => {
        const [customWidth, setCustomWidth] = useState(
            dimensions.width.toString(),
        );
        const [customHeight, setCustomHeight] = useState(
            dimensions.height.toString(),
        );

        const handleCustomResolutionSubmit = () => {
            const width = parseInt(customWidth, 10);
            const height = parseInt(customHeight, 10);
            if (isNaN(width) || isNaN(height) || width < 100 || height < 100) {
                alert('Please enter valid dimensions (minimum 100x100)');
                return;
            }
            const customResolution: Resolution = {
                name: `Custom (${width}×${height})`,
                width,
                height,
            };
            handleResolutionChange(customResolution);
        };

        return (
            <div className="mt-3 p-3 bg-slate-50 dark:bg-gray-700 rounded-lg">
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                    Custom Resolution
                </label>
                <div className="flex items-center gap-2 mb-2">
                    <input
                        type="number"
                        min="100"
                        value={customWidth}
                        onChange={e => setCustomWidth(e.target.value)}
                        className="w-20 px-2 py-1 text-sm border border-slate-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-slate-800 dark:text-gray-200"
                    />
                    <span className="text-slate-500 dark:text-gray-400">×</span>
                    <input
                        type="number"
                        min="100"
                        value={customHeight}
                        onChange={e => setCustomHeight(e.target.value)}
                        className="w-20 px-2 py-1 text-sm border border-slate-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-slate-800 dark:text-gray-200"
                    />
                    <button
                        onClick={handleCustomResolutionSubmit}
                        className="ml-2 px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800/30">
                        Apply
                    </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                    You can also resize by dragging the canvas edges
                </p>
            </div>
        );
    };

    const ResolutionSelector = () => {
        return (
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                    {dict.drawing?.canvasSize || 'Canvas Size'}
                </label>
                <div className="grid grid-cols-1 gap-2">
                    {POPULAR_RESOLUTIONS.map(resolution => (
                        <button
                            key={`${resolution.width}x${resolution.height}`}
                            className={`text-left px-3 py-2 rounded-lg text-sm ${
                                selectedResolution.width === resolution.width &&
                                selectedResolution.height === resolution.height
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => handleResolutionChange(resolution)}>
                            {resolution.name} ({resolution.width} ×{' '}
                            {resolution.height})
                        </button>
                    ))}
                </div>

                <CustomResolutionInput />
            </div>
        );
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
                const newRect: RectElement = {
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
                const activeElements = elementsByLayer.get(activeLayerId) || [];
                const newElements = [...activeElements, newRect];

                // Update the elements map
                const updatedElementsByLayer = new Map(elementsByLayer);
                updatedElementsByLayer.set(activeLayerId, newElements);
                setElementsByLayer(updatedElementsByLayer);

                // Save to history
                const newHistory = history.slice(0, historyStep + 1);
                newHistory.push({
                    layers: layers,
                    elementsByLayer: updatedElementsByLayer,
                });
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

        // Get the active layer
        const activeLayer = layers.find(layer => layer.id === activeLayerId);
        if (!activeLayer || !activeLayer.visible || activeLayer.locked) return;

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
                    layerId: activeLayerId, // Assign to active layer
                };

                // Add element to active layer
                const activeElements = elementsByLayer.get(activeLayerId) || [];
                const updatedElements = [...activeElements, newRect];

                // Update the elements map
                const updatedElementsByLayer = new Map(elementsByLayer);
                updatedElementsByLayer.set(activeLayerId, updatedElements);
                setElementsByLayer(updatedElementsByLayer);
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
                    layerId: activeLayerId, // Assign to active layer
                };

                // Add element to active layer
                const activeElements = elementsByLayer.get(activeLayerId) || [];
                const updatedElements = [...activeElements, newCircle];

                // Update the elements map
                const updatedElementsByLayer = new Map(elementsByLayer);
                updatedElementsByLayer.set(activeLayerId, updatedElements);
                setElementsByLayer(updatedElementsByLayer);
            } else if (tool === 'line') {
                // Create initial line with just start and end points at same position
                const newLine: LineShapeElement = {
                    points: [pos.x, pos.y, pos.x, pos.y],
                    stroke: color,
                    strokeWidth,
                    id: Date.now().toString(),
                    type: 'line-shape',
                    layerId: activeLayerId, // Assign to active layer
                };

                // Add element to active layer
                const activeElements = elementsByLayer.get(activeLayerId) || [];
                const updatedElements = [...activeElements, newLine];

                // Update the elements map
                const updatedElementsByLayer = new Map(elementsByLayer);
                updatedElementsByLayer.set(activeLayerId, updatedElements);
                setElementsByLayer(updatedElementsByLayer);
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
                    layerId: activeLayerId, // Assign to active layer
                };

                // Add element to active layer
                const activeElements = elementsByLayer.get(activeLayerId) || [];
                const updatedElements = [...activeElements, newTriangle];

                // Update the elements map
                const updatedElementsByLayer = new Map(elementsByLayer);
                updatedElementsByLayer.set(activeLayerId, updatedElements);
                setElementsByLayer(updatedElementsByLayer);
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
            layerId: activeLayerId, // Assign to active layer
        };

        // Add element to active layer
        const activeElements = elementsByLayer.get(activeLayerId) || [];
        const updatedElements = [...activeElements, newLine];

        // Update the elements map
        const updatedElementsByLayer = new Map(elementsByLayer);
        updatedElementsByLayer.set(activeLayerId, updatedElements);
        setElementsByLayer(updatedElementsByLayer);
    };

    // Handle mouse move event on canvas
    const handleMouseMove = (e: any) => {
        if (!isDrawing) return;

        // Get the active layer
        const activeLayer = layers.find(layer => layer.id === activeLayerId);
        if (!activeLayer || !activeLayer.visible || activeLayer.locked) return;

        const stage = e.target.getStage();
        const point = stage.getPointerPosition();

        // Get active layer elements
        const activeElements = elementsByLayer.get(activeLayerId) || [];
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

            // Update the elements map
            const updatedElementsByLayer = new Map(elementsByLayer);
            updatedElementsByLayer.set(activeLayerId, updatedElements);
            setElementsByLayer(updatedElementsByLayer);
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

            // Update the elements map
            const updatedElementsByLayer = new Map(elementsByLayer);
            updatedElementsByLayer.set(activeLayerId, updatedElements);
            setElementsByLayer(updatedElementsByLayer);
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

            // Update the elements map
            const updatedElementsByLayer = new Map(elementsByLayer);
            updatedElementsByLayer.set(activeLayerId, updatedElements);
            setElementsByLayer(updatedElementsByLayer);
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

            // Update the elements map
            const updatedElementsByLayer = new Map(elementsByLayer);
            updatedElementsByLayer.set(activeLayerId, updatedElements);
            setElementsByLayer(updatedElementsByLayer);
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

            // Update the elements map
            const updatedElementsByLayer = new Map(elementsByLayer);
            updatedElementsByLayer.set(activeLayerId, updatedElements);
            setElementsByLayer(updatedElementsByLayer);
        }
    };

    // Handle mouse up event on canvas
    const handleMouseUp = () => {
        setIsDrawing(false);
        setStartPoint(null);

        // Save to history
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers: layers,
            elementsByLayer: new Map(elementsByLayer),
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    // Handle undo
    const handleUndo = () => {
        if (historyStep > 0) {
            setHistoryStep(historyStep - 1);
            const { layers: prevLayers, elementsByLayer: prevElements } =
                history[historyStep - 1];
            setLayers(prevLayers);
            setElementsByLayer(prevElements);

            // Make sure active layer still exists
            if (!prevLayers.find(layer => layer.id === activeLayerId)) {
                setActiveLayerId(prevLayers[0].id);
            }
        }
    };

    // Handle redo
    const handleRedo = () => {
        if (historyStep < history.length - 1) {
            setHistoryStep(historyStep + 1);
            const { layers: nextLayers, elementsByLayer: nextElements } =
                history[historyStep + 1];
            setLayers(nextLayers);
            setElementsByLayer(nextElements);

            // Make sure active layer still exists
            if (!nextLayers.find(layer => layer.id === activeLayerId)) {
                setActiveLayerId(nextLayers[0].id);
            }
        }
    };

    // Clear canvas
    const handleClear = () => {
        // Clear all elements from all layers
        const clearedElementsByLayer = new Map();
        layers.forEach(layer => {
            clearedElementsByLayer.set(layer.id, []);
        });

        setElementsByLayer(clearedElementsByLayer);

        // Save to history
        const newHistory = [
            ...history,
            {
                layers: layers,
                elementsByLayer: clearedElementsByLayer,
            },
        ];
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

    // Layer Panel component
    const LayerPanel = () => {
        const [editingLayerId, setEditingLayerId] = useState<string | null>(
            null,
        );
        const [editingName, setEditingName] = useState('');

        const startEditing = (layer: DrawingLayer) => {
            setEditingLayerId(layer.id);
            setEditingName(layer.name);
        };

        const saveLayerName = () => {
            if (editingLayerId && editingName.trim()) {
                renameLayer(editingLayerId, editingName.trim());
                setEditingLayerId(null);
            }
        };

        return (
            <div className="fixed right-4 bottom-16 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-slate-200 dark:border-gray-700 z-20 max-h-96 overflow-auto">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-slate-900 dark:text-white flex items-center">
                        <Layers className="h-4 w-4 mr-2 text-indigo-500" />
                        {dict.drawing?.layers || 'Layers'}
                    </h3>

                    <div className="flex items-center space-x-1">
                        <button
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300"
                            onClick={addLayer}
                            title="Add Layer">
                            <Plus className="h-4 w-4" />
                        </button>
                        <button
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300"
                            onClick={() => setShowLayersPanel(false)}>
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    {layers.map((layer, index) => (
                        <div
                            key={layer.id}
                            className={`p-2 rounded-md ${activeLayerId === layer.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800' : 'hover:bg-slate-50 dark:hover:bg-gray-700'}`}
                            onClick={() => setActiveLayerId(layer.id)}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <button
                                        className="mr-2 text-slate-600 dark:text-gray-400"
                                        onClick={e => {
                                            e.stopPropagation();
                                            toggleLayerVisibility(layer.id);
                                        }}
                                        title={
                                            layer.visible
                                                ? 'Hide Layer'
                                                : 'Show Layer'
                                        }>
                                        {layer.visible ? (
                                            <Eye className="h-4 w-4" />
                                        ) : (
                                            <EyeOff className="h-4 w-4 opacity-60" />
                                        )}
                                    </button>

                                    {editingLayerId === layer.id ? (
                                        <div className="flex items-center">
                                            <input
                                                type="text"
                                                value={editingName}
                                                onChange={e =>
                                                    setEditingName(
                                                        e.target.value,
                                                    )
                                                }
                                                className="px-1 py-0.5 text-sm rounded border border-indigo-200 dark:border-indigo-700 dark:bg-gray-700 w-full"
                                                onClick={e =>
                                                    e.stopPropagation()
                                                }
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter')
                                                        saveLayerName();
                                                    if (e.key === 'Escape')
                                                        setEditingLayerId(null);
                                                }}
                                                autoFocus
                                            />
                                            <button
                                                className="ml-1 p-1 text-indigo-500 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    saveLayerName();
                                                }}>
                                                <CheckCircle className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span
                                            className={`text-sm font-medium ${!layer.visible ? 'text-slate-400 dark:text-gray-500' : 'text-slate-700 dark:text-gray-200'}`}>
                                            {layer.name}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center">
                                    <button
                                        className="ml-1 p-1 text-slate-500 dark:text-gray-400 rounded hover:bg-slate-100 dark:hover:bg-gray-700"
                                        onClick={e => {
                                            e.stopPropagation();
                                            toggleLayerLock(layer.id);
                                        }}
                                        title={
                                            layer.locked
                                                ? 'Unlock Layer'
                                                : 'Lock Layer'
                                        }>
                                        {layer.locked ? (
                                            <Lock className="h-3.5 w-3.5" />
                                        ) : (
                                            <Unlock className="h-3.5 w-3.5 opacity-60" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {activeLayerId === layer.id && (
                                <div className="mt-2 pl-6 flex flex-col gap-2">
                                    {/* Layer opacity control */}
                                    <div className="flex items-center text-xs">
                                        <span className="w-16 text-slate-500 dark:text-gray-400">
                                            Opacity:
                                        </span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={layer.opacity}
                                            onChange={e =>
                                                updateLayerOpacity(
                                                    layer.id,
                                                    parseFloat(e.target.value),
                                                )
                                            }
                                            className="flex-1 h-1.5 bg-slate-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
                                            onClick={e => e.stopPropagation()}
                                        />
                                        <span className="ml-2 w-8 text-right text-slate-600 dark:text-gray-400">
                                            {Math.round(layer.opacity * 100)}%
                                        </span>
                                    </div>

                                    {/* Layer actions */}
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        <button
                                            className="px-1.5 py-1 text-xs rounded bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600"
                                            onClick={e => {
                                                e.stopPropagation();
                                                startEditing(layer);
                                            }}>
                                            <Edit className="h-3 w-3 inline mr-1" />
                                            Rename
                                        </button>

                                        <button
                                            className="px-1.5 py-1 text-xs rounded bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600"
                                            onClick={e => {
                                                e.stopPropagation();
                                                duplicateLayer(layer.id);
                                            }}>
                                            <Copy className="h-3 w-3 inline mr-1" />
                                            Duplicate
                                        </button>

                                        <button
                                            className="px-1.5 py-1 text-xs rounded bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600"
                                            onClick={e => {
                                                e.stopPropagation();
                                                index > 0 &&
                                                    moveLayerUp(layer.id);
                                            }}
                                            disabled={index === 0}>
                                            <ArrowUp className="h-3 w-3 inline mr-1" />
                                            Move Up
                                        </button>

                                        <button
                                            className="px-1.5 py-1 text-xs rounded bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600"
                                            onClick={e => {
                                                e.stopPropagation();
                                                index < layers.length - 1 &&
                                                    moveLayerDown(layer.id);
                                            }}
                                            disabled={
                                                index === layers.length - 1
                                            }>
                                            <ArrowDown className="h-3 w-3 inline mr-1" />
                                            Move Down
                                        </button>

                                        {index < layers.length - 1 && (
                                            <button
                                                className="px-1.5 py-1 text-xs rounded bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    mergeLayerDown(layer.id);
                                                }}>
                                                <Layers className="h-3 w-3 inline mr-1" />
                                                Merge Down
                                            </button>
                                        )}

                                        <button
                                            className="px-1.5 py-1 text-xs rounded bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                                            onClick={e => {
                                                e.stopPropagation();
                                                deleteLayer(layer.id);
                                            }}
                                            disabled={layers.length <= 1}>
                                            <Trash className="h-3 w-3 inline mr-1" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
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
                                className={`flex items-center px-3 py-2 rounded-lg ${
                                    tool === 'pencil'
                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                        : 'text-gray-600 dark:text-gray-400'
                                }`}
                                onClick={() => {
                                    setTool('pencil');
                                    toggleMobileMenu();
                                }}>
                                <Pencil className="h-5 w-5 mr-2" />
                                Pencil
                            </button>
                            <button
                                className={`flex items-center px-3 py-2 rounded-lg ${
                                    tool === 'eraser'
                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                        : 'text-gray-600 dark:text-gray-400'
                                }`}
                                onClick={() => {
                                    setTool('eraser');
                                    toggleMobileMenu();
                                }}>
                                <Eraser className="h-5 w-5 mr-2" />
                                Eraser
                            </button>
                            <button
                                className={`flex items-center px-3 py-2 rounded-lg ${
                                    tool === 'bucket'
                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                        : 'text-gray-600 dark:text-gray-400'
                                }`}
                                onClick={() => {
                                    setTool('bucket');
                                    toggleMobileMenu();
                                }}>
                                <Droplet className="h-5 w-5 mr-2" />
                                Fill
                            </button>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                            <button
                                className={`flex items-center px-3 py-2 rounded-lg ${
                                    tool === 'rectangle'
                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                        : 'text-gray-600 dark:text-gray-400'
                                }`}
                                onClick={() => {
                                    setTool('rectangle');
                                    toggleMobileMenu();
                                }}>
                                <Square className="h-5 w-5 mr-2" />
                                Rectangle
                            </button>
                            <button
                                className={`flex items-center px-3 py-2 rounded-lg ${
                                    tool === 'circle'
                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                        : 'text-gray-600 dark:text-gray-400'
                                }`}
                                onClick={() => {
                                    setTool('circle');
                                    toggleMobileMenu();
                                }}>
                                <CircleIcon className="h-5 w-5 mr-2" />
                                Circle
                            </button>
                            <button
                                className={`flex items-center px-3 py-2 rounded-lg ${
                                    tool === 'line'
                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                        : 'text-gray-600 dark:text-gray-400'
                                }`}
                                onClick={() => {
                                    setTool('line');
                                    toggleMobileMenu();
                                }}>
                                <Minus className="h-5 w-5 mr-2" />
                                Line
                            </button>
                            <button
                                className={`flex items-center px-3 py-2 rounded-lg ${
                                    tool === 'triangle'
                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                        : 'text-gray-600 dark:text-gray-400'
                                }`}
                                onClick={() => {
                                    setTool('triangle');
                                    toggleMobileMenu();
                                }}>
                                <TriangleIcon className="h-5 w-5 mr-2" />
                                Triangle
                            </button>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                            {/* Layers Button in Mobile Menu */}
                            <button
                                className="flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400"
                                onClick={() => {
                                    setShowLayersPanel(!showLayersPanel);
                                    toggleMobileMenu();
                                }}>
                                <Layers className="h-5 w-5 mr-2" />
                                Layers
                            </button>

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
                                className={`flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 ${
                                    historyStep === 0 ? 'opacity-50' : ''
                                }`}
                                onClick={handleUndo}
                                disabled={historyStep === 0}>
                                <Undo className="h-5 w-5 mr-2" />
                                Undo
                            </button>
                            <button
                                className={`flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 ${
                                    historyStep === history.length - 1
                                        ? 'opacity-50'
                                        : ''
                                }`}
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
                        className={`p-2 rounded-lg ${
                            tool === 'pencil'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                        } transition-colors duration-200`}
                        onClick={() => setTool('pencil')}
                        title={dict.drawing?.pencil || 'Pencil'}>
                        <Pencil className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-lg ${
                            tool === 'eraser'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                        } transition-colors duration-200`}
                        onClick={() => setTool('eraser')}
                        title={dict.drawing?.eraser || 'Eraser'}>
                        <Eraser className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-lg ${
                            tool === 'bucket'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                        } transition-colors duration-200`}
                        onClick={() => setTool('bucket')}
                        title={dict.drawing?.bucket || 'Fill'}>
                        <Droplet className="h-5 w-5" />
                    </button>

                    <div className="my-2 border-t border-slate-200 dark:border-gray-700 w-10"></div>

                    <button
                        className={`p-2 rounded-lg ${
                            tool === 'rectangle'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                        } transition-colors duration-200`}
                        onClick={() => setTool('rectangle')}
                        title={dict.drawing?.rectangle || 'Rectangle'}>
                        <Square className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-lg ${
                            tool === 'circle'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                        } transition-colors duration-200`}
                        onClick={() => setTool('circle')}
                        title={dict.drawing?.circle || 'Circle'}>
                        <CircleIcon className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-lg ${
                            tool === 'line'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                        } transition-colors duration-200`}
                        onClick={() => setTool('line')}
                        title={dict.drawing?.line || 'Line'}>
                        <Minus className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-lg ${
                            tool === 'triangle'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                        } transition-colors duration-200`}
                        onClick={() => setTool('triangle')}
                        title={dict.drawing?.triangle || 'Triangle'}>
                        <TriangleIcon className="h-5 w-5" />
                    </button>

                    <div className="my-2 border-t border-slate-200 dark:border-gray-700 w-10"></div>

                    {/* Layers Button in Desktop Toolbar */}
                    <button
                        className={`p-2 rounded-lg ${
                            showLayersPanel
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                        } transition-colors duration-200`}
                        onClick={() => setShowLayersPanel(!showLayersPanel)}
                        title={dict.drawing?.layers || 'Layers'}>
                        <Layers className="h-5 w-5" />
                    </button>

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
                        className={`p-2 rounded-lg text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                            historyStep === 0
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                        }`}
                        onClick={handleUndo}
                        disabled={historyStep === 0}
                        title={dict.drawing?.undo || 'Undo'}>
                        <Undo className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-lg text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                            historyStep === history.length - 1
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                        }`}
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
                <div className="flex-1 bg-slate-100 dark:bg-gray-900 overflow-auto relative">
                    <div className="absolute top-0 left-0 min-w-full min-h-full flex items-center justify-center p-4">
                        <div
                            ref={canvasWrapperRef}
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
                                className={`${
                                    tool === 'bucket'
                                        ? 'cursor-pointer'
                                        : 'cursor-crosshair'
                                }`}>
                                {/* Background Layer */}
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
                                {layers.map((layer, index) => {
                                    // Skip invisible layers
                                    if (!layer.visible) return null;

                                    const layerElements =
                                        elementsByLayer.get(layer.id) || [];

                                    return (
                                        <Layer
                                            key={layer.id}
                                            opacity={layer.opacity}
                                            ref={node => {
                                                if (node) {
                                                    layerRefs.current.set(
                                                        layer.id,
                                                        node,
                                                    );
                                                }
                                            }}>
                                            {layerElements.map(element => {
                                                if (element.type === 'line') {
                                                    return (
                                                        <Line
                                                            key={element.id}
                                                            points={
                                                                element.points
                                                            }
                                                            stroke={
                                                                element.stroke
                                                            }
                                                            strokeWidth={
                                                                element.strokeWidth
                                                            }
                                                            tension={
                                                                element.tension
                                                            }
                                                            lineCap={
                                                                element.lineCap
                                                            }
                                                            lineJoin={
                                                                element.lineJoin
                                                            }
                                                            globalCompositeOperation={
                                                                element.globalCompositeOperation
                                                            }
                                                        />
                                                    );
                                                } else if (
                                                    element.type === 'rect'
                                                ) {
                                                    const rectElement =
                                                        element as RectElement;
                                                    return rectElement.image ? (
                                                        <Rect
                                                            key={rectElement.id}
                                                            x={rectElement.x}
                                                            y={rectElement.y}
                                                            width={
                                                                rectElement.width
                                                            }
                                                            height={
                                                                rectElement.height
                                                            }
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
                                                            width={
                                                                rectElement.width
                                                            }
                                                            height={
                                                                rectElement.height
                                                            }
                                                            fill={
                                                                rectElement.fill
                                                            }
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
                                                            width={
                                                                rectElement.width
                                                            }
                                                            height={
                                                                rectElement.height
                                                            }
                                                            fill={
                                                                rectElement.fill
                                                            }
                                                            stroke={
                                                                rectElement.stroke
                                                            }
                                                            strokeWidth={
                                                                rectElement.strokeWidth
                                                            }
                                                        />
                                                    );
                                                } else if (
                                                    element.type === 'circle'
                                                ) {
                                                    const circleElement =
                                                        element as CircleElement;
                                                    return (
                                                        <Circle
                                                            key={
                                                                circleElement.id
                                                            }
                                                            x={circleElement.x}
                                                            y={circleElement.y}
                                                            radius={
                                                                circleElement.radius
                                                            }
                                                            fill={
                                                                circleElement.fill
                                                            }
                                                            stroke={
                                                                circleElement.stroke
                                                            }
                                                            strokeWidth={
                                                                circleElement.strokeWidth
                                                            }
                                                        />
                                                    );
                                                } else if (
                                                    element.type ===
                                                    'line-shape'
                                                ) {
                                                    const lineElement =
                                                        element as LineShapeElement;
                                                    return (
                                                        <Line
                                                            key={lineElement.id}
                                                            points={
                                                                lineElement.points
                                                            }
                                                            stroke={
                                                                lineElement.stroke
                                                            }
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
                                                            key={
                                                                triangleElement.id
                                                            }
                                                            x={
                                                                triangleElement.x
                                                            }
                                                            y={
                                                                triangleElement.y
                                                            }
                                                            sides={3}
                                                            radius={
                                                                triangleElement.radius
                                                            }
                                                            fill={
                                                                triangleElement.fill
                                                            }
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
                                    );
                                })}
                            </Stage>

                            {/* Resize handles - only visible when not drawing */}
                            {!isDrawing && (
                                <>
                                    {/* Left handle */}
                                    <div
                                        className="absolute top-0 left-0 w-4 h-full cursor-w-resize hover:bg-indigo-500/10"
                                        onMouseDown={e =>
                                            handleResizeStart('left', e)
                                        }
                                        onTouchStart={e =>
                                            handleResizeStart('left', e)
                                        }>
                                        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-1 h-12 bg-indigo-500 rounded opacity-70"></div>
                                    </div>

                                    {/* Right handle */}
                                    <div
                                        className="absolute top-0 right-0 w-4 h-full cursor-e-resize hover:bg-indigo-500/10"
                                        onMouseDown={e =>
                                            handleResizeStart('right', e)
                                        }
                                        onTouchStart={e =>
                                            handleResizeStart('right', e)
                                        }>
                                        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-1 h-12 bg-indigo-500 rounded opacity-70"></div>
                                    </div>

                                    {/* Top handle */}
                                    <div
                                        className="absolute top-0 left-0 w-full h-4 cursor-n-resize hover:bg-indigo-500/10"
                                        onMouseDown={e =>
                                            handleResizeStart('top', e)
                                        }
                                        onTouchStart={e =>
                                            handleResizeStart('top', e)
                                        }>
                                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-1 w-12 bg-indigo-500 rounded opacity-70"></div>
                                    </div>

                                    {/* Bottom handle */}
                                    <div
                                        className="absolute bottom-0 left-0 w-full h-4 cursor-s-resize hover:bg-indigo-500/10"
                                        onMouseDown={e =>
                                            handleResizeStart('bottom', e)
                                        }
                                        onTouchStart={e =>
                                            handleResizeStart('bottom', e)
                                        }>
                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-12 bg-indigo-500 rounded opacity-70"></div>
                                    </div>

                                    {/* Top-left corner handle */}
                                    <div
                                        className="absolute top-0 left-0 w-6 h-6 cursor-nw-resize hover:bg-indigo-500/10"
                                        onMouseDown={e =>
                                            handleResizeStart('top-left', e)
                                        }
                                        onTouchStart={e =>
                                            handleResizeStart('top-left', e)
                                        }>
                                        <div className="absolute top-0 left-0 w-4 h-4 bg-indigo-500 rounded-br opacity-70"></div>
                                    </div>

                                    {/* Top-right corner handle */}
                                    <div
                                        className="absolute top-0 right-0 w-6 h-6 cursor-ne-resize hover:bg-indigo-500/10"
                                        onMouseDown={e =>
                                            handleResizeStart('top-right', e)
                                        }
                                        onTouchStart={e =>
                                            handleResizeStart('top-right', e)
                                        }>
                                        <div className="absolute top-0 right-0 w-4 h-4 bg-indigo-500 rounded-bl opacity-70"></div>
                                    </div>

                                    {/* Bottom-left corner handle */}
                                    <div
                                        className="absolute bottom-0 left-0 w-6 h-6 cursor-sw-resize hover:bg-indigo-500/10"
                                        onMouseDown={e =>
                                            handleResizeStart('bottom-left', e)
                                        }
                                        onTouchStart={e =>
                                            handleResizeStart('bottom-left', e)
                                        }>
                                        <div className="absolute bottom-0 left-0 w-4 h-4 bg-indigo-500 rounded-tr opacity-70"></div>
                                    </div>

                                    {/* Bottom-right corner handle */}
                                    <div
                                        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize hover:bg-indigo-500/10"
                                        onMouseDown={e =>
                                            handleResizeStart('right-bottom', e)
                                        }
                                        onTouchStart={e =>
                                            handleResizeStart('right-bottom', e)
                                        }>
                                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-indigo-500 rounded-tl opacity-70"></div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Canvas dimensions indicator */}
                    <div className="absolute top-3 left-3 bg-white/80 dark:bg-gray-800/80 text-slate-600 dark:text-gray-300 text-xs py-1 px-2 rounded-md backdrop-blur-sm">
                        {Math.round(dimensions.width)} ×{' '}
                        {Math.round(dimensions.height)}
                    </div>

                    {/* Active layer indicator */}
                    <div className="absolute top-3 right-3 bg-white/80 dark:bg-gray-800/80 text-slate-600 dark:text-gray-300 text-xs py-1 px-2 rounded-md backdrop-blur-sm flex items-center">
                        <Layers className="h-3 w-3 mr-1.5 text-indigo-500" />
                        {layers.find(l => l.id === activeLayerId)?.name ||
                            'Layer'}
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
            <div className="md:hidden flex justify-center items-center h-12 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-x-auto">
                <div className="flex space-x-3 px-2">
                    <button
                        className={`p-2 rounded-full ${
                            tool === 'pencil'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-600 dark:text-gray-400'
                        }`}
                        onClick={() => setTool('pencil')}
                        title="Pencil">
                        <Pencil className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-full ${
                            tool === 'eraser'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-600 dark:text-gray-400'
                        }`}
                        onClick={() => setTool('eraser')}
                        title="Eraser">
                        <Eraser className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-full ${
                            tool === 'bucket'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-600 dark:text-gray-400'
                        }`}
                        onClick={() => setTool('bucket')}
                        title="Fill">
                        <Droplet className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-full ${
                            tool === 'rectangle'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-600 dark:text-gray-400'
                        }`}
                        onClick={() => setTool('rectangle')}
                        title="Rectangle">
                        <Square className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-full ${
                            tool === 'circle'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-600 dark:text-gray-400'
                        }`}
                        onClick={() => setTool('circle')}
                        title="Circle">
                        <CircleIcon className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-full ${
                            showLayersPanel
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-600 dark:text-gray-400'
                        }`}
                        onClick={() => setShowLayersPanel(!showLayersPanel)}
                        title="Layers">
                        <Layers className="h-5 w-5" />
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
                        className={`p-2 rounded-full text-slate-600 dark:text-gray-400 ${
                            historyStep === 0 ? 'opacity-50' : ''
                        }`}
                        onClick={handleUndo}
                        disabled={historyStep === 0}
                        title="Undo">
                        <Undo className="h-5 w-5" />
                    </button>

                    <button
                        className={`p-2 rounded-full text-slate-600 dark:text-gray-400 ${
                            historyStep === history.length - 1
                                ? 'opacity-50'
                                : ''
                        }`}
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
                            <Palette className="h-4 w-4 mr-2 text-indigo-500" />
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
                            <ResolutionSelector />

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
                                        className={`w-10 h-10 rounded-full ${
                                            color === c
                                                ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-indigo-400 dark:ring-offset-gray-800'
                                                : 'ring-1 ring-slate-200 dark:ring-gray-700'
                                        } flex items-center justify-center shadow-sm`}
                                        style={{ backgroundColor: c }}
                                        onClick={() => setColor(c)}
                                        title={c}>
                                        {color === c && (
                                            <CheckCircle
                                                className={`h-4 w-4 ${
                                                    c === '#FFFFFF' ||
                                                    c === '#FFFF00'
                                                        ? 'text-black'
                                                        : 'text-white'
                                                }`}
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

            {/* Layers Panel */}
            {showLayersPanel && <LayerPanel />}
        </div>
    );
}
