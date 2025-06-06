'use client';

import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { useDrawing } from '@/contexts';

interface ZoomControlsProps {
    showOnMobile?: boolean;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ showOnMobile = true }) => {
    const { scale, setScale } = useDrawing();

    const handleZoomIn = () => {
        setScale(prevScale => Math.min(prevScale + 0.1, 3)); // Max zoom 3x
    };

    const handleZoomOut = () => {
        setScale(prevScale => Math.max(prevScale - 0.1, 0.5)); // Min zoom 0.5x
    };

    const handleResetZoom = () => {
        setScale(1);
    };

    const mobileClasses = showOnMobile ? 'block' : 'hidden md:block';

    return (
        <div
            className={`${mobileClasses} absolute bottom-16 right-4 bg-white dark:bg-gray-800 rounded-full shadow-lg p-1 flex space-x-1`}>
            <button
                className="cursor-pointer p-2 rounded-full bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400"
                onClick={handleZoomOut}>
                <ZoomOut className="h-5 w-5" />
            </button>
            <button
                className="cursor-pointer p-2 rounded-full bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400"
                onClick={handleResetZoom}>
                <span className="text-xs font-medium">
                    {Math.round(scale * 100)}%
                </span>
            </button>
            <button
                className="cursor-pointer p-2 rounded-full bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400"
                onClick={handleZoomIn}>
                <ZoomIn className="h-5 w-5" />
            </button>
        </div>
    );
};

export default ZoomControls;
