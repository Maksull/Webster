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
    ArrowDown,
    Layers,
    CheckCircle,
} from 'lucide-react';
import { DrawingLayer } from '@/types/layers';
import { useLayers } from './useLayers';
import { useDrawing } from '@/contexts';
import AlertModal from '@/components/AlertModal';

interface LayerItemProps {
    layer: DrawingLayer;
    index: number;
}

const LayerItem: React.FC<LayerItemProps> = ({ layer, index }) => {
    const { activeLayerId, setActiveLayerId, layers } = useDrawing();
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

    const [editingName, setEditingName] = useState('');
    const [isEditing, setIsEditing] = useState(false);

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

    const isActive = activeLayerId === layer.id;

    return (
        <>
            <AlertModal
                open={modal.open}
                type={modal.type}
                message={modal.message}
                onClose={() => setModal({ ...modal, open: false })}
            />
            <div
                className={`p-2 rounded-md ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800' : 'hover:bg-slate-50 dark:hover:bg-gray-700'}`}
                onClick={() => setActiveLayerId(layer.id)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            className="mr-2 text-slate-600 dark:text-gray-400"
                            onClick={e => {
                                e.stopPropagation();
                                toggleLayerVisibility(layer.id);
                            }}
                            title={layer.visible ? 'Hide Layer' : 'Show Layer'}>
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
                                layer.locked ? 'Unlock Layer' : 'Lock Layer'
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
                                Opacity:
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
                                    if (index > 0) {
                                        moveLayerUp(layer.id);
                                    }
                                }}
                                disabled={index === 0}>
                                <ArrowUp className="h-3 w-3 inline mr-1" />
                                Move Up
                            </button>

                            <button
                                className="px-1.5 py-1 text-xs rounded bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600"
                                onClick={e => {
                                    e.stopPropagation();
                                    if (index < layers.length - 1) {
                                        moveLayerDown(layer.id);
                                    }
                                }}
                                disabled={index === layers.length - 1}>
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
                                    deleteLayerWithNotify(layer.id);
                                }}
                                disabled={layers.length <= 1}>
                                <Trash className="h-3 w-3 inline mr-1" />
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default LayerItem;
