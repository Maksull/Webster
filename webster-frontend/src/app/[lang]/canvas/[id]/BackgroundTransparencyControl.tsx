'use client';
import React from 'react';
import { useDrawing } from '@/contexts';
import { Dictionary } from '@/get-dictionary';

interface BackgroundTransparencyControlProps {
    dict?: Dictionary;
}

const BackgroundTransparencyControl: React.FC<
    BackgroundTransparencyControlProps
> = ({ dict }) => {
    const { backgroundColor, setBackgroundColor } = useDrawing();

    const toggleTransparency = () => {
        if (backgroundColor === 'transparent') {
            setBackgroundColor('#FFFFFF'); // Switch back to white
        } else {
            setBackgroundColor('transparent');
        }
    };

    return (
        <div className="flex items-center justify-between">
            <label className="text-sm text-slate-700 dark:text-gray-300">
                {dict?.transparentBackground || 'Transparent Background'}
            </label>
            <div
                className={`w-12 h-6 flex items-center ${
                    backgroundColor === 'transparent'
                        ? 'bg-indigo-400'
                        : 'bg-gray-300 dark:bg-gray-600'
                } rounded-full p-1 cursor-pointer transition-colors duration-300`}
                onClick={toggleTransparency}>
                <div
                    className={`bg-white dark:bg-gray-200 w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center text-xs ${
                        backgroundColor === 'transparent' ? 'translate-x-6' : ''
                    }`}></div>
            </div>
        </div>
    );
};

export default BackgroundTransparencyControl;
