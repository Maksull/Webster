'use client';

import React from 'react';
import { Line, Rect, Circle, RegularPolygon } from 'react-konva';
import {
    LineElement,
    RectElement,
    CircleElement,
    LineShapeElement,
    RectangleElement,
    TriangleElement,
} from '@/types/elements';

interface ElementRendererProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element: any; // Using any because we need to support different element types
}

const ElementRenderer: React.FC<ElementRendererProps> = ({ element }) => {
    switch (element.type) {
        case 'line':
            const lineElement = element as LineElement;
            return (
                <Line
                    key={lineElement.id}
                    points={lineElement.points}
                    stroke={lineElement.stroke}
                    strokeWidth={lineElement.strokeWidth}
                    tension={lineElement.tension}
                    lineCap={lineElement.lineCap}
                    lineJoin={lineElement.lineJoin}
                    globalCompositeOperation={
                        lineElement.globalCompositeOperation
                    }
                />
            );

        case 'rect':
            const rectElement = element as RectElement;
            return rectElement.image ? (
                <Rect
                    key={rectElement.id}
                    x={rectElement.x}
                    y={rectElement.y}
                    width={rectElement.width}
                    height={rectElement.height}
                    fillPatternImage={rectElement.image}
                    fillPatternRepeat="no-repeat"
                />
            ) : (
                <Rect
                    key={rectElement.id}
                    x={rectElement.x}
                    y={rectElement.y}
                    width={rectElement.width}
                    height={rectElement.height}
                    fill={rectElement.fill}
                />
            );

        case 'rectangle':
            const rectangleElement = element as RectangleElement;
            return (
                <Rect
                    key={rectangleElement.id}
                    x={rectangleElement.x}
                    y={rectangleElement.y}
                    width={rectangleElement.width}
                    height={rectangleElement.height}
                    fill={rectangleElement.fill}
                    stroke={rectangleElement.stroke}
                    strokeWidth={rectangleElement.strokeWidth}
                />
            );

        case 'circle':
            const circleElement = element as CircleElement;
            return (
                <Circle
                    key={circleElement.id}
                    x={circleElement.x}
                    y={circleElement.y}
                    radius={circleElement.radius}
                    fill={circleElement.fill}
                    stroke={circleElement.stroke}
                    strokeWidth={circleElement.strokeWidth}
                />
            );

        case 'line-shape':
            const lineShapeElement = element as LineShapeElement;
            return (
                <Line
                    key={lineShapeElement.id}
                    points={lineShapeElement.points}
                    stroke={lineShapeElement.stroke}
                    strokeWidth={lineShapeElement.strokeWidth}
                    tension={0}
                    lineCap="round"
                    lineJoin="round"
                />
            );

        case 'triangle':
            const triangleElement = element as TriangleElement;
            return (
                <RegularPolygon
                    key={triangleElement.id}
                    x={triangleElement.x}
                    y={triangleElement.y}
                    sides={3}
                    radius={triangleElement.radius}
                    fill={triangleElement.fill}
                    stroke={triangleElement.stroke}
                    strokeWidth={triangleElement.strokeWidth}
                />
            );

        default:
            return null;
    }
};

export default ElementRenderer;
