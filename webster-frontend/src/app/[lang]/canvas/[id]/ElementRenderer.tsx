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
    onTextEdit,
    onSelect,
}) => {
    const selectionProps = isSelected
        ? {
              shadowColor: '#0066FF',
              shadowBlur: 10,
              shadowOpacity: 0.6,
              shadowOffset: { x: 0, y: 0 },
              strokeWidth: (element.strokeWidth || 1) + 1,
              stroke: '#0066FF',
          }
        : {};

    const hitAreaProps = {
        // Increase hit area for better touch/click detection
        perfectDrawEnabled: true,
        listening: true,
        hitStrokeWidth: 40, // Make the hit area larger than the visual stroke
    };

    // Common props for all shapes
    const commonProps = {
        id: element.id,
        name: `element-${element.id}`,
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

            // Calculate text dimensions with padding for hit area
            const textWidth =
                textElement.width ||
                (textElement.text?.length * textElement.fontSize) / 2 ||
                20;
            const textHeight = textElement.height || textElement.fontSize || 20;
            const padding = 10;

            return (
                <>
                    {/* Invisible hit area for better interaction */}
                    <Rect
                        x={textElement.x - padding}
                        y={textElement.y - padding}
                        width={textWidth + padding * 2}
                        height={textHeight + padding * 2}
                        stroke={isSelected ? '#0066FF' : 'black'}
                        strokeWidth={1}
                        opacity={0.3}
                        fill="transparent"
                        // Important: Use the same ID as the text element
                        id={element.id}
                        name={`element-${element.id}`}
                        onClick={e => {
                            e.cancelBubble = true;
                            onSelect(element.id);
                        }}
                        onMouseDown={e => {
                            // Don't cancel bubble here - let it propagate for drag detection
                            onSelect(element.id);
                        }}
                        onDblClick={e => {
                            e.cancelBubble = true;
                            console.log('Text hit area double clicked');
                            onTextEdit && onTextEdit(element.id);
                        }}
                        onDblTap={e => {
                            e.cancelBubble = true;
                            console.log('Text hit area double tapped');
                            onTextEdit && onTextEdit(element.id);
                        }}
                        // Apply common props but override some behaviors
                        perfectDrawEnabled={false}
                        listening={true}
                        hitStrokeWidth={20}
                        {...(isSelected ? selectionProps : {})}
                    />
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
                        // Use the same ID as the hit area
                        id={element.id}
                        name={`element-${element.id}`}
                        onClick={e => {
                            e.cancelBubble = true;
                            onSelect(element.id);
                        }}
                        onMouseDown={e => {
                            // Don't cancel bubble here - let it propagate for drag detection
                            onSelect(element.id);
                        }}
                        onDblClick={e => {
                            e.cancelBubble = true;
                            console.log('Text element double clicked');
                            onTextEdit && onTextEdit(element.id);
                        }}
                        onDblTap={e => {
                            e.cancelBubble = true;
                            console.log('Text element double tapped');
                            onTextEdit && onTextEdit(element.id);
                        }}
                        {...commonProps}
                    />
                </>
            );
        default:
            return null;
    }
};

export default ElementRenderer;
