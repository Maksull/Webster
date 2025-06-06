// ImageToolbar.tsx - Update to use recordHistory

import React from 'react';
import { useDictionary, useDrawing } from '@/contexts';
import { useHistory } from './useHistory'; // Import useHistory
import { createImageTransformUtils } from './imageTransformUtils';
import { ImageElement } from '@/types/elements';
import {
    X,
    Maximize,
    Square,
    FlipHorizontal,
    FlipVertical,
    RotateCcw,
    Lock,
    Unlock,
    Image as ImageIcon,
} from 'lucide-react';

interface ImageToolbarProps {
    selectedImageId?: string;
    onClose?: () => void;
    fitImageToCanvas: (imageId: string) => void;
    fitImageToCanvasWithAspectRatio: (imageId: string) => void;
    toggleAspectRatio: () => void;
}

const ImageToolbar: React.FC<ImageToolbarProps> = ({
    selectedImageId,
    onClose,
    fitImageToCanvas,
    fitImageToCanvasWithAspectRatio,
    toggleAspectRatio,
}) => {
    const {
        elementsByLayer,
        selectedElementIds,
        setElementsByLayer,
        setSelectedElementIds,
        maintainAspectRatio,
        layers,
        isMoving,
    } = useDrawing();

    const { dict } = useDictionary();
    const { recordHistory } = useHistory(); // Get recordHistory function

    // Pass recordHistory to imageTransformUtils
    const imageTransformUtils = React.useMemo(
        () =>
            createImageTransformUtils(
                elementsByLayer,
                setElementsByLayer,
                recordHistory, // Pass recordHistory function
            ),
        [elementsByLayer, setElementsByLayer, recordHistory],
    );

    // Rest of the component remains the same...
    const isImageLayerLocked = (imageId: string): boolean => {
        for (const [layerId, elements] of elementsByLayer.entries()) {
            const element = elements.find(el => el.id === imageId);
            if (element) {
                const layer = layers.find(l => l.id === layerId);
                return layer?.locked || false;
            }
        }
        return false;
    };

    const selectedImage = React.useMemo((): ImageElement | null => {
        if (!selectedImageId && selectedElementIds.length === 0) return null;

        const imageId =
            selectedImageId ||
            selectedElementIds.find(id => {
                let isImage = false;
                elementsByLayer.forEach(elements => {
                    const element = elements.find(el => el.id === id);
                    if (element && element.type === 'image') {
                        isImage = true;
                    }
                });
                return isImage;
            });

        if (!imageId) return null;

        if (isImageLayerLocked(imageId)) {
            console.log('Image toolbar blocked: layer is locked');
            return null;
        }

        let imageElement: ImageElement | null = null;
        elementsByLayer.forEach(elements => {
            const found = elements.find(
                el => el.id === imageId && el.type === 'image',
            ) as ImageElement;
            if (found) {
                imageElement = found;
            }
        });

        return imageElement;
    }, [selectedImageId, selectedElementIds, elementsByLayer, layers]);

    if (!selectedImage || isMoving) return null;

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
        setSelectedElementIds([]);
    };

    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl rounded-xl border border-gray-200/60 dark:border-gray-700/60 p-4 max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                {dict.imageToolBar?.title || 'Image Tools'}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {dict.imageToolBar?.resolution || 'Resolution'}:{' '}
                                {Math.round(selectedImage.width)}×
                                {Math.round(selectedImage.height)}px
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="cursor-pointer p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Close toolbar">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Main toolbar */}
                <div className="flex items-center gap-6 flex-wrap">
                    {/* Fit to Canvas */}
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {dict.imageToolBar?.fitToCanvas || 'Fit to Canvas'}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    fitImageToCanvas(selectedImage.id)
                                }
                                className="cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg shadow-sm transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                title={
                                    dict.imageToolBar?.fitImageStretch ||
                                    'Fit image to canvas (stretch)'
                                }>
                                <Maximize className="w-4 h-4 mr-1.5" />
                                {dict.imageToolBar?.stretch || 'Stretch'}
                            </button>

                            <button
                                onClick={() =>
                                    fitImageToCanvasWithAspectRatio(
                                        selectedImage.id,
                                    )
                                }
                                className="cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-sm transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                title={
                                    dict.imageToolBar?.fitImageMaintainAspect ||
                                    'Fit image to canvas (maintain aspect ratio)'
                                }>
                                <Square className="w-4 h-4 mr-1.5" />
                                {dict.imageToolBar?.fit || 'Fit'}
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-12 w-px bg-gray-200 dark:bg-gray-600"></div>

                    {/* Transform */}
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {dict.imageToolBar?.transform || 'Transform'}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() =>
                                    imageTransformUtils.flipImageHorizontal(
                                        selectedImage.id,
                                    )
                                }
                                className="cursor-pointer inline-flex items-center justify-center p-2 text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg shadow-sm transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                title={
                                    dict.imageToolBar?.flipHorizontal ||
                                    'Flip horizontal'
                                }>
                                <FlipHorizontal className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() =>
                                    imageTransformUtils.flipImageVertical(
                                        selectedImage.id,
                                    )
                                }
                                className="cursor-pointer inline-flex items-center justify-center p-2 text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg shadow-sm transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                title={
                                    dict.imageToolBar?.flipVertical ||
                                    'Flip vertical'
                                }>
                                <FlipVertical className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() =>
                                    imageTransformUtils.resetImageTransform(
                                        selectedImage.id,
                                    )
                                }
                                className="cursor-pointer inline-flex items-center justify-center p-2 text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                title={
                                    dict.imageToolBar?.reset ||
                                    'Reset all transforms'
                                }>
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-12 w-px bg-gray-200 dark:bg-gray-600"></div>

                    {/* Constraints */}
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {dict.imageToolBar?.constraints || 'Constraints'}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleAspectRatio}
                                className={`cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                    maintainAspectRatio
                                        ? 'text-white bg-amber-500 hover:bg-amber-600 focus:ring-amber-500 shadow-lg'
                                        : 'text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-gray-500'
                                }`}
                                title={
                                    dict.imageToolBar?.toggleAspectRatio ||
                                    'Toggle aspect ratio lock when resizing'
                                }>
                                {maintainAspectRatio ? (
                                    <>
                                        <Lock className="w-4 h-4 mr-1.5" />
                                        {dict.imageToolBar?.locked || 'Locked'}
                                    </>
                                ) : (
                                    <>
                                        <Unlock className="w-4 h-4 mr-1.5" />
                                        {dict.imageToolBar?.unlocked ||
                                            'Unlocked'}
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleClose}
                                className="cursor-pointer px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                title="Close and deselect">
                                {dict.imageToolBar?.done || 'Done'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>
                            {dict.imageToolBar?.selectedImage ||
                                'Selected: Image'}{' '}
                            #{selectedImage.id.slice(-8)}
                        </span>
                        <div className="flex items-center gap-4">
                            <span>
                                {dict.imageToolBar?.aspectRatio ||
                                    'Aspect Ratio'}
                                :{' '}
                                {maintainAspectRatio
                                    ? dict.imageToolBar?.locked || 'Locked'
                                    : dict.imageToolBar?.unlocked || 'Free'}
                            </span>
                            <span>
                                {dict.imageToolBar?.ratio || 'Ratio'}:{' '}
                                {(
                                    selectedImage.width / selectedImage.height
                                ).toFixed(2)}
                                :1
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageToolbar;
