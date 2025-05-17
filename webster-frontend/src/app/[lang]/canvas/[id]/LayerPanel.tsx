'use client';

import React from 'react';
import LayerItem from './LayerItem';
import { Layers, Plus, X } from 'lucide-react';
import { Dictionary } from '@/get-dictionary';
import { useLayers } from './useLayers';
import { useDrawing } from '@/contexts';

interface LayerPanelProps {
    dict: Dictionary;
}

const LayerPanel: React.FC<LayerPanelProps> = ({ dict }) => {
    const { layers, setShowLayersPanel } = useDrawing();

    const { addLayer } = useLayers();

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
                    <LayerItem key={layer.id} layer={layer} index={index} />
                ))}
            </div>
        </div>
    );
};

export default LayerPanel;
