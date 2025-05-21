'use client';

import React from 'react';
import ToolButton from './ToolButton';
import {
    Pencil,
    Eraser,
    Droplet,
    Square,
    Circle as CircleIcon,
    Minus,
    Triangle as TriangleIcon,
    Layers,
    Palette,
    Undo,
    Redo,
    Trash2,
    ZoomIn,
    ZoomOut,
    Maximize,
    MousePointer,
    Type,
} from 'lucide-react';
import { Dictionary } from '@/get-dictionary';
import { useHistory } from './useHistory';
import { useDrawing } from '@/contexts';

interface DesktopToolbarProps {
    dict: Dictionary;
    onClear: () => void;
}

const DesktopToolbar: React.FC<DesktopToolbarProps> = ({ dict, onClear }) => {
    const {
        color,
        showLayersPanel,
        setShowLayersPanel,
        showSettings,
        setShowSettings,
        scale,
        setScale,
    } = useDrawing();

    const { handleUndo, handleRedo, canUndo, canRedo } = useHistory();

    // Handle zoom
    const handleZoomIn = () => {
        setScale(prevScale => Math.min(prevScale + 0.1, 3)); // Max zoom 3x
    };

    const handleZoomOut = () => {
        setScale(prevScale => Math.max(prevScale - 0.1, 0.5)); // Min zoom 0.5x
    };

    const handleResetZoom = () => {
        setScale(1);
    };

    return (
        <div className="hidden md:flex w-16 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 flex-col items-center py-4 gap-2">
            {/* Drawing tools */}
            <ToolButton
                tool="select"
                icon={MousePointer}
                title={dict.drawing?.select || 'Select'}
            />
            <ToolButton
                tool="pencil"
                icon={Pencil}
                title={dict.drawing?.pencil || 'Pencil'}
            />
            <ToolButton
                tool="eraser"
                icon={Eraser}
                title={dict.drawing?.eraser || 'Eraser'}
            />
            <ToolButton
                tool="bucket"
                icon={Droplet}
                title={dict.drawing?.bucket || 'Fill'}
            />

            <div className="my-2 border-t border-slate-200 dark:border-gray-700 w-10"></div>

            {/* Shape tools */}
            <ToolButton
                tool="rectangle"
                icon={Square}
                title={dict.drawing?.rectangle || 'Rectangle'}
            />
            <ToolButton
                tool="circle"
                icon={CircleIcon}
                title={dict.drawing?.circle || 'Circle'}
            />
            <ToolButton
                tool="line"
                icon={Minus}
                title={dict.drawing?.line || 'Line'}
            />
            <ToolButton
                tool="triangle"
                icon={TriangleIcon}
                title={dict.drawing?.triangle || 'Triangle'}
            />
            <ToolButton
                tool="text"
                icon={Type}
                title={dict.drawing?.text || 'Text'}
            />

            <div className="my-2 border-t border-slate-200 dark:border-gray-700 w-10"></div>

            {/* Layers and settings buttons */}
            <button
                className={`p-2 rounded-lg ${
                    showLayersPanel
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                } transition-colors duration-200`}
                onClick={() => setShowLayersPanel(!showLayersPanel)}
                title={dict.drawing?.layers || 'Layers'}>
                <Layers className="h-5 w-5" />
            </button>

            <button
                className="p-2 rounded-lg text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors duration-200 relative"
                onClick={() => setShowSettings(!showSettings)}
                title={dict.drawing?.settings || 'Settings'}>
                <Palette className="h-5 w-5" />
                <div
                    className="absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white dark:ring-gray-800"
                    style={{ backgroundColor: color }}></div>
            </button>

            <div className="my-2 border-t border-slate-200 dark:border-gray-700 w-10"></div>

            {/* History controls */}
            <button
                className={`p-2 rounded-lg text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                    !canUndo ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handleUndo}
                disabled={!canUndo}
                title={dict.drawing?.undo || 'Undo'}>
                <Undo className="h-5 w-5" />
            </button>

            <button
                className={`p-2 rounded-lg text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                    !canRedo ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handleRedo}
                disabled={!canRedo}
                title={dict.drawing?.redo || 'Redo'}>
                <Redo className="h-5 w-5" />
            </button>

            <div className="my-2 border-t border-slate-200 dark:border-gray-700 w-10"></div>

            {/* Clear button */}
            <button
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                onClick={onClear}
                title={dict.drawing?.clear || 'Clear'}>
                <Trash2 className="h-5 w-5" />
            </button>

            <div className="my-2 border-t border-slate-200 dark:border-gray-700 w-10"></div>

            {/* Zoom controls */}
            <button
                className="p-2 rounded-lg text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors duration-200"
                onClick={handleZoomIn}
                title="Zoom In">
                <ZoomIn className="h-5 w-5" />
            </button>

            <div className="flex items-center justify-center text-xs font-medium text-slate-600 dark:text-gray-400">
                {Math.round(scale * 100)}%
            </div>

            <button
                className="p-2 rounded-lg text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors duration-200"
                onClick={handleZoomOut}
                title="Zoom Out">
                <ZoomOut className="h-5 w-5" />
            </button>

            <button
                className="p-2 rounded-lg text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors duration-200"
                onClick={handleResetZoom}
                title="Reset Zoom">
                <Maximize className="h-5 w-5" />
            </button>
        </div>
    );
};

export default DesktopToolbar;
