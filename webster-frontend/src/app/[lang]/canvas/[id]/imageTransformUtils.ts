import { ImageElement, DrawingElement } from '@/types/elements';

export interface ImageTransformUtils {
    flipImageHorizontal: (imageId: string) => void;
    flipImageVertical: (imageId: string) => void;
    resetImageTransform: (imageId: string) => void;
    scaleImage: (imageId: string, scaleX: number, scaleY: number) => void;
}

export const createImageTransformUtils = (
    elementsByLayer: Map<string, DrawingElement[]>,
    setElementsByLayer: (map: Map<string, DrawingElement[]>) => void,
): ImageTransformUtils => {
    const updateImageElement = (
        elementId: string,
        updates: Partial<ImageElement>,
    ) => {
        const updatedElementsByLayer = new Map(elementsByLayer);
        updatedElementsByLayer.forEach((elements, layerId) => {
            const updatedElements = elements.map(element => {
                if (element.id === elementId && element.type === 'image') {
                    return { ...element, ...updates };
                }
                return element;
            });
            updatedElementsByLayer.set(layerId, updatedElements);
        });
        setElementsByLayer(updatedElementsByLayer);
    };

    const getImageElement = (imageId: string): ImageElement | null => {
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
    };

    const flipImageHorizontal = (imageId: string) => {
        const imageElement = getImageElement(imageId);
        if (!imageElement) return;

        const currentScaleX = imageElement.scaleX || 1;
        updateImageElement(imageId, {
            scaleX: -currentScaleX,
            offsetX: currentScaleX > 0 ? imageElement.width : 0,
        });
    };

    const flipImageVertical = (imageId: string) => {
        const imageElement = getImageElement(imageId);
        if (!imageElement) return;

        const currentScaleY = imageElement.scaleY || 1;
        updateImageElement(imageId, {
            scaleY: -currentScaleY,
            offsetY: currentScaleY > 0 ? imageElement.height : 0,
        });
    };

    const resetImageTransform = (imageId: string) => {
        updateImageElement(imageId, {
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            offsetX: 0,
            offsetY: 0,
        });
    };

    const scaleImage = (imageId: string, scaleX: number, scaleY: number) => {
        updateImageElement(imageId, { scaleX, scaleY });
    };

    return {
        flipImageHorizontal,
        flipImageVertical,
        resetImageTransform,
        scaleImage,
    };
};
