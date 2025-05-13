'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Dictionary } from '@/get-dictionary';
import { useDrawing } from '@/contexts/DrawingContext';
import { commonColors } from './colorUtils';

interface ColorPickerProps {
    dict: Dictionary;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ dict }) => {
    const { color, setColor } = useDrawing();

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                {dict.drawing?.brushColor || 'Color'}
            </label>
            <div className="grid grid-cols-5 gap-2 mb-3">
                {commonColors.map(c => (
                    <button
                        key={c}
                        className={`w-10 h-10 rounded-full ${
                            color === c
                                ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-indigo-400 dark:ring-offset-gray-800'
                                : 'ring-1 ring-slate-200 dark:ring-gray-700'
                        } flex items-center justify-center shadow-sm`}
                        style={{ backgroundColor: c }}
                        onClick={() => setColor(c)}
                        title={c}>
                        {color === c && (
                            <CheckCircle
                                className={`h-4 w-4 ${
                                    c === '#FFFFFF' || c === '#FFFF00'
                                        ? 'text-black'
                                        : 'text-white'
                                }`}
                            />
                        )}
                    </button>
                ))}
            </div>
            <div className="flex items-center">
                <label
                    htmlFor="customColor"
                    className="text-sm font-medium text-slate-700 dark:text-gray-300 mr-3">
                    {dict.drawing?.custom || 'Custom'}:
                </label>
                <div className="relative">
                    <input
                        type="color"
                        id="customColor"
                        value={color}
                        onChange={e => setColor(e.target.value)}
                        className="w-10 h-10 p-0 border-0 rounded-full cursor-pointer"
                    />
                </div>
                <span className="ml-3 text-sm font-mono text-slate-600 dark:text-gray-400">
                    {color.toUpperCase()}
                </span>
            </div>
        </div>
    );
};

export default ColorPicker;
