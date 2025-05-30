'use client';

import React, { useRef, useState } from 'react';
import { useDrawing } from '@/contexts';
import { ImageElement } from '@/types/elements';
import AlertModal from '@/components/AlertModal';

interface ImageUploaderProps {
    onImageInsert: (imageElement: ImageElement) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageInsert }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { activeLayerId, opacity } = useDrawing();
    const [modal, setModal] = useState({
        open: false,
        type: 'success' as 'success' | 'error',
        message: '',
    });

    const notify = (type: 'success' | 'error', message: string) => {
        setModal({ open: true, type, message });
    };

    const handleFileSelectWithNotify = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const result = handleFileSelect(event);
        notify(result.success ? 'success' : 'error', result.message);
    };
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) {
            return {
                success: false,
                message: 'Please select a valid image file',
            };
        }

        // Check file size (limit to 10MB)
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

            // Create a temporary image to get dimensions
            const img = new Image();
            img.onload = () => {
                // Calculate initial size (max 300px while maintaining aspect ratio)
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

                onImageInsert(imageElement);
            };

            img.src = src;
        };

        reader.readAsDataURL(file);

        // Reset the input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        return {
            success: true,
            message: 'Image is being uploaded and added to the canvas.',
        };
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <>
            <AlertModal
                open={modal.open}
                type={modal.type}
                message={modal.message}
                onClose={() => setModal({ ...modal, open: false })}
            />
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelectWithNotify}
                style={{ display: 'none' }}
            />
            <button
                onClick={triggerFileSelect}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                Insert Image
            </button>
        </>
    );
};

export default ImageUploader;
