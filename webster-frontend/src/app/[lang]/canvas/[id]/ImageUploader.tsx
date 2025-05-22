'use client';

import React, { useRef } from 'react';
import { useDrawing } from '@/contexts';
import { ImageElement } from '@/types/elements';

interface ImageUploaderProps {
    onImageInsert: (imageElement: ImageElement) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageInsert }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { activeLayerId, color, opacity } = useDrawing();

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
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
