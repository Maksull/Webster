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
    selectedElementIds: string[];
    onSelectElement: (id: string) => void;
    onTextEdit?: (id: string) => void;
    onImageResizeStart?: () => void;
    onImageResizeEnd?: () => void;
}

const LayerRenderer: React.FC<LayerRendererProps> = ({
    layer,
    elements,
    onRef,
    selectedElementIds,
    onSelectElement,
    onTextEdit,
    onImageResizeStart,
    onImageResizeEnd,
}) => {
    if (!layer.visible) return null;

    return (
        <Layer
            key={layer.id}
            opacity={layer.opacity}
            listening={true}
            hitGraphEnabled={true}
            ref={node => {
                if (node) {
                    onRef(layer.id, node);
                }
            }}>
            {elements.map(element => (
                <ElementRenderer
                    key={element.id}
                    element={element}
                    isSelected={selectedElementIds.includes(element.id)}
                    onSelect={onSelectElement}
                    onTextEdit={onTextEdit}
                    onImageResizeStart={onImageResizeStart}
                    onImageResizeEnd={onImageResizeEnd}
                />
            ))}
        </Layer>
    );
};

export default LayerRenderer;
