// app/[lang]/editor/components/canvas/LayerRenderer.tsx
'use client';

import React from 'react';
import { Layer } from 'react-konva';
import ElementRenderer from './ElementRenderer';
import { DrawingLayer } from '@/types/layers';
import { DrawingElement } from '@/types/elements';

interface LayerRendererProps {
    layer: DrawingLayer;
    elements: DrawingElement[];
    onRef: (id: string, node: any) => void;
}

const LayerRenderer: React.FC<LayerRendererProps> = ({
    layer,
    elements,
    onRef,
}) => {
    // Skip invisible layers
    if (!layer.visible) return null;

    return (
        <Layer
            key={layer.id}
            opacity={layer.opacity}
            ref={node => {
                if (node) {
                    onRef(layer.id, node);
                }
            }}>
            {elements.map(element => (
                <ElementRenderer key={element.id} element={element} />
            ))}
        </Layer>
    );
};

export default LayerRenderer;
