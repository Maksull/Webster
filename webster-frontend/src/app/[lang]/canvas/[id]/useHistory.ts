'use client';

import { useDrawing } from '@/contexts';

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
    } = useDrawing();

    // Record current state to history
    const recordHistory = (
        newBackgroundColor: string | undefined = undefined,
    ) => {
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers,
            elementsByLayer: new Map(elementsByLayer),
            backgroundColor: newBackgroundColor || backgroundColor, // Use passed color if provided
        });

        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    // Handle undo
    const handleUndo = () => {
        if (historyStep > 0) {
            setHistoryStep(historyStep - 1);
            const {
                layers: prevLayers,
                elementsByLayer: prevElements,
                backgroundColor: prevBackgroundColor,
            } = history[historyStep - 1];
            setLayers(prevLayers);
            setElementsByLayer(prevElements);
            setBackgroundColor(prevBackgroundColor);

            if (!prevLayers.find(layer => layer.id === activeLayerId)) {
                setActiveLayerId(prevLayers[0].id);
            }
        }
    };

    // Handle redo
    const handleRedo = () => {
        if (historyStep < history.length - 1) {
            setHistoryStep(historyStep + 1);
            const {
                layers: nextLayers,
                elementsByLayer: nextElements,
                backgroundColor: nextBackgroundColor,
            } = history[historyStep + 1];
            setLayers(nextLayers);
            setElementsByLayer(nextElements);
            setBackgroundColor(nextBackgroundColor);

            if (!nextLayers.find(layer => layer.id === activeLayerId)) {
                setActiveLayerId(nextLayers[0].id);
            }
        }
    };

    // Clear canvas
    const handleClear = () => {
        // Clear all elements from all layers
        const clearedElementsByLayer = new Map();
        layers.forEach(layer => {
            clearedElementsByLayer.set(layer.id, []);
        });

        setElementsByLayer(clearedElementsByLayer);

        // Save to history
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
