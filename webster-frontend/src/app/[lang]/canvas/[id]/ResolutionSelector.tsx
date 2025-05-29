'use client';

import AlertModal from '@/components/AlertModal';
import { useDrawing } from '@/contexts';
import { Dictionary } from '@/get-dictionary';
import { POPULAR_RESOLUTIONS, Resolution } from '@/types/elements';
import React, { useEffect, useState } from 'react';

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

    useEffect(() => {
        const newWidth = dimensions.width.toString();
        const newHeight = dimensions.height.toString();

        const timeout = setTimeout(() => {
            if (customWidth !== newWidth) {
                setCustomWidth(newWidth);
            }
            if (customHeight !== newHeight) {
                setCustomHeight(newHeight);
            }
        }, 50); // delay in milliseconds, e.g. 300ms

        return () => clearTimeout(timeout); // cleanup on unmount or before next effect run
    }, [dimensions.width, dimensions.height]);


    const [modal, setModal] = useState({
        open: false,
        type: 'success' as 'success' | 'error',
        message: '',
    });

    const handleDimensionChange = (newWidth: string, newHeight: string) => {
        const width = parseInt(newWidth, 10);
        const height = parseInt(newHeight, 10);

        setCustomWidth(newWidth);
        setCustomHeight(newHeight);

        if (!isNaN(width) && !isNaN(height) && width >= 100 && height >= 100) {
            const customResolution: Resolution = {
                name: `Custom (${width}×${height})`,
                width,
                height,
            };
            onResolutionChange(customResolution);
        }
    };

    return (
        <div className="mb-4">
            <AlertModal
                open={modal.open}
                type={modal.type}
                message={modal.message}
                onClose={() => setModal({ ...modal, open: false })}
            />
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                {dict.drawing?.canvasSize || 'Canvas Size'}
            </label>
            <div className="grid grid-cols-1 gap-2">
                {POPULAR_RESOLUTIONS.map(resolution => (
                    <button
                        key={`${resolution.width}x${resolution.height}`}
                        className={`text-left px-3 py-2 rounded-lg text-sm ${selectedResolution.width === resolution.width &&
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
                        onChange={e =>
                            handleDimensionChange(e.target.value, customHeight)
                        }
                        className="w-20 px-2 py-1 text-sm border border-slate-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-slate-800 dark:text-gray-200"
                    />
                    <span className="text-slate-500 dark:text-gray-400">×</span>
                    <input
                        type="number"
                        min="100"
                        value={customHeight}
                        onChange={e =>
                            handleDimensionChange(customWidth, e.target.value)
                        }
                        className="w-20 px-2 py-1 text-sm border border-slate-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-slate-800 dark:text-gray-200"
                    />
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                    You can also resize by dragging the canvas edges
                </p>
            </div>
        </div>
    );
};

export default ResolutionSelector;
