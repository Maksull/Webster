'use client';

import { useDrawing } from '@/contexts';
import { DrawingLayer } from '@/types/layers';

export const useLayers = () => {
    const {
        layers,
        setLayers,
        elementsByLayer,
        setElementsByLayer,
        activeLayerId,
        setActiveLayerId,
        history,
        setHistory,
        historyStep,
        setHistoryStep,
        backgroundColor,
    } = useDrawing();

    // Add a new layer
    const addLayer = () => {
        const newLayerId = Date.now().toString();
        const newLayer: DrawingLayer = {
            id: newLayerId,
            name: `Layer ${layers.length + 1}`,
            visible: true,
            locked: false,
            opacity: 1,
        };

        const updatedLayers = [...layers, newLayer];
        setLayers(updatedLayers);
        setActiveLayerId(newLayerId);

        const updatedElementsByLayer = new Map(elementsByLayer);
        updatedElementsByLayer.set(newLayerId, []);
        setElementsByLayer(updatedElementsByLayer);

        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers: updatedLayers,
            elementsByLayer: updatedElementsByLayer,
            backgroundColor,
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    // Delete a layer
    const deleteLayer = (layerId: string) => {
        if (layers.length <= 1) {
            return {
                success: false,
                message: 'Cannot delete the only layer',
            };
        }

        const updatedLayers = layers.filter(layer => layer.id !== layerId);
        setLayers(updatedLayers);

        const updatedElementsByLayer = new Map(elementsByLayer);
        updatedElementsByLayer.delete(layerId);
        setElementsByLayer(updatedElementsByLayer);

        if (activeLayerId === layerId) {
            setActiveLayerId(updatedLayers[updatedLayers.length - 1].id);
        }

        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers: updatedLayers,
            elementsByLayer: updatedElementsByLayer,
            backgroundColor,
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
        return {
            success: true,
            message: 'Layer deleted successfully!',
        };
    };

    // Toggle layer visibility
    const toggleLayerVisibility = (layerId: string) => {
        const updatedLayers = layers.map(layer =>
            layer.id === layerId
                ? { ...layer, visible: !layer.visible }
                : layer,
        );
        setLayers(updatedLayers);

        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers: updatedLayers,
            elementsByLayer,
            backgroundColor,
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    // Toggle layer lock
    const toggleLayerLock = (layerId: string) => {
        const updatedLayers = layers.map(layer =>
            layer.id === layerId ? { ...layer, locked: !layer.locked } : layer,
        );
        setLayers(updatedLayers);

        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers: updatedLayers,
            elementsByLayer,
            backgroundColor,
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    // Rename layer
    const renameLayer = (layerId: string, newName: string) => {
        const updatedLayers = layers.map(layer =>
            layer.id === layerId ? { ...layer, name: newName } : layer,
        );
        setLayers(updatedLayers);

        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers: updatedLayers,
            elementsByLayer,
            backgroundColor,
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    const moveLayerUp = (layerId: string) => {
        const layerIndex = layers.findIndex(layer => layer.id === layerId);
        // Check if layer exists and is not already at the top
        if (layerIndex < 0 || layerIndex >= layers.length - 1) return;

        const updatedLayers = [...layers];
        // Swap with the layer above (higher index = forward/on top)
        const temp = updatedLayers[layerIndex];
        updatedLayers[layerIndex] = updatedLayers[layerIndex + 1];
        updatedLayers[layerIndex + 1] = temp;

        setLayers(updatedLayers);
        const updatedElementsByLayer = new Map(elementsByLayer);
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers: updatedLayers,
            elementsByLayer: updatedElementsByLayer,
            backgroundColor,
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    const moveLayerDown = (layerId: string) => {
        const layerIndex = layers.findIndex(layer => layer.id === layerId);
        // Check if layer exists and is not already at the bottom
        if (layerIndex <= 0) return;

        const updatedLayers = [...layers];
        // Swap with the layer below (lower index = backward/behind)
        const temp = updatedLayers[layerIndex];
        updatedLayers[layerIndex] = updatedLayers[layerIndex - 1];
        updatedLayers[layerIndex - 1] = temp;

        setLayers(updatedLayers);
        const updatedElementsByLayer = new Map(elementsByLayer);
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers: updatedLayers,
            elementsByLayer: updatedElementsByLayer,
            backgroundColor,
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    // Duplicate a layer
    const duplicateLayer = (layerId: string) => {
        const sourceLayer = layers.find(layer => layer.id === layerId);
        if (!sourceLayer) return;

        const newLayerId = Date.now().toString();
        const newLayer: DrawingLayer = {
            id: newLayerId,
            name: `${sourceLayer.name} (Copy)`,
            visible: true,
            locked: false,
            opacity: sourceLayer.opacity,
        };

        const sourceElements = elementsByLayer.get(layerId) || [];
        const duplicatedElements = sourceElements.map(element => ({
            ...element,
            id: `${element.id}-copy-${Date.now()}`,
            layerId: newLayerId,
        }));

        const updatedLayers = [...layers, newLayer];
        setLayers(updatedLayers);
        setActiveLayerId(newLayerId);

        const updatedElementsByLayer = new Map(elementsByLayer);
        updatedElementsByLayer.set(newLayerId, duplicatedElements);
        setElementsByLayer(updatedElementsByLayer);

        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers: updatedLayers,
            elementsByLayer: updatedElementsByLayer,
            backgroundColor,
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    // Update layer opacity
    const updateLayerOpacity = (layerId: string, opacity: number) => {
        const updatedLayers = layers.map(layer =>
            layer.id === layerId ? { ...layer, opacity } : layer,
        );
        setLayers(updatedLayers);

        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers: updatedLayers,
            elementsByLayer,
            backgroundColor,
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    // Merge layer with the one below it
    const mergeLayerDown = (layerId: string) => {
        const layerIndex = layers.findIndex(layer => layer.id === layerId);
        if (layerIndex >= layers.length - 1) return;

        const upperLayerId = layerId;
        const lowerLayerId = layers[layerIndex + 1].id;

        const upperElements = elementsByLayer.get(upperLayerId) || [];
        const lowerElements = elementsByLayer.get(lowerLayerId) || [];

        const mergedElements = [
            ...lowerElements,
            ...upperElements.map(el => ({ ...el, layerId: lowerLayerId })),
        ];

        const updatedLayers = layers.filter(layer => layer.id !== upperLayerId);

        const updatedElementsByLayer = new Map(elementsByLayer);
        updatedElementsByLayer.delete(upperLayerId);
        updatedElementsByLayer.set(lowerLayerId, mergedElements);

        setLayers(updatedLayers);
        setElementsByLayer(updatedElementsByLayer);
        setActiveLayerId(lowerLayerId);

        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers: updatedLayers,
            elementsByLayer: updatedElementsByLayer,
            backgroundColor,
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    return {
        addLayer,
        deleteLayer,
        toggleLayerVisibility,
        toggleLayerLock,
        renameLayer,
        moveLayerUp,
        moveLayerDown,
        duplicateLayer,
        updateLayerOpacity,
        mergeLayerDown,
    };
};
