'use client';

import React, {
    createContext,
    useContext,
    useState,
    useRef,
    useEffect,
    useCallback,
} from 'react';
import { DrawingLayer, HistoryRecord } from '../types/layers';
import {
    Resolution,
    ToolType,
    DrawingElement,
    POPULAR_RESOLUTIONS,
    ImageElement,
} from '@/types/elements';
import { Canvas } from '@/types/canvas';
import { Stage } from 'konva/lib/Stage';
import { Layer } from 'konva/lib/Layer';
import { KonvaEventObject } from 'konva/lib/Node';

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
    stageRef: React.RefObject<Stage | null>;
    layerRefs: React.MutableRefObject<Map<string, Layer>>;
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
    canvasDescription: string | null;
    setCanvasDescription: React.Dispatch<React.SetStateAction<string | null>>;
    selectedElementIds: string[];
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
    maintainAspectRatio: boolean;
    setMaintainAspectRatio: React.Dispatch<React.SetStateAction<boolean>>;
    isImageResizing: boolean;
    setIsImageResizing: React.Dispatch<React.SetStateAction<boolean>>;
    handleImageResizeStart: (
        corner: string,
        e: KonvaEventObject<MouseEvent | TouchEvent>,
    ) => boolean | void;
    updateImageElement: (
        elementId: string,
        updates: Partial<ImageElement>,
    ) => void;
    getImageElement: (imageId: string) => ImageElement | null;
    fitImageToCanvas: (imageId: string) => void;
    fitImageToCanvasWithAspectRatio: (imageId: string) => void;
    toggleAspectRatio: () => void;
    opacity: number;
    hoveredElementId: string | null;
    setHoveredElementId: (id: string | null) => void;
    setOpacity: React.Dispatch<React.SetStateAction<number>>;
    isDrawingCurve: boolean;
    setIsDrawingCurve: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DrawingContext = createContext<DrawingContextProps | undefined>(
    undefined,
);

interface DrawingProviderProps {
    children: React.ReactNode;
    initialCanvas?: Canvas | null;
}

interface ResizeState {
    corner: string;
    startPos: { x: number; y: number };
    originalElement: ImageElement | null;
    stage: Stage | null;
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
    const [opacity, setOpacity] = useState(1);
    const [hoveredElementId, setHoveredElementId] = useState<string | null>(
        null,
    );

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

    const stageRef = useRef<Stage>(null);
    const layerRefs = useRef<Map<string, Layer>>(new Map());
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
    const [canvasDescription, setCanvasDescription] = useState<string | null>(
        initialCanvas?.description || null,
    );

    const [isDrawingCurve, setIsDrawingCurve] = useState(false);

    const [textEditingId, setTextEditingId] = useState<string | null>(null);
    const [textValue, setTextValue] = useState('');
    const [textFontSize, setTextFontSize] = useState(20);
    const [textFontFamily, setTextFontFamily] = useState('Arial');
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
    const [isImageResizing, setIsImageResizing] = useState(false);

    const resizeStateRef = useRef<ResizeState>({
        corner: '',
        startPos: { x: 0, y: 0 },
        originalElement: null,
        stage: null,
    });

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

    const handleMouseMove = useCallback(
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

    const handleMouseUp = useCallback(() => {
        console.log('Image resize ended');
        setIsImageResizing(false);
        resizeStateRef.current = {
            corner: '',
            startPos: { x: 0, y: 0 },
            originalElement: null,
            stage: null,
        };

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
    }, [handleMouseMove]);

    const handleImageResizeStart = useCallback(
        (corner: string, e: KonvaEventObject<MouseEvent | TouchEvent>) => {
            console.log('Image resize started for corner:', corner);

            // Check if any selected element's layer is locked
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
            document.addEventListener('mousemove', handleMouseMove, {
                passive: false,
            });
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleMouseMove, {
                passive: false,
            });
            document.addEventListener('touchend', handleMouseUp);

            return false;
        },
        [
            selectedElementIds,
            getImageElement,
            handleMouseMove,
            handleMouseUp,
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
        },
        [updateImageElement, dimensions],
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
        },
        [getImageElement, updateImageElement, dimensions],
    );

    const toggleAspectRatio = useCallback(() => {
        setMaintainAspectRatio(prev => !prev);
    }, []);

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
        setElementsByLayer(prev => {
            const updatedMap = new Map(prev);
            // Make sure we clone the array too
            updatedMap.set(activeLayerId, [...newElements]);
            return new Map(updatedMap); // new reference
        });
    };

    const contextValue: DrawingContextProps = {
        opacity,
        setOpacity,
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
        canvasDescription,
        setCanvasDescription,
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
        maintainAspectRatio,
        setMaintainAspectRatio,
        isImageResizing,
        setIsImageResizing,
        handleImageResizeStart,
        updateImageElement,
        getImageElement,
        fitImageToCanvas,
        fitImageToCanvasWithAspectRatio,
        toggleAspectRatio,
        hoveredElementId,
        setHoveredElementId,
        isDrawingCurve,
        setIsDrawingCurve,
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
