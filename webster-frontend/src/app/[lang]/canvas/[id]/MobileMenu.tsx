// app/[lang]/editor/components/toolbar/MobileMenu.tsx
'use client';

import React from 'react';
import {
    X,
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
    Save,
    Download,
    Type,
} from 'lucide-react';
import { Dictionary } from '@/get-dictionary';
import { useHistory } from './useHistory';
import { useDrawing } from '@/contexts';

interface MobileMenuProps {
    dict: Dictionary;
    onSave: () => void;
    onDownload: () => void;
    onClear: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
    dict,
    onSave,
    onDownload,
    onClear,
}) => {
    const {
        tool,
        setTool,
        showLayersPanel,
        setShowLayersPanel,
        setShowSettings,
        scale,
        setScale,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
    } = useDrawing();

    const { handleUndo, handleRedo, canUndo, canRedo } = useHistory();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="fixed inset-0 z-50 md:hidden">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={toggleMobileMenu}></div>
            <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                        Tools
                    </h3>
                    <button onClick={toggleMobileMenu}>
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
                <div className="flex flex-col gap-3">
                    <button
                        className={`flex items-center px-3 py-2 rounded-lg ${
                            tool === 'pencil'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                        onClick={() => {
                            setTool('pencil');
                            toggleMobileMenu();
                        }}>
                        <Pencil className="h-5 w-5 mr-2" />
                        Pencil
                    </button>
                    <button
                        className={`flex items-center px-3 py-2 rounded-lg ${
                            tool === 'eraser'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                        onClick={() => {
                            setTool('eraser');
                            toggleMobileMenu();
                        }}>
                        <Eraser className="h-5 w-5 mr-2" />
                        Eraser
                    </button>
                    <button
                        className={`flex items-center px-3 py-2 rounded-lg ${
                            tool === 'bucket'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                        onClick={() => {
                            setTool('bucket');
                            toggleMobileMenu();
                        }}>
                        <Droplet className="h-5 w-5 mr-2" />
                        Fill
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    <button
                        className={`flex items-center px-3 py-2 rounded-lg ${
                            tool === 'rectangle'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                        onClick={() => {
                            setTool('rectangle');
                            toggleMobileMenu();
                        }}>
                        <Square className="h-5 w-5 mr-2" />
                        Rectangle
                    </button>
                    <button
                        className={`flex items-center px-3 py-2 rounded-lg ${
                            tool === 'circle'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                        onClick={() => {
                            setTool('circle');
                            toggleMobileMenu();
                        }}>
                        <CircleIcon className="h-5 w-5 mr-2" />
                        Circle
                    </button>
                    <button
                        className={`flex items-center px-3 py-2 rounded-lg ${
                            tool === 'line'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                        onClick={() => {
                            setTool('line');
                            toggleMobileMenu();
                        }}>
                        <Minus className="h-5 w-5 mr-2" />
                        Line
                    </button>
                    <button
                        className={`flex items-center px-3 py-2 rounded-lg ${
                            tool === 'triangle'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                        onClick={() => {
                            setTool('triangle');
                            toggleMobileMenu();
                        }}>
                        <TriangleIcon className="h-5 w-5 mr-2" />
                        Triangle
                    </button>
                    <button
                        className={`flex items-center px-3 py-2 rounded-lg ${
                            tool === 'text'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                        onClick={() => {
                            setTool('text');
                            toggleMobileMenu();
                        }}>
                        <Type className="h-5 w-5 mr-2" />
                        Type
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                    {/* Layers Button in Mobile Menu */}
                    <button
                        className="flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400"
                        onClick={() => {
                            setShowLayersPanel(!showLayersPanel);
                            toggleMobileMenu();
                        }}>
                        <Layers className="h-5 w-5 mr-2" />
                        Layers
                    </button>

                    <button
                        className="flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400"
                        onClick={() => {
                            setShowSettings(true);
                            toggleMobileMenu();
                        }}>
                        <Palette className="h-5 w-5 mr-2" />
                        Color & Size
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    <button
                        className={`flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 ${
                            !canUndo ? 'opacity-50' : ''
                        }`}
                        onClick={handleUndo}
                        disabled={!canUndo}>
                        <Undo className="h-5 w-5 mr-2" />
                        Undo
                    </button>
                    <button
                        className={`flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 ${
                            !canRedo ? 'opacity-50' : ''
                        }`}
                        onClick={handleRedo}
                        disabled={!canRedo}>
                        <Redo className="h-5 w-5 mr-2" />
                        Redo
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    <button
                        className="flex items-center px-3 py-2 rounded-lg text-red-500"
                        onClick={() => {
                            onClear();
                            toggleMobileMenu();
                        }}>
                        <Trash2 className="h-5 w-5 mr-2" />
                        Clear
                    </button>

                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                    <div className="flex justify-between items-center px-3 py-2">
                        <span className="text-gray-600 dark:text-gray-400">
                            Zoom
                        </span>
                        <div className="flex items-center space-x-2">
                            <button
                                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                onClick={() =>
                                    setScale(prevScale =>
                                        Math.max(prevScale - 0.1, 0.5),
                                    )
                                }>
                                <ZoomOut className="h-4 w-4" />
                            </button>
                            <button
                                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                onClick={() => setScale(1)}>
                                <span className="text-xs font-medium">
                                    {Math.round(scale * 100)}%
                                </span>
                            </button>
                            <button
                                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                onClick={() =>
                                    setScale(prevScale =>
                                        Math.min(prevScale + 0.1, 3),
                                    )
                                }>
                                <ZoomIn className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-auto">
                    <button
                        onClick={() => {
                            onSave();
                            toggleMobileMenu();
                        }}
                        className="w-full flex items-center justify-center h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 mb-2">
                        <Save className="h-4 w-4 mr-1.5" />
                        {dict.drawing?.save || 'Save'}
                    </button>
                    <button
                        onClick={() => {
                            onDownload();
                            toggleMobileMenu();
                        }}
                        className="w-full flex items-center justify-center h-10 px-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-lg text-sm font-medium shadow-sm">
                        <Download className="h-4 w-4 mr-1.5" />
                        {dict.drawing?.download || 'Download'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobileMenu;
