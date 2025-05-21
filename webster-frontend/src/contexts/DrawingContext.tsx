'use client';

import React, {
    createContext,
    useContext,
    useState,
    useRef,
    useEffect,
} from 'react';

import { DrawingLayer, HistoryRecord } from '../types/layers';
import {
    Resolution,
    ToolType,
    DrawingElement,
    POPULAR_RESOLUTIONS,
} from '@/types/elements';
import { Canvas } from '@/types/canvas';

interface DrawingContextProps {
    dimensions: { width: number; height: number };
    setDimensions: React.Dispatch<
        React.SetStateAction<{ width: number; height: number }>
    >;
    backgroundColor: string;
    setBackgroundColor: React.Dispatch<React.SetStateAction<string>>;
    selectedResolution: Resolution;
    setSelectedResolution: React.Dispatch<React.SetStateAction<Resolution>>;
    scale: number;
    setScale: React.Dispatch<React.SetStateAction<number>>;
    tool: ToolType;
    setTool: React.Dispatch<React.SetStateAction<ToolType>>;
    color: string;
    setColor: React.Dispatch<React.SetStateAction<string>>;
    strokeWidth: number;
    setStrokeWidth: React.Dispatch<React.SetStateAction<number>>;
    shapeFill: boolean;
    setShapeFill: React.Dispatch<React.SetStateAction<boolean>>;
    isDrawing: boolean;
    setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>;
    startPoint: { x: number; y: number } | null;
    setStartPoint: React.Dispatch<
        React.SetStateAction<{ x: number; y: number } | null>
    >;
    layers: DrawingLayer[];
    setLayers: React.Dispatch<React.SetStateAction<DrawingLayer[]>>;
    elementsByLayer: Map<string, DrawingElement[]>;
    setElementsByLayer: React.Dispatch<
        React.SetStateAction<Map<string, DrawingElement[]>>
    >;
    activeLayerId: string;
    setActiveLayerId: React.Dispatch<React.SetStateAction<string>>;
    showLayersPanel: boolean;
    setShowLayersPanel: React.Dispatch<React.SetStateAction<boolean>>;
    history: HistoryRecord[];
    setHistory: React.Dispatch<React.SetStateAction<HistoryRecord[]>>;
    historyStep: number;
    setHistoryStep: React.Dispatch<React.SetStateAction<number>>;
    showSettings: boolean;
    setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    stageRef: React.RefObject<any>;
    layerRefs: React.MutableRefObject<Map<string, any>>;
    canvasWrapperRef: React.RefObject<HTMLDivElement | null>;
    isResizing: boolean;
    setIsResizing: React.Dispatch<React.SetStateAction<boolean>>;
    resizeDirection: string;
    setResizeDirection: React.Dispatch<React.SetStateAction<string>>;
    resizeStartPos: { x: number; y: number };
    setResizeStartPos: React.Dispatch<
        React.SetStateAction<{ x: number; y: number }>
    >;
    originalDimensions: { width: number; height: number };
    setOriginalDimensions: React.Dispatch<
        React.SetStateAction<{ width: number; height: number }>
    >;
    resizeInitialRect: { x: number; y: number; width: number; height: number };
    setResizeInitialRect: React.Dispatch<
        React.SetStateAction<{
            x: number;
            y: number;
            width: number;
            height: number;
        }>
    >;
    getActiveLayerElements: () => DrawingElement[];
    updateActiveLayerElements: (newElements: DrawingElement[]) => void;
    canvasId?: string;
    canvasName?: string;
    setCanvasName: React.Dispatch<React.SetStateAction<string>>;
    selectedElementIds: string[]; // Support multi-selection
    setSelectedElementIds: React.Dispatch<React.SetStateAction<string[]>>;
    isMoving: boolean;
    setIsMoving: React.Dispatch<React.SetStateAction<boolean>>;

    textEditingId: string | null;
    setTextEditingId: React.Dispatch<React.SetStateAction<string | null>>;
    textValue: string;
    setTextValue: React.Dispatch<React.SetStateAction<string>>;

    textFontSize: number;
    setTextFontSize: React.Dispatch<React.SetStateAction<number>>;
    textFontFamily: string;
    setTextFontFamily: React.Dispatch<React.SetStateAction<string>>;
}

export const DrawingContext = createContext<DrawingContextProps | undefined>(
    undefined,
);

interface DrawingProviderProps {
    children: React.ReactNode;
    initialCanvas?: Canvas | null;
}

export const DrawingProvider: React.FC<DrawingProviderProps> = ({
    children,
    initialCanvas,
}) => {
    const DEFAULT_RESOLUTION = POPULAR_RESOLUTIONS[0];
    const [dimensions, setDimensions] = useState({
        width: initialCanvas?.width || DEFAULT_RESOLUTION.width,
        height: initialCanvas?.height || DEFAULT_RESOLUTION.height,
    });
    const [backgroundColor, setBackgroundColor] = useState(
        initialCanvas?.backgroundColor || '#FFFFFF',
    );
    const [selectedResolution, setSelectedResolution] = useState<Resolution>(
        initialCanvas
            ? {
                  name: `Custom (${initialCanvas.width}×${initialCanvas.height})`,
                  width: initialCanvas.width,
                  height: initialCanvas.height,
              }
            : DEFAULT_RESOLUTION,
    );
    const [scale, setScale] = useState(1);
    const [tool, setTool] = useState<ToolType>('pencil');
    const [color, setColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(5);
    const [shapeFill, setShapeFill] = useState(true);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState<{
        x: number;
        y: number;
    } | null>(null);
    const [layers, setLayers] = useState<DrawingLayer[]>(() => {
        if (initialCanvas?.layers && initialCanvas.layers.length > 0) {
            return initialCanvas.layers;
        }
        return [];
    });
    const [elementsByLayer, setElementsByLayer] = useState<
        Map<string, DrawingElement[]>
    >(() => {
        if (initialCanvas?.elementsByLayer) {
            const elementsMap = new Map<string, DrawingElement[]>();
            Object.entries(initialCanvas.elementsByLayer).forEach(
                ([layerId, elements]) => {
                    elementsMap.set(layerId, elements);
                },
            );
            return elementsMap;
        }
        return new Map();
    });
    const [activeLayerId, setActiveLayerId] = useState<string>(() => {
        if (initialCanvas?.layers && initialCanvas.layers.length > 0) {
            return initialCanvas.layers[0].id;
        }
        return '';
    });
    const [showLayersPanel, setShowLayersPanel] = useState<boolean>(false);
    const [history, setHistory] = useState<HistoryRecord[]>(() => {
        if (initialCanvas?.layers) {
            return [
                {
                    layers: initialCanvas.layers,
                    elementsByLayer: new Map(elementsByLayer),
                    backgroundColor:
                        initialCanvas?.backgroundColor || '#FFFFFF',
                },
            ];
        }
        return [];
    });
    const [historyStep, setHistoryStep] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const stageRef = useRef<any>(null);
    const layerRefs = useRef<Map<string, any>>(new Map());
    const canvasWrapperRef = useRef<HTMLDivElement>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeDirection, setResizeDirection] = useState('');
    const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
    const [originalDimensions, setOriginalDimensions] = useState({
        width: 0,
        height: 0,
    });
    const [resizeInitialRect, setResizeInitialRect] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
    const [isMoving, setIsMoving] = useState(false);
    const [canvasName, setCanvasName] = useState<string>(
        initialCanvas?.name || '',
    );

    const [opacity, setOpacity] = useState(1);
    const [textEditingId, setTextEditingId] = useState<string | null>(null);
    const [textValue, setTextValue] = useState('');
    const [textFontSize, setTextFontSize] = useState(20);
    const [textFontFamily, setTextFontFamily] = useState('Arial');

    useEffect(() => {
        if (!initialCanvas && layers.length === 0) {
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
            setHistory([
                {
                    layers: [defaultLayer],
                    elementsByLayer: new Map([[defaultLayerId, []]]),
                    backgroundColor,
                },
            ]);
        }
    }, []);

    const getActiveLayerElements = (): DrawingElement[] => {
        return elementsByLayer.get(activeLayerId) || [];
    };

    const updateActiveLayerElements = (newElements: DrawingElement[]) => {
        const updatedMap = new Map(elementsByLayer);
        updatedMap.set(activeLayerId, newElements);
        setElementsByLayer(updatedMap);
    };

    const contextValue: DrawingContextProps = {
        dimensions,
        setDimensions,
        backgroundColor,
        setBackgroundColor,
        selectedResolution,
        setSelectedResolution,
        scale,
        setScale,
        tool,
        setTool,
        color,
        setColor,
        strokeWidth,
        setStrokeWidth,
        shapeFill,
        setShapeFill,
        isDrawing,
        setIsDrawing,
        startPoint,
        setStartPoint,
        layers,
        setLayers,
        elementsByLayer,
        setElementsByLayer,
        activeLayerId,
        setActiveLayerId,
        showLayersPanel,
        setShowLayersPanel,
        history,
        setHistory,
        historyStep,
        setHistoryStep,
        showSettings,
        setShowSettings,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        stageRef,
        layerRefs,
        canvasWrapperRef,
        isResizing,
        setIsResizing,
        resizeDirection,
        setResizeDirection,
        resizeStartPos,
        setResizeStartPos,
        originalDimensions,
        setOriginalDimensions,
        resizeInitialRect,
        setResizeInitialRect,
        getActiveLayerElements,
        updateActiveLayerElements,
        canvasId: initialCanvas?.id,
        canvasName,
        setCanvasName,
        selectedElementIds,
        setSelectedElementIds,
        isMoving,
        setIsMoving,
        textEditingId,
        setTextEditingId,
        textValue,
        setTextValue,
        textFontSize,
        setTextFontSize,
        textFontFamily,
        setTextFontFamily,
        opacity,
        setOpacity,
    };

    return (
        <DrawingContext.Provider value={contextValue}>
            {children}
        </DrawingContext.Provider>
    );
};

export const useDrawing = () => {
    const context = useContext(DrawingContext);
    if (context === undefined) {
        throw new Error('useDrawing must be used within a DrawingProvider');
    }
    return context;
};
