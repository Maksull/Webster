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

interface DrawingContextProps {
    // Canvas state
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

    // Drawing tools
    tool: ToolType;
    setTool: React.Dispatch<React.SetStateAction<ToolType>>;
    color: string;
    setColor: React.Dispatch<React.SetStateAction<string>>;
    strokeWidth: number;
    setStrokeWidth: React.Dispatch<React.SetStateAction<number>>;
    shapeFill: boolean;
    setShapeFill: React.Dispatch<React.SetStateAction<boolean>>;

    // Canvas interaction state
    isDrawing: boolean;
    setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>;
    startPoint: { x: number; y: number } | null;
    setStartPoint: React.Dispatch<
        React.SetStateAction<{ x: number; y: number } | null>
    >;

    // Layer management
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

    // History management
    history: HistoryRecord[];
    setHistory: React.Dispatch<React.SetStateAction<HistoryRecord[]>>;
    historyStep: number;
    setHistoryStep: React.Dispatch<React.SetStateAction<number>>;

    // UI state
    showSettings: boolean;
    setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;

    // Canvas refs
    stageRef: React.RefObject<any>;
    layerRefs: React.MutableRefObject<Map<string, any>>;
    canvasWrapperRef: React.RefObject<HTMLDivElement>;

    // Canvas resize state
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

    // Helper methods
    getActiveLayerElements: () => DrawingElement[];
    updateActiveLayerElements: (newElements: DrawingElement[]) => void;
}

export const DrawingContext = createContext<DrawingContextProps | undefined>(
    undefined,
);

export const DrawingProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const DEFAULT_RESOLUTION = POPULAR_RESOLUTIONS[0];

    // Canvas settings
    const [dimensions, setDimensions] = useState({
        width: DEFAULT_RESOLUTION.width,
        height: DEFAULT_RESOLUTION.height,
    });
    const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
    const [selectedResolution, setSelectedResolution] =
        useState<Resolution>(DEFAULT_RESOLUTION);
    const [scale, setScale] = useState(1);

    // Drawing tools
    const [tool, setTool] = useState<ToolType>('pencil');
    const [color, setColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(5);
    const [shapeFill, setShapeFill] = useState(true);

    // Canvas interaction state
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState<{
        x: number;
        y: number;
    } | null>(null);

    // Layer management
    const [layers, setLayers] = useState<DrawingLayer[]>([]);
    const [elementsByLayer, setElementsByLayer] = useState<
        Map<string, DrawingElement[]>
    >(new Map());
    const [activeLayerId, setActiveLayerId] = useState<string>('');
    const [showLayersPanel, setShowLayersPanel] = useState<boolean>(false);

    // History management
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [historyStep, setHistoryStep] = useState(0);

    // UI state
    const [showSettings, setShowSettings] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Canvas refs
    const stageRef = useRef<any>(null);
    const layerRefs = useRef<Map<string, any>>(new Map());
    const canvasWrapperRef = useRef<HTMLDivElement>(null);

    // Canvas resize state
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

    // Helper functions for active layer
    const getActiveLayerElements = (): DrawingElement[] => {
        return elementsByLayer.get(activeLayerId) || [];
    };

    const updateActiveLayerElements = (newElements: DrawingElement[]) => {
        const updatedMap = new Map(elementsByLayer);
        updatedMap.set(activeLayerId, newElements);
        setElementsByLayer(updatedMap);
    };

    // Resize handlers
    const handleResizeMove = (e: MouseEvent | TouchEvent) => {
        // Implementation remains in DrawingEditor.tsx
        // Keeping this as a placeholder
    };

    const handleResizeEnd = () => {
        // Implementation remains in DrawingEditor.tsx
        // Keeping this as a placeholder
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
