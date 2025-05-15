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
    } = useDrawing();

    // Record current state to history
    const recordHistory = () => {
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers,
            elementsByLayer: new Map(elementsByLayer),
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    // Handle undo
    const handleUndo = () => {
        if (historyStep > 0) {
            setHistoryStep(historyStep - 1);
            const { layers: prevLayers, elementsByLayer: prevElements } =
                history[historyStep - 1];
            setLayers(prevLayers);
            setElementsByLayer(prevElements);

            // Make sure active layer still exists
            if (!prevLayers.find(layer => layer.id === activeLayerId)) {
                setActiveLayerId(prevLayers[0].id);
            }
        }
    };

    // Handle redo
    const handleRedo = () => {
        if (historyStep < history.length - 1) {
            setHistoryStep(historyStep + 1);
            const { layers: nextLayers, elementsByLayer: nextElements } =
                history[historyStep + 1];
            setLayers(nextLayers);
            setElementsByLayer(nextElements);

            // Make sure active layer still exists
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
