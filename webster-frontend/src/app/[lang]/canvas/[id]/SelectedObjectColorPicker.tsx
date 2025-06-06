'use client';

import React from 'react';
import { CheckCircle, Palette } from 'lucide-react';
import { Dictionary } from '@/get-dictionary';
import { useSelectedObjectsColor } from './useSelectedObjectsColor';

interface SelectedObjectColorPickerProps {
    dict: Dictionary;
}

const COMMON_COLORS = [
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

const SelectedObjectColorPicker: React.FC<SelectedObjectColorPickerProps> = ({
    dict,
}) => {
    const {
        selectedStrokeColor,
        selectedFillColor,
        hasStrokeElements,
        hasFillElements,
        hasLockedLayer,
        updateStrokeColor,
        updateFillColor,
        selectedElementsCount,
    } = useSelectedObjectsColor();

    // Don't render if no elements are selected or no color properties available
    if (
        selectedElementsCount === 0 ||
        (!hasStrokeElements && !hasFillElements)
    ) {
        return null;
    }

    const isLocked = hasLockedLayer();

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-slate-600 dark:text-gray-400" />
                <h4 className="text-sm font-medium text-slate-700 dark:text-gray-300">
                    {dict.drawing?.selectedObjectColors ||
                        'Selected Object Colors'}
                </h4>
            </div>

            {isLocked && (
                <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                    {dict.drawing?.layerLocked ||
                        'Some elements are on locked layers'}
                </div>
            )}

            {/* Stroke Color */}
            {hasStrokeElements && (
                <div
                    className={
                        isLocked ? 'opacity-50 pointer-events-none' : ''
                    }>
                    <label className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-2">
                        {dict.drawing?.strokeColor || 'Stroke/Border Color'}
                    </label>
                    <div className="grid grid-cols-5 gap-1 mb-2">
                        {COMMON_COLORS.map(color => (
                            <button
                                key={`stroke-${color}`}
                                className={`w-8 h-8 rounded ${
                                    selectedStrokeColor === color
                                        ? 'ring-2 ring-offset-1 ring-indigo-500 dark:ring-indigo-400'
                                        : 'ring-1 ring-slate-200 dark:ring-gray-700'
                                } flex items-center justify-center shadow-sm`}
                                style={{ backgroundColor: color }}
                                onClick={() => updateStrokeColor(color)}
                                title={color}
                                disabled={isLocked}>
                                {selectedStrokeColor === color && (
                                    <CheckCircle
                                        className={`h-3 w-3 ${
                                            color === '#FFFFFF' ||
                                            color === '#FFFF00'
                                                ? 'text-black'
                                                : 'text-white'
                                        }`}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={selectedStrokeColor}
                            onChange={e => updateStrokeColor(e.target.value)}
                            className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                            disabled={isLocked}
                        />
                        <span className="text-xs font-mono text-slate-600 dark:text-gray-400">
                            {selectedStrokeColor.toUpperCase()}
                        </span>
                    </div>
                </div>
            )}

            {/* Fill Color */}
            {hasFillElements && (
                <div
                    className={
                        isLocked ? 'opacity-50 pointer-events-none' : ''
                    }>
                    <label className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-2">
                        {dict.drawing?.fillColor || 'Fill Color'}
                    </label>
                    <div className="grid grid-cols-5 gap-1 mb-2">
                        {COMMON_COLORS.map(color => (
                            <button
                                key={`fill-${color}`}
                                className={`w-8 h-8 rounded ${
                                    selectedFillColor === color
                                        ? 'ring-2 ring-offset-1 ring-indigo-500 dark:ring-indigo-400'
                                        : 'ring-1 ring-slate-200 dark:ring-gray-700'
                                } flex items-center justify-center shadow-sm`}
                                style={{ backgroundColor: color }}
                                onClick={() => updateFillColor(color)}
                                title={color}
                                disabled={isLocked}>
                                {selectedFillColor === color && (
                                    <CheckCircle
                                        className={`h-3 w-3 ${
                                            color === '#FFFFFF' ||
                                            color === '#FFFF00'
                                                ? 'text-black'
                                                : 'text-white'
                                        }`}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={selectedFillColor}
                            onChange={e => updateFillColor(e.target.value)}
                            className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                            disabled={isLocked}
                        />
                        <span className="text-xs font-mono text-slate-600 dark:text-gray-400">
                            {selectedFillColor.toUpperCase()}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SelectedObjectColorPicker;
