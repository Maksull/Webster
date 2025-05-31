'use client';

import React, { useState } from 'react';
import LayerItem from './LayerItem';
import { Layers, Plus, X, ArrowUp, ArrowDown } from 'lucide-react';
import { Dictionary } from '@/get-dictionary';
import { useLayers } from './useLayers';
import { useDrawing } from '@/contexts';

interface LayerPanelProps {
    dict: Dictionary;
}

const LayerPanel: React.FC<LayerPanelProps> = ({ dict }) => {
    const { layers, setShowLayersPanel } = useDrawing();
    const { addLayer } = useLayers();

    // State to track layer display order - default to showing top layers first
    const [displayTopFirst, setDisplayTopFirst] = useState(true);

    // Prepare layers for display based on the selected order
    // When displayTopFirst = true: show top layers first (reverse array order)
    // When displayTopFirst = false: show bottom layers first (normal array order)
    const displayLayers = displayTopFirst ? [...layers].reverse() : layers;

    // Calculate the correct original index for each displayed layer
    const getOriginalIndex = (displayIndex: number): number => {
        return displayTopFirst
            ? layers.length - 1 - displayIndex
            : displayIndex;
    };

    return (
        <div className="fixed right-4 bottom-16 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-slate-200 dark:border-gray-700 z-20 max-h-96 overflow-auto">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-slate-900 dark:text-white flex items-center">
                    <Layers className="h-4 w-4 mr-2 text-indigo-500" />
                    {dict.drawing?.layers || 'Layers'}
                </h3>

                <div className="flex items-center space-x-1">
                    {/* Layer order toggle button */}
                    <button
                        className={`p-1.5 rounded-md text-slate-700 dark:text-gray-300 transition-colors ${
                            displayTopFirst
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'hover:bg-slate-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setDisplayTopFirst(!displayTopFirst)}
                        title={
                            displayTopFirst
                                ? 'Show bottom layer first'
                                : 'Show top layer first'
                        }>
                        {displayTopFirst ? (
                            <ArrowDown className="h-4 w-4" />
                        ) : (
                            <ArrowUp className="h-4 w-4" />
                        )}
                    </button>

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

            {/* Display order indicator */}
            <div className="mb-2 text-xs text-slate-500 dark:text-gray-400 flex items-center">
                {displayTopFirst ? (
                    <>
                        <ArrowDown className="h-3 w-3 mr-1" />
                        Top layer first
                    </>
                ) : (
                    <>
                        <ArrowUp className="h-3 w-3 mr-1" />
                        Bottom layer first
                    </>
                )}
            </div>

            <div className="space-y-1.5">
                {displayLayers.map((layer, displayIndex) => (
                    <LayerItem
                        key={layer.id}
                        layer={layer}
                        index={getOriginalIndex(displayIndex)}
                    />
                ))}
            </div>
        </div>
    );
};

export default LayerPanel;
