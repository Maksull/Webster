'use client';

import { useDictionary, useDrawing } from '@/contexts';
import React from 'react';

const ShapeFillControl: React.FC = () => {
    const { shapeFill, setShapeFill } = useDrawing();
    const { dict } = useDictionary();

    return (
        <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                {dict.drawing.shapeFillLabel || 'Shape Fill'}
            </label>
            <div className="flex items-center space-x-4">
                <button
                    className={`flex items-center px-3 py-2 rounded-lg ${
                        shapeFill
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => setShapeFill(true)}>
                    <div className="h-4 w-4 bg-current mr-2 rounded"></div>
                    {dict.drawing.filledButton || 'Filled'}
                </button>
                <button
                    className={`flex items-center px-3 py-2 rounded-lg ${
                        !shapeFill
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => setShapeFill(false)}>
                    <div className="h-4 w-4 border border-current mr-2 rounded"></div>
                    {dict.drawing.outlineButton || 'Outline'}
                </button>
            </div>
        </div>
    );
};

export default ShapeFillControl;
