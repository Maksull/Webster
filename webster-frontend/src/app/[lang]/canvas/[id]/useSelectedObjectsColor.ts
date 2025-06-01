'use client';

import { useState, useEffect } from 'react';
import { useDrawing } from '@/contexts';
import { useHistory } from './useHistory';
import { DrawingElement } from '@/types/elements';

export const useSelectedObjectsColor = () => {
    const { selectedElementIds, elementsByLayer, setElementsByLayer, layers } =
        useDrawing();

    const { recordHistory } = useHistory();

    const [selectedStrokeColor, setSelectedStrokeColor] = useState('#000000');
    const [selectedFillColor, setSelectedFillColor] = useState('#000000');
    const [hasStrokeElements, setHasStrokeElements] = useState(false);
    const [hasFillElements, setHasFillElements] = useState(false);

    // Get selected elements
    const getSelectedElements = (): DrawingElement[] => {
        const selected: DrawingElement[] = [];
        elementsByLayer.forEach(elements => {
            elements.forEach(element => {
                if (selectedElementIds.includes(element.id)) {
                    selected.push(element);
                }
            });
        });
        return selected;
    };

    // Check if any selected element's layer is locked
    const hasLockedLayer = (): boolean => {
        const selectedElements = getSelectedElements();
        return selectedElements.some(element => {
            const layer = layers.find(l => l.id === element.layerId);
            return layer?.locked || false;
        });
    };

    // Update color states based on selected elements
    useEffect(() => {
        const selectedElements = getSelectedElements();

        if (selectedElements.length === 0) {
            setHasStrokeElements(false);
            setHasFillElements(false);
            return;
        }

        let hasStroke = false;
        let hasFill = false;
        let strokeColor = '';
        let fillColor = '';

        selectedElements.forEach(element => {
            // Check for stroke properties
            if ('stroke' in element && element.stroke) {
                hasStroke = true;
                if (!strokeColor) strokeColor = element.stroke as string;
            }

            // Check for fill properties
            if ('fill' in element && element.fill) {
                hasFill = true;
                if (!fillColor) fillColor = element.fill as string;
            }
        });

        setHasStrokeElements(hasStroke);
        setHasFillElements(hasFill);

        if (strokeColor) setSelectedStrokeColor(strokeColor);
        if (fillColor) setSelectedFillColor(fillColor);
    }, [selectedElementIds, elementsByLayer]);

    // Update stroke color of selected elements
    const updateStrokeColor = (color: string) => {
        if (hasLockedLayer()) {
            console.log('Cannot update color: one or more layers are locked');
            return false;
        }

        setSelectedStrokeColor(color);

        const updatedElementsByLayer = new Map(elementsByLayer);
        let hasChanges = false;

        updatedElementsByLayer.forEach((elements, layerId) => {
            const updatedElements = elements.map(element => {
                if (
                    selectedElementIds.includes(element.id) &&
                    'stroke' in element
                ) {
                    hasChanges = true;
                    return { ...element, stroke: color };
                }
                return element;
            });
            updatedElementsByLayer.set(layerId, updatedElements);
        });

        if (hasChanges) {
            setElementsByLayer(updatedElementsByLayer);
            recordHistory(undefined, updatedElementsByLayer);
            return true;
        }

        return false;
    };

    // Update fill color of selected elements
    const updateFillColor = (color: string) => {
        if (hasLockedLayer()) {
            console.log('Cannot update color: one or more layers are locked');
            return false;
        }

        setSelectedFillColor(color);

        const updatedElementsByLayer = new Map(elementsByLayer);
        let hasChanges = false;

        updatedElementsByLayer.forEach((elements, layerId) => {
            const updatedElements = elements.map(element => {
                if (
                    selectedElementIds.includes(element.id) &&
                    'fill' in element
                ) {
                    hasChanges = true;
                    return { ...element, fill: color };
                }
                return element;
            });
            updatedElementsByLayer.set(layerId, updatedElements);
        });

        if (hasChanges) {
            setElementsByLayer(updatedElementsByLayer);
            recordHistory(undefined, updatedElementsByLayer);
            return true;
        }

        return false;
    };

    return {
        selectedStrokeColor,
        selectedFillColor,
        hasStrokeElements,
        hasFillElements,
        hasLockedLayer,
        updateStrokeColor,
        updateFillColor,
        selectedElementsCount: selectedElementIds.length,
    };
};
