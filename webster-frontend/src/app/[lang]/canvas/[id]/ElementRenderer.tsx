'use client';

import React from 'react';
import { Line, Rect, Circle, RegularPolygon, Text } from 'react-konva';
import {
    LineElement,
    RectElement,
    CircleElement,
    LineShapeElement,
    RectangleElement,
    TriangleElement,
    TextElement,
} from '@/types/elements';

interface ElementRendererProps {
    element: any;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onTextEdit?: (id: string) => void;
}

const ElementRenderer: React.FC<ElementRendererProps> = ({
    element,
    isSelected,
    onSelect,
    onTextEdit,
}) => {
    const selectionProps = isSelected
        ? {
              shadowColor: '#0066FF',
              shadowBlur: 10,
              shadowOpacity: 0.6,
              shadowOffset: { x: 0, y: 0 },
              strokeWidth: (element.strokeWidth || 1) + 2,
              stroke: '#0066FF',
          }
        : {};

    const hitAreaProps = {
        // Increase hit area for better touch/click detection
        perfectDrawEnabled: false,
        listening: true,
        hitStrokeWidth: 10, // Make the hit area larger than the visual stroke
    };

    const handleClick = (e: any) => {
        e.cancelBubble = true;

        // Special handling for text elements - enable editing on double-click
        if (element.type === 'text' && e.evt.type === 'dblclick') {
            if (typeof onTextEdit === 'function') {
                onTextEdit(element.id);
            }
            return;
        }

        onSelect(element.id);
    };

    // Common props for all shapes
    const commonProps = {
        id: element.id,
        name: `element-${element.id}`,
        onClick: handleClick,
        onTap: handleClick,
        ...hitAreaProps,
        ...(isSelected ? selectionProps : {}),
    };

    switch (element.type) {
        case 'line':
            const lineElement = element as LineElement;
            return (
                <Line
                    points={lineElement.points}
                    stroke={lineElement.stroke}
                    strokeWidth={lineElement.strokeWidth}
                    tension={lineElement.tension}
                    lineCap={lineElement.lineCap}
                    lineJoin={lineElement.lineJoin}
                    globalCompositeOperation={
                        lineElement.globalCompositeOperation
                    }
                    {...commonProps}
                />
            );
        case 'rect':
            const rectElement = element as RectElement;
            return rectElement.image ? (
                <Rect
                    x={rectElement.x}
                    y={rectElement.y}
                    width={rectElement.width}
                    height={rectElement.height}
                    fillPatternImage={rectElement.image}
                    fillPatternRepeat="no-repeat"
                    {...commonProps}
                />
            ) : (
                <Rect
                    x={rectElement.x}
                    y={rectElement.y}
                    width={rectElement.width}
                    height={rectElement.height}
                    fill={rectElement.fill}
                    {...commonProps}
                />
            );
        case 'rectangle':
            const rectangleElement = element as RectangleElement;
            return (
                <Rect
                    x={rectangleElement.x}
                    y={rectangleElement.y}
                    width={rectangleElement.width}
                    height={rectangleElement.height}
                    fill={rectangleElement.fill}
                    stroke={rectangleElement.stroke}
                    strokeWidth={rectangleElement.strokeWidth}
                    {...commonProps}
                />
            );
        case 'circle':
            const circleElement = element as CircleElement;
            return (
                <Circle
                    x={circleElement.x}
                    y={circleElement.y}
                    radius={circleElement.radius}
                    fill={circleElement.fill}
                    stroke={circleElement.stroke}
                    strokeWidth={circleElement.strokeWidth}
                    {...commonProps}
                />
            );
        case 'line-shape':
            const lineShapeElement = element as LineShapeElement;
            return (
                <Line
                    points={lineShapeElement.points}
                    stroke={lineShapeElement.stroke}
                    strokeWidth={lineShapeElement.strokeWidth}
                    tension={0}
                    lineCap="round"
                    lineJoin="round"
                    {...commonProps}
                />
            );
        case 'triangle':
            const triangleElement = element as TriangleElement;
            return (
                <RegularPolygon
                    x={triangleElement.x}
                    y={triangleElement.y}
                    sides={3}
                    radius={triangleElement.radius}
                    fill={triangleElement.fill}
                    stroke={triangleElement.stroke}
                    strokeWidth={triangleElement.strokeWidth}
                    {...commonProps}
                />
            );
        case 'text':
            const textElement = element as TextElement;
            return (
                <Text
                    x={textElement.x}
                    y={textElement.y}
                    text={textElement.text}
                    fontSize={textElement.fontSize}
                    fontFamily={textElement.fontFamily}
                    fill={textElement.fill}
                    width={textElement.width}
                    height={textElement.height}
                    rotation={textElement.rotation || 0}
                    onDblClick={e => {
                        e.cancelBubble = true;
                        if (typeof onTextEdit === 'function') {
                            onTextEdit(element.id);
                        }
                    }}
                    onDblTap={e => {
                        e.cancelBubble = true;
                        if (typeof onTextEdit === 'function') {
                            onTextEdit(element.id);
                        }
                    }}
                    {...commonProps}
                    {...commonProps}
                />
            );
        default:
            return null;
    }
};

export default ElementRenderer;
