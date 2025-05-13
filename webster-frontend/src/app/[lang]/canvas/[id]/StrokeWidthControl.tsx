'use client';

import React from 'react';
import { Dictionary } from '@/get-dictionary';
import { useDrawing } from '@/contexts/DrawingContext';

interface StrokeWidthControlProps {
    dict: Dictionary;
}

const StrokeWidthControl: React.FC<StrokeWidthControlProps> = ({ dict }) => {
    const { strokeWidth, setStrokeWidth } = useDrawing();

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                {dict.drawing?.brushSize || 'Brush Size'}
            </label>
            <div className="flex items-center">
                <input
                    type="range"
                    min="1"
                    max="30"
                    value={strokeWidth}
                    onChange={e => setStrokeWidth(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="ml-3 text-sm text-slate-600 dark:text-gray-400 w-6 text-center">
                    {strokeWidth}
                </span>
            </div>
        </div>
    );
};

export default StrokeWidthControl;
