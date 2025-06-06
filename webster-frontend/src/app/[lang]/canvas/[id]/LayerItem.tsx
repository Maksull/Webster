'use client';

import React, { useState } from 'react';
import {
    Eye,
    EyeOff,
    Lock,
    Unlock,
    Edit,
    Copy,
    Trash,
    ArrowUp,
    Layers,
    CheckCircle,
    ChevronUp,
    ChevronDown,
    Square,
    Circle,
    Type,
    Image as ImageIcon,
    Minus,
    Triangle,
    ChevronRight,
    List,
    X,
    Spline,
} from 'lucide-react';
import { DrawingLayer } from '@/types/layers';
import { useLayers } from './useLayers';
import { useDictionary, useDrawing } from '@/contexts';
import { useHistory } from './useHistory';
import AlertModal from '@/components/AlertModal';
import { DrawingElement } from '@/types/elements';

interface LayerItemProps {
    layer: DrawingLayer;
    index: number;
}

const LayerItem: React.FC<LayerItemProps> = ({ layer, index }) => {
    const {
        activeLayerId,
        setActiveLayerId,
        layers,
        elementsByLayer,
        setElementsByLayer,
        hoveredElementId,
        setHoveredElementId,
    } = useDrawing();
    const {
        toggleLayerVisibility,
        toggleLayerLock,
        renameLayer,
        moveLayerUp,
        moveLayerDown,
        duplicateLayer,
        updateLayerOpacity,
        mergeLayerDown,
        deleteLayer,
    } = useLayers();
    const { recordHistory } = useHistory();
    const [editingName, setEditingName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showElementsList, setShowElementsList] = useState(false);

    const startEditing = () => {
        setEditingName(layer.name);
        setIsEditing(true);
    };

    const saveLayerName = () => {
        if (editingName.trim()) {
            renameLayer(layer.id, editingName.trim());
            setIsEditing(false);
        }
    };

    const [modal, setModal] = useState({
        open: false,
        type: 'success' as 'success' | 'error',
        message: '',
    });

    const deleteLayerWithNotify = (layerId: string) => {
        const result = deleteLayer(layerId);
        setModal({
            open: true,
            type: result.success ? 'success' : 'error',
            message: result.message,
        });
    };

    const removeElement = React.useCallback(
        (elementId: string) => {
            const updatedElementsByLayer = new Map(elementsByLayer);
            const layerElements = updatedElementsByLayer.get(layer.id) || [];
            const updatedElements = layerElements.filter(
                el => el.id !== elementId,
            );
            updatedElementsByLayer.set(layer.id, updatedElements);
            setElementsByLayer(updatedElementsByLayer);
            recordHistory();
            if (hoveredElementId === elementId) {
                setHoveredElementId(null);
            }
        },
        [
            elementsByLayer,
            layer.id,
            setElementsByLayer,
            recordHistory,
            hoveredElementId,
            setHoveredElementId,
        ],
    );

    const handleElementHover = React.useCallback(
        (elementId: string | null) => {
            setHoveredElementId(elementId);
        },
        [setHoveredElementId],
    );

    const isActive = activeLayerId === layer.id;
    const isTopLayer = index === layers.length - 1;
    const isBottomLayer = index === 0;
    const layerPosition = index + 1;
    const layerElements = elementsByLayer.get(layer.id) || [];
    const elementCount = layerElements.length;

    const getElementTypeIcon = (type: string) => {
        const iconMap: Record<string, React.ReactNode> = {
            rectangle: <Square className="h-3 w-3" />,
            rect: <Square className="h-3 w-3" />,
            circle: <Circle className="h-3 w-3" />,
            triangle: <Triangle className="h-3 w-3" />,
            text: <Type className="h-3 w-3" />,
            image: <ImageIcon className="h-3 w-3" />,
            line: <Minus className="h-3 w-3" />,
            'line-shape': <Minus className="h-3 w-3" />,
            arrow: <ArrowUp className="h-3 w-3" />,
            curve: <Spline className="h-3 w-3" />,
        };
        return iconMap[type] || <Square className="h-3 w-3" />;
    };

    const getElementDisplayInfo = (element: DrawingElement) => {
        const baseInfo = {
            id: element.id,
            type: element.type,
            icon: getElementTypeIcon(element.type),
        };

        switch (element.type) {
            case 'text':
                return {
                    ...baseInfo,
                    name: `Text: "${element.text?.slice(0, 20)}${
                        element.text && element.text.length > 20 ? '...' : ''
                    }"`,
                };
            case 'rectangle':
                return {
                    ...baseInfo,
                    name: 'Rectangle',
                };
            case 'rect':
                return {
                    ...baseInfo,
                    name: 'Rectangle',
                };
            case 'circle':
                return {
                    ...baseInfo,
                    name: 'Circle',
                };
            case 'triangle':
                return {
                    ...baseInfo,
                    name: 'Triangle',
                };
            case 'image':
                return {
                    ...baseInfo,
                    name: 'Image',
                };
            case 'line':
            case 'line-shape':
                return {
                    ...baseInfo,
                    name: 'Line',
                };
            case 'arrow':
                return {
                    ...baseInfo,
                    name: 'Arrow',
                };
            case 'curve':
                return {
                    ...baseInfo,
                    name: 'Curve',
                };
            default:
                return {
                    ...baseInfo,
                    name: (element as DrawingElement).type || 'Unknown',
                };
        }
    };

    const { dict } = useDictionary();

    return (
        <>
            <AlertModal
                open={modal.open}
                type={modal.type}
                message={modal.message}
                onClose={() => setModal({ ...modal, open: false })}
            />
            <div
                className={`p-2 rounded-md ${
                    isActive
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800'
                        : 'hover:bg-slate-50 dark:hover:bg-gray-700'
                }`}
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
                                    ? dict.drawing.hideLayer || 'Hide layer'
                                    : dict.drawing.showLayer || 'Show layer'
                            }>
                            {layer.visible ? (
                                <Eye className="h-4 w-4" />
                            ) : (
                                <EyeOff className="h-4 w-4 opacity-60" />
                            )}
                        </button>

                        {isEditing ? (
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    value={editingName}
                                    onChange={e =>
                                        setEditingName(e.target.value)
                                    }
                                    className="px-1 py-0.5 text-sm rounded border border-indigo-200 dark:border-indigo-700 dark:bg-gray-700 w-full"
                                    onClick={e => e.stopPropagation()}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') saveLayerName();
                                        if (e.key === 'Escape')
                                            setIsEditing(false);
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
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center">
                                    <span
                                        className={`inline-flex items-center justify-center w-5 h-5 mr-2 text-xs font-medium rounded-full ${
                                            isActive
                                                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                                                : 'bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-400'
                                        }`}>
                                        {layerPosition}
                                    </span>

                                    <div className="flex flex-col">
                                        <span
                                            className={`text-sm font-medium ${
                                                !layer.visible
                                                    ? 'text-slate-400 dark:text-gray-500'
                                                    : 'text-slate-700 dark:text-gray-200'
                                            }`}>
                                            {layer.name}
                                        </span>
                                        {(isTopLayer || isBottomLayer) && (
                                            <span
                                                className={`text-xs ${
                                                    isTopLayer
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-blue-600 dark:text-blue-400'
                                                }`}>
                                                {isTopLayer
                                                    ? dict.drawing.topLevel ||
                                                      'Top level'
                                                    : dict.drawing
                                                          .bottomLevel ||
                                                      'Bottom level'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
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
                                    ? dict.drawing.unlockLayer || 'Unlock Layer'
                                    : dict.drawing.lockLayer || 'Lock Layer'
                            }>
                            {layer.locked ? (
                                <Lock className="h-3.5 w-3.5" />
                            ) : (
                                <Unlock className="h-3.5 w-3.5 opacity-60" />
                            )}
                        </button>
                    </div>
                </div>

                {isActive && (
                    <div className="mt-2 pl-6 flex flex-col gap-2">
                        <div className="flex items-center text-xs">
                            <span className="w-16 text-slate-500 dark:text-gray-400">
                                {dict.drawing.opacity || 'Opacity:'}
                            </span>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={layer.opacity}
                                onChange={e => {
                                    updateLayerOpacity(
                                        layer.id,
                                        parseFloat(e.target.value),
                                    );
                                }}
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
                                    startEditing();
                                }}>
                                <Edit className="h-3 w-3 inline mr-1" />
                                {dict.drawing.rename || 'Rename'}
                            </button>

                            <button
                                className="px-1.5 py-1 text-xs rounded bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600"
                                onClick={e => {
                                    e.stopPropagation();
                                    duplicateLayer(layer.id);
                                }}>
                                <Copy className="h-3 w-3 inline mr-1" />
                                {dict.drawing.duplicate || 'Duplicate'}
                            </button>

                            <button
                                className={`px-1.5 py-1 text-xs rounded ${
                                    isTopLayer
                                        ? 'bg-slate-50 dark:bg-gray-800 text-slate-400 dark:text-gray-500 cursor-not-allowed'
                                        : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'
                                }`}
                                onClick={e => {
                                    e.stopPropagation();
                                    if (!isTopLayer) {
                                        moveLayerUp(layer.id);
                                    }
                                }}
                                disabled={isTopLayer}
                                title={
                                    isTopLayer
                                        ? dict.drawing.alreadyAtTop?.replace(
                                              '{{position}}',
                                              layerPosition.toString(),
                                          ) ||
                                          `Already at top (layer ${layerPosition})`
                                        : dict.drawing.moveToPositionDown?.replace(
                                              '{{position}}',
                                              (layerPosition + 1).toString(),
                                          ) ||
                                          `Move to position ${layerPosition + 1}`
                                }>
                                <ChevronUp className="h-3 w-3 inline mr-1" />
                                {dict.drawing.bringForward || 'Bring Forward'}
                            </button>

                            <button
                                className={`px-1.5 py-1 text-xs rounded ${
                                    isBottomLayer
                                        ? 'bg-slate-50 dark:bg-gray-800 text-slate-400 dark:text-gray-500 cursor-not-allowed'
                                        : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'
                                }`}
                                onClick={e => {
                                    e.stopPropagation();
                                    if (!isBottomLayer) {
                                        moveLayerDown(layer.id);
                                    }
                                }}
                                disabled={isBottomLayer}
                                title={
                                    isBottomLayer
                                        ? dict.drawing.alreadyAtBottom?.replace(
                                              '{{position}}',
                                              layerPosition.toString(),
                                          ) ||
                                          `Already at bottom (layer ${layerPosition})`
                                        : dict.drawing.moveToPositionUp?.replace(
                                              '{{position}}',
                                              (layerPosition - 1).toString(),
                                          ) ||
                                          `Move to position ${layerPosition - 1}`
                                }>
                                <ChevronDown className="h-3 w-3 inline mr-1" />
                                {dict.drawing.sendBackward || 'Send Backward'}
                            </button>

                            {!isBottomLayer && (
                                <button
                                    className="px-1.5 py-1 text-xs rounded bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600"
                                    onClick={e => {
                                        e.stopPropagation();
                                        mergeLayerDown(layer.id);
                                    }}
                                    title={
                                        dict.drawing.mergeWithBelow ||
                                        'Merge this layer with the layer below it'
                                    }>
                                    <Layers className="h-3 w-3 inline mr-1" />
                                    {dict.drawing.mergeDown || 'Merge down'}
                                </button>
                            )}

                            <button
                                className="px-1.5 py-1 text-xs rounded bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                                onClick={e => {
                                    e.stopPropagation();
                                    deleteLayerWithNotify(layer.id);
                                }}
                                disabled={layers.length <= 1}>
                                <Trash className="h-3 w-3 inline mr-1" />
                                {dict.drawing.delete || 'Delete'}
                            </button>
                        </div>
                    </div>
                )}

                {elementCount > 0 && (
                    <div className="mt-2 border-t border-slate-100 dark:border-gray-700 pt-2">
                        <button
                            className="w-full flex items-center justify-between px-2 py-1 text-xs rounded hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300"
                            onClick={e => {
                                e.stopPropagation();
                                setShowElementsList(!showElementsList);
                            }}>
                            <div className="flex items-center">
                                <List className="h-3 w-3 mr-1" />
                                <span>
                                    {dict.drawing.elements || 'Elements'} (
                                    {elementCount})
                                </span>
                            </div>
                            <ChevronRight
                                className={`h-3 w-3 transition-transform ${
                                    showElementsList ? 'rotate-90' : ''
                                }`}
                            />
                        </button>

                        {showElementsList && (
                            <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                                {layerElements.map(element => {
                                    const elementInfo =
                                        getElementDisplayInfo(element);
                                    const isHovered =
                                        hoveredElementId === element.id;

                                    return (
                                        <div
                                            key={element.id}
                                            className={`flex items-start justify-between px-2 py-1 text-xs rounded hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer group ${
                                                isHovered
                                                    ? 'bg-indigo-50 dark:bg-indigo-900/20'
                                                    : ''
                                            }`}
                                            onClick={e => e.stopPropagation()}
                                            onMouseEnter={() =>
                                                handleElementHover(element.id)
                                            }
                                            onMouseLeave={() =>
                                                handleElementHover(null)
                                            }>
                                            <div className="flex items-center flex-1 min-w-0">
                                                <div className="flex items-center mr-2 mt-0.5">
                                                    {elementInfo.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-slate-700 dark:text-gray-200 font-medium truncate">
                                                        {elementInfo.name}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Delete button for each element */}
                                            <button
                                                className="opacity-0 group-hover:opacity-100 ml-2 p-0.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-opacity"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    removeElement(element.id);
                                                }}
                                                title={
                                                    dict.drawing
                                                        .deleteElement ||
                                                    'Delete element'
                                                }>
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default LayerItem;
