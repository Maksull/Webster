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

        // Check if layer exists and is not already at the bottom (index 0)
        if (layerIndex <= 0) {
            console.warn(
                'Cannot merge down: layer is already at the bottom or not found',
            );
            return;
        }

        // Get the current layer (to be merged) and the target layer (below/behind it)
        const currentLayerId = layerId;
        const targetLayerId = layers[layerIndex - 1].id; // Layer below (behind) the current one

        const currentElements = elementsByLayer.get(currentLayerId) || [];
        const targetElements = elementsByLayer.get(targetLayerId) || [];

        // Merge elements: target layer elements first, then current layer elements on top
        const mergedElements = [
            ...targetElements,
            ...currentElements.map(el => ({
                ...el,
                layerId: targetLayerId, // Update the layerId to the target layer
            })),
        ];

        // Remove the current layer from the layers array
        const updatedLayers = layers.filter(
            layer => layer.id !== currentLayerId,
        );

        // Update the elements map
        const updatedElementsByLayer = new Map(elementsByLayer);
        updatedElementsByLayer.delete(currentLayerId); // Remove current layer's elements
        updatedElementsByLayer.set(targetLayerId, mergedElements); // Set merged elements to target layer

        // Update state
        setLayers(updatedLayers);
        setElementsByLayer(updatedElementsByLayer);

        // Set the target layer as active (since current layer was removed)
        setActiveLayerId(targetLayerId);

        // Update history
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            layers: updatedLayers,
            elementsByLayer: updatedElementsByLayer,
            backgroundColor,
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);

        console.log(
            `Merged layer "${layers.find(l => l.id === currentLayerId)?.name}" down into "${layers.find(l => l.id === targetLayerId)?.name}"`,
        );
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
