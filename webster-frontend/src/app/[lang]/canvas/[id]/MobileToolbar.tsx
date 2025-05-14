'use client';

import React from 'react';
import ToolButton from './ToolButton';
import {
    Pencil,
    Eraser,
    Droplet,
    Square,
    Circle as CircleIcon,
    Layers,
    Palette,
    Undo,
    Redo,
    MousePointer,
} from 'lucide-react';
import { Dictionary } from '@/get-dictionary';
import { useDrawing } from '@/contexts/DrawingContext';
import { useHistory } from './useHistory';

interface MobileToolbarProps {
    dict: Dictionary;
}

const MobileToolbar: React.FC<MobileToolbarProps> = ({ dict }) => {
    const {
        color,
        showLayersPanel,
        setShowLayersPanel,
        showSettings,
        setShowSettings,
    } = useDrawing();

    const { handleUndo, handleRedo, canUndo, canRedo } = useHistory();

    return (
        <div className="md:hidden flex justify-center items-center h-12 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-x-auto">
            <div className="flex space-x-3 px-2">
                <ToolButton tool="select" icon={MousePointer} title="Select" />
                <ToolButton tool="pencil" icon={Pencil} title="Pencil" />
                <ToolButton tool="eraser" icon={Eraser} title="Eraser" />
                <ToolButton tool="bucket" icon={Droplet} title="Fill" />
                <ToolButton tool="rectangle" icon={Square} title="Rectangle" />
                <ToolButton tool="circle" icon={CircleIcon} title="Circle" />

                {/* Layers button */}
                <button
                    className={`p-2 rounded-full ${
                        showLayersPanel
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-600 dark:text-gray-400'
                    }`}
                    onClick={() => setShowLayersPanel(!showLayersPanel)}
                    title="Layers">
                    <Layers className="h-5 w-5" />
                </button>

                {/* Settings button */}
                <button
                    className="p-2 rounded-full text-slate-600 dark:text-gray-400 relative"
                    onClick={() => setShowSettings(!showSettings)}
                    title="Color & Size">
                    <Palette className="h-5 w-5" />
                    <div
                        className="absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-white dark:ring-gray-800"
                        style={{ backgroundColor: color }}></div>
                </button>

                {/* Undo button */}
                <button
                    className={`p-2 rounded-full text-slate-600 dark:text-gray-400 ${
                        !canUndo ? 'opacity-50' : ''
                    }`}
                    onClick={handleUndo}
                    disabled={!canUndo}
                    title="Undo">
                    <Undo className="h-5 w-5" />
                </button>

                {/* Redo button */}
                <button
                    className={`p-2 rounded-full text-slate-600 dark:text-gray-400 ${
                        !canRedo ? 'opacity-50' : ''
                    }`}
                    onClick={handleRedo}
                    disabled={!canRedo}
                    title="Redo">
                    <Redo className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default MobileToolbar;
