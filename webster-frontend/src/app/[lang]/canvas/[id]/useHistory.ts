'use client';

import { useDrawing } from '@/contexts';
import { DrawingElement } from '@/types/elements';
import { DrawingLayer } from '@/types/layers';

export const useHistory = () => {
    const {
        history,
        setHistory,
        historyStep,
        setHistoryStep,
        setLayers,
        setElementsByLayer,
        activeLayerId,
        setActiveLayerId,
        elementsByLayer,
        layers,
        backgroundColor,
        setBackgroundColor,
        setTextEditingId,
        setTextValue,
    } = useDrawing();

    const recordHistory = (
        newBackgroundColor: string | undefined = undefined,
        customElementsByLayer?: Map<string, DrawingElement[]>,
        customLayers?: DrawingLayer[],
    ) => {
        const newHistory = history.slice(0, historyStep + 1);
        const elementsToRecord = customElementsByLayer || elementsByLayer;
        const layersToRecord = customLayers || layers;

        const clonedElementsByLayer = new Map();
        elementsToRecord.forEach((elements, layerId) => {
            clonedElementsByLayer.set(layerId, [...elements]);
        });

        const textElements: string[] = [];
        clonedElementsByLayer.forEach(elements => {
            elements.forEach((element: DrawingElement) => {
                if (element.type === 'text') {
                    textElements.push(element.text);
                }
            });
        });

        newHistory.push({
            layers: [...layersToRecord],
            elementsByLayer: clonedElementsByLayer,
            backgroundColor: newBackgroundColor || backgroundColor,
        });

        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    const clearTextEditingState = () => {
        setTextEditingId(null);
        setTextValue('');
    };

    const handleUndo = () => {
        if (historyStep > 0) {
            clearTextEditingState();
            setHistoryStep(historyStep - 1);
            const {
                layers: prevLayers,
                elementsByLayer: prevElements,
                backgroundColor: prevBackgroundColor,
            } = history[historyStep - 1];

            setLayers([...prevLayers]);
            setElementsByLayer(new Map(prevElements));
            setBackgroundColor(prevBackgroundColor);

            if (!prevLayers.find(layer => layer.id === activeLayerId)) {
                setActiveLayerId(prevLayers[0].id);
            }
        }
    };

    const handleRedo = () => {
        if (historyStep < history.length - 1) {
            clearTextEditingState();
            setHistoryStep(historyStep + 1);
            const {
                layers: nextLayers,
                elementsByLayer: nextElements,
                backgroundColor: nextBackgroundColor,
            } = history[historyStep + 1];

            setLayers([...nextLayers]);
            setElementsByLayer(new Map(nextElements));
            setBackgroundColor(nextBackgroundColor);

            if (!nextLayers.find(layer => layer.id === activeLayerId)) {
                setActiveLayerId(nextLayers[0].id);
            }
        }
    };

    const handleClear = () => {
        clearTextEditingState();
        const clearedElementsByLayer = new Map();
        layers.forEach(layer => {
            clearedElementsByLayer.set(layer.id, []);
        });

        setElementsByLayer(clearedElementsByLayer);

        const newHistory = [
            ...history.slice(0, historyStep + 1),
            {
                layers,
                elementsByLayer: clearedElementsByLayer,
                backgroundColor,
            },
        ];

        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    return {
        recordHistory,
        handleUndo,
        handleRedo,
        handleClear,
        canUndo: historyStep > 0,
        canRedo: historyStep < history.length - 1,
    };
};
