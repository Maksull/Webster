'use client';

import { useDrawing } from '@/contexts/DrawingContext';
import { Dictionary } from '@/get-dictionary';
import { POPULAR_RESOLUTIONS, Resolution } from '@/types/elements';
import React, { useState } from 'react';

interface ResolutionSelectorProps {
    dict: Dictionary;
    onResolutionChange: (resolution: Resolution) => void;
}

const ResolutionSelector: React.FC<ResolutionSelectorProps> = ({
    dict,
    onResolutionChange,
}) => {
    const { selectedResolution, dimensions } = useDrawing();

    const [customWidth, setCustomWidth] = useState(dimensions.width.toString());
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

        onResolutionChange(customResolution);
    };

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
                        onClick={() => onResolutionChange(resolution)}>
                        {resolution.name} ({resolution.width} ×{' '}
                        {resolution.height})
                    </button>
                ))}
            </div>

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
        </div>
    );
};

export default ResolutionSelector;
