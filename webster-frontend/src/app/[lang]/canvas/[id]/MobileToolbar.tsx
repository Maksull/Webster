'use client';

import React, { useRef, useState } from 'react';
import {
    Pencil,
    Eraser,
    Palette,
    Undo,
    Redo,
    MousePointer,
    Image as ImageIcon,
    CircleIcon,
    Droplet,
    Minus,
    Square,
} from 'lucide-react';
import { useHistory } from './useHistory';
import { useDrawing } from '@/contexts';
import { ImageElement } from '@/types/elements';
import AlertModal from '@/components/AlertModal';
import ToolButton from './ToolButton';

const MobileToolbar: React.FC = () => {
    const {
        color,
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
    const [modal, setModal] = useState({
        open: false,
        type: 'success' as 'success' | 'error',
        message: '',
    });

    const notify = (type: 'success' | 'error', message: string) => {
        setModal({ open: true, type, message });
    };

    const handleImageUploadWithNotify = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const result = handleImageUpload(event);
        notify(result.success ? 'success' : 'error', result.message);
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) {
            return {
                success: false,
                message: 'Please select a valid image file',
            };
        }
        if (file.size > 10 * 1024 * 1024) {
            return {
                success: false,
                message:
                    'Image file is too large. Please select an image smaller than 10MB.',
            };
        }

        const reader = new FileReader();
        reader.onload = e => {
            const src = e.target?.result as string;
            const img = new Image();
            img.onload = () => {
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
                    x: 50,
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

                const activeElements = getActiveLayerElements();
                const updatedElements = [...activeElements, imageElement];
                updateActiveLayerElements(updatedElements);
                setTool('select');
            };
            img.src = src;
        };
        reader.readAsDataURL(file);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        return {
            success: true,
            message: 'Image is being uploaded and added to the canvas.',
        };
    };

    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="md:hidden flex justify-center items-center h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 px-4">
            <AlertModal
                open={modal.open}
                type={modal.type}
                message={modal.message}
                onClose={() => setModal({ ...modal, open: false })}
            />

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUploadWithNotify}
                style={{ display: 'none' }}
            />

            <div className="flex items-center space-x-1 overflow-x-auto whitespace-nowrap w-full">
                {/* Essential Tools */}
                <div className="flex items-center space-x-1">
                    <ToolButton
                        tool="select"
                        icon={MousePointer}
                        title="Select"
                    />
                    <ToolButton tool="pencil" icon={Pencil} title="Draw" />
                    <ToolButton tool="bucket" icon={Droplet} title="Fill" />
                    <ToolButton tool="eraser" icon={Eraser} title="Eraser" />
                    <ToolButton
                        tool="rectangle"
                        icon={Square}
                        title="Rectangle"
                    />
                    <ToolButton
                        tool="circle"
                        icon={CircleIcon}
                        title="Circle"
                    />
                    <ToolButton tool="line" icon={Minus} title="Line" />

                    {/* Add Image Button */}
                    <button
                        className={`p-3 rounded-lg transition-colors duration-200 ${
                            tool === 'image'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={triggerImageUpload}
                        title="Add Image">
                        <ImageIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* History Controls */}
                <div className="flex items-center space-x-1">
                    <button
                        className={`p-3 rounded-lg transition-colors duration-200 ${
                            !canUndo
                                ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-gray-600'
                                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={handleUndo}
                        disabled={!canUndo}
                        title="Undo">
                        <Undo className="h-6 w-6" />
                    </button>

                    <button
                        className={`p-3 rounded-lg transition-colors duration-200 ${
                            !canRedo
                                ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-gray-600'
                                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={handleRedo}
                        disabled={!canRedo}
                        title="Redo">
                        <Redo className="h-6 w-6" />
                    </button>
                </div>

                {/* Color/Settings */}
                <div className="flex items-center">
                    <button
                        className="p-3 rounded-lg text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors duration-200 relative"
                        onClick={() => setShowSettings(!showSettings)}
                        title="Color & Size">
                        <Palette className="h-6 w-6" />
                        <div
                            className="absolute bottom-1 right-1 w-3 h-3 rounded-full ring-2 ring-white dark:ring-gray-800"
                            style={{ backgroundColor: color }}></div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobileToolbar;
