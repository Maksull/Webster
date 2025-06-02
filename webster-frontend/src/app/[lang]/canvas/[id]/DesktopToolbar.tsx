'use client';
import React, { useRef, useState } from 'react';
import ToolButton from './ToolButton';
import {
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
    ArrowUpRight,
    Image as ImageIcon,
    Spline,
} from 'lucide-react';
import { Dictionary } from '@/get-dictionary';
import { useHistory } from './useHistory';
import { useDrawing } from '@/contexts';
import { ImageElement } from '@/types/elements';
import AlertModal from '@/components/AlertModal';
import ToolSelector from './ToolSelector';

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
        activeLayerId,
        getActiveLayerElements,
        updateActiveLayerElements,
        opacity,
        tool,
        setTool,
    } = useDrawing();

    const { handleUndo, handleRedo, canUndo, canRedo } = useHistory();
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

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleZoomIn = () => {
        setScale(prevScale => Math.min(prevScale + 0.1, 3));
    };

    const handleZoomOut = () => {
        setScale(prevScale => Math.max(prevScale - 0.1, 0.5));
    };

    const handleResetZoom = () => {
        setScale(1);
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
                const maxSize = 300;
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
        <div className="hidden md:flex w-16 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 flex-col items-center py-4 gap-2 overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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

            {/* Selection and drawing tools */}
            <ToolButton
                tool="select"
                icon={MousePointer}
                title={dict.drawing?.select || 'Select'}
            />

            <ToolSelector
                activeTool={tool}
                onSelect={selected => setTool(selected)}
                dict={dict}
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
                tool="curve"
                icon={Spline}
                title={dict.drawing?.curve || 'Curve'}
            />

            <ToolButton
                tool="arrow"
                icon={ArrowUpRight}
                title={dict.drawing?.arrow || 'Arrow'}
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

            <button
                className={`p-2 rounded-lg transition-colors duration-200 ${
                    tool === 'image'
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                }`}
                onClick={triggerImageUpload}
                title={dict.drawing?.image || 'Insert Image'}>
                <ImageIcon className="h-5 w-5" />
            </button>

            <div className="my-2 border-t border-slate-200 dark:border-gray-700 w-10"></div>

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

            <button
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                onClick={onClear}
                title={dict.drawing?.clear || 'Clear'}>
                <Trash2 className="h-5 w-5" />
            </button>

            <div className="my-2 border-t border-slate-200 dark:border-gray-700 w-10"></div>

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
