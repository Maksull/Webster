'use client';

import React, { useRef } from 'react';
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
    MousePointer,
    Type,
    Image as ImageIcon,
} from 'lucide-react';
import { useHistory } from './useHistory';
import { useDrawing } from '@/contexts';
import { ImageElement } from '@/types/elements';

const MobileToolbar: React.FC = () => {
    const {
        color,
        showLayersPanel,
        setShowLayersPanel,
        showSettings,
        setShowSettings,
        activeLayerId,
        getActiveLayerElements,
        updateActiveLayerElements,
        opacity,
        tool,
        setTool,
    } = useDrawing();

    const { handleUndo, handleRedo, canUndo, canRedo } = useHistory();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert(
                'Image file is too large. Please select an image smaller than 10MB.',
            );
            return;
        }

        const reader = new FileReader();
        reader.onload = e => {
            const src = e.target?.result as string;

            // Create a temporary image to get dimensions
            const img = new Image();
            img.onload = () => {
                // Calculate initial size (max 250px for mobile)
                const maxSize = 250;
                let width = img.width;
                let height = img.height;

                if (width > maxSize || height > maxSize) {
                    const aspectRatio = width / height;
                    if (width > height) {
                        width = maxSize;
                        height = maxSize / aspectRatio;
                    } else {
                        height = maxSize;
                        width = maxSize * aspectRatio;
                    }
                }

                const imageElement: ImageElement = {
                    id: Date.now().toString(),
                    type: 'image',
                    x: 50, // Default position
                    y: 50,
                    width,
                    height,
                    src,
                    originalWidth: img.width,
                    originalHeight: img.height,
                    rotation: 0,
                    opacity: opacity || 1,
                    layerId: activeLayerId,
                };

                // Add to active layer
                const activeElements = getActiveLayerElements();
                const updatedElements = [...activeElements, imageElement];
                updateActiveLayerElements(updatedElements);

                // Switch to select tool to allow immediate manipulation
                setTool('select');
            };

            img.src = src;
        };

        reader.readAsDataURL(file);

        // Reset the input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="md:hidden flex justify-center items-center h-12 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-x-auto">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
            />

            <div className="flex space-x-2 px-2">
                {/* Selection and drawing tools */}
                <ToolButton tool="select" icon={MousePointer} title="Select" />
                <ToolButton tool="pencil" icon={Pencil} title="Pencil" />
                <ToolButton tool="eraser" icon={Eraser} title="Eraser" />
                <ToolButton tool="bucket" icon={Droplet} title="Fill" />

                {/* Shape tools */}
                <ToolButton tool="rectangle" icon={Square} title="Rectangle" />
                <ToolButton tool="circle" icon={CircleIcon} title="Circle" />
                <ToolButton tool="line" icon={Minus} title="Line" />
                <ToolButton
                    tool="triangle"
                    icon={TriangleIcon}
                    title="Triangle"
                />
                <ToolButton tool="text" icon={Type} title="Text" />

                {/* Image tool */}
                <button
                    className={`p-2 rounded-full transition-colors duration-200 ${
                        tool === 'image'
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={triggerImageUpload}
                    title="Insert Image">
                    <ImageIcon className="h-5 w-5" />
                </button>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 self-center"></div>

                {/* Layers button */}
                <button
                    className={`p-2 rounded-full transition-colors duration-200 ${
                        showLayersPanel
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setShowLayersPanel(!showLayersPanel)}
                    title="Layers">
                    <Layers className="h-5 w-5" />
                </button>

                {/* Settings button */}
                <button
                    className="p-2 rounded-full text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors duration-200 relative"
                    onClick={() => setShowSettings(!showSettings)}
                    title="Color & Size">
                    <Palette className="h-5 w-5" />
                    <div
                        className="absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-white dark:ring-gray-800"
                        style={{ backgroundColor: color }}></div>
                </button>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 self-center"></div>

                {/* Undo button */}
                <button
                    className={`p-2 rounded-full text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                        !canUndo ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={handleUndo}
                    disabled={!canUndo}
                    title="Undo">
                    <Undo className="h-5 w-5" />
                </button>

                {/* Redo button */}
                <button
                    className={`p-2 rounded-full text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                        !canRedo ? 'opacity-50 cursor-not-allowed' : ''
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
