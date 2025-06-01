'use client';

import React, { useState, useEffect } from 'react';
import {
    Line,
    Rect,
    Circle,
    RegularPolygon,
    Text,
    Image as KonvaImage,
    Arrow,
    Group,
} from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { useDrawing } from '@/contexts';
import {
    LineElement,
    RectElement,
    CircleElement,
    LineShapeElement,
    RectangleElement,
    TriangleElement,
    TextElement,
    ArrowElement,
    ImageElement,
    CurveElement,
    DrawingElement,
} from '@/types/elements';

interface ElementRendererProps {
    element: DrawingElement;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onTextEdit?: (id: string) => void;
    onImageResizeEnd?: () => void;
}

const ElementRenderer: React.FC<ElementRendererProps> = ({
    element,
    isSelected,
    onTextEdit,
    onSelect,
    onImageResizeEnd,
}) => {
    const { hoveredElementId } = useDrawing();
    const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
    const isHovered = hoveredElementId === element.id;

    useEffect(() => {
        if (element.type === 'image') {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                setImageObj(img);
            };
            img.onerror = error => {
                console.error('Failed to load image:', error);
            };
            img.src = element.src;
        }
    }, [element.type, element.type === 'image' ? element.src : '']);

    const selectionProps = isSelected
        ? {
              shadowColor: '#0066FF',
              shadowBlur: 10,
              shadowOpacity: 0.6,
              shadowOffset: { x: 0, y: 0 },
              strokeWidth:
                  'strokeWidth' in element && element.strokeWidth !== 0
                      ? (element.strokeWidth || 1) + 1
                      : 2,
              stroke: '#0066FF',
          }
        : {};

    const hoverProps =
        isHovered && !isSelected
            ? {
                  shadowColor: '#FFA500',
                  shadowBlur: 8,
                  shadowOpacity: 0.8,
                  shadowOffset: { x: 0, y: 0 },
                  strokeWidth:
                      'strokeWidth' in element && element.strokeWidth !== 0
                          ? (element.strokeWidth || 1) + 1
                          : 2,
                  stroke: '#FFA500',
              }
            : {};

    const hitAreaProps = {
        perfectDrawEnabled: true,
        listening: true,
        hitStrokeWidth: 40,
    };

    const commonProps = {
        id: element.id,
        name: `element-${element.id}`,
        ...hitAreaProps,
        ...(isSelected ? selectionProps : isHovered ? hoverProps : {}),
    };

    useEffect(() => {
        if (element.type === 'image' && isSelected) {
            const handleGlobalMouseUp = () => {
                if (onImageResizeEnd) {
                    onImageResizeEnd();
                }
            };

            document.addEventListener('mouseup', handleGlobalMouseUp);
            document.addEventListener('touchend', handleGlobalMouseUp);

            return () => {
                document.removeEventListener('mouseup', handleGlobalMouseUp);
                document.removeEventListener('touchend', handleGlobalMouseUp);
            };
        }
    }, [element.type, isSelected, onImageResizeEnd]);

    const handleClick = (e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
        onSelect(element.id);
    };

    const handleMouseDown = () => {
        onSelect(element.id);
    };

    const handleDoubleClick = (e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
        console.log('Element double clicked');
        if (onTextEdit) {
            onTextEdit(element.id);
        }
    };

    const handleDoubleTab = (e: KonvaEventObject<TouchEvent>) => {
        e.cancelBubble = true;
        console.log('Element double tapped');
        if (onTextEdit) {
            onTextEdit(element.id);
        }
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
                    opacity={lineElement.opacity}
                    dash={lineElement.dash}
                    shadowColor={lineElement.shadowColor}
                    shadowBlur={lineElement.shadowBlur}
                    shadowOffset={{
                        x: lineElement.shadowOffsetX ?? 0,
                        y: lineElement.shadowOffsetY ?? 0,
                    }}
                    {...commonProps}
                />
            );

        case 'curve':
            const curveElement = element as CurveElement;
            return (
                <Line
                    points={curveElement.points}
                    stroke={curveElement.stroke}
                    strokeWidth={curveElement.strokeWidth}
                    tension={curveElement.tension}
                    lineCap={curveElement.lineCap}
                    lineJoin={curveElement.lineJoin}
                    opacity={curveElement.opacity}
                    closed={curveElement.closed}
                    {...commonProps}
                    onClick={handleClick}
                    onMouseDown={handleMouseDown}
                />
            );

        case 'arrow':
            const arrowElement = element as ArrowElement;
            return (
                <Arrow
                    points={arrowElement.points}
                    stroke={arrowElement.stroke}
                    strokeWidth={arrowElement.strokeWidth}
                    fill={arrowElement.fill}
                    pointerLength={arrowElement.pointerLength || 10}
                    pointerWidth={arrowElement.pointerWidth || 10}
                    tension={arrowElement.tension || 0}
                    lineCap={arrowElement.lineCap || 'round'}
                    lineJoin={arrowElement.lineJoin || 'round'}
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

        case 'image':
            const imageElement = element as ImageElement;
            if (!imageObj) {
                return (
                    <Rect
                        x={imageElement.x}
                        y={imageElement.y}
                        width={imageElement.width}
                        height={imageElement.height}
                        fill="#f0f0f0"
                        stroke="#ccc"
                        strokeWidth={1}
                        opacity={0.8}
                        {...commonProps}
                        onClick={handleClick}
                        onMouseDown={handleMouseDown}
                    />
                );
            }

            return (
                <KonvaImage
                    x={imageElement.x}
                    y={imageElement.y}
                    width={imageElement.width}
                    height={imageElement.height}
                    image={imageObj}
                    rotation={imageElement.rotation || 0}
                    opacity={imageElement.opacity || 1}
                    scaleX={imageElement.scaleX || 1}
                    scaleY={imageElement.scaleY || 1}
                    offsetX={imageElement.offsetX || 0}
                    offsetY={imageElement.offsetY || 0}
                    skewX={imageElement.skewX || 0}
                    skewY={imageElement.skewY || 0}
                    {...commonProps}
                    onClick={handleClick}
                    onMouseDown={handleMouseDown}
                    draggable={false}
                />
            );

        case 'text':
            const textElement = element as TextElement;
            const fontSize = textElement.fontSize || 16;
            const fontFamily = textElement.fontFamily || 'Arial';
            const text = textElement.text || '';
            const lineHeight = 1;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            let textWidth = 20;
            let textHeight = fontSize;

            if (ctx) {
                ctx.font = `${fontSize}px ${fontFamily}`;
                const lines = text.split('\n');
                textWidth = Math.max(
                    ...lines.map(line => ctx.measureText(line).width),
                );
                textHeight = lines.length * fontSize * lineHeight;
            }

            const padding = 10;

            return (
                <Group
                    id={element.id}
                    name={`element-${element.id}`}
                    rotation={textElement.rotation || 0}>
                    {/* Hit area for better selection */}
                    <Rect
                        x={textElement.x - padding}
                        y={textElement.y - padding}
                        width={textWidth + padding * 2}
                        height={textHeight + padding * 2}
                        stroke={
                            isSelected
                                ? '#0066FF'
                                : isHovered
                                  ? '#FFA500'
                                  : 'black'
                        }
                        data-hit-area="true"
                        strokeWidth={0}
                        opacity={0.3}
                        fill="transparent"
                        onClick={handleClick}
                        onMouseDown={handleMouseDown}
                        onDblClick={handleDoubleClick}
                        onDblTap={handleDoubleTab}
                        perfectDrawEnabled={false}
                        listening={true}
                        hitStrokeWidth={20}
                        {...(isSelected
                            ? selectionProps
                            : isHovered
                              ? hoverProps
                              : {})}
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
                        onClick={handleClick}
                        onMouseDown={handleMouseDown}
                        onDblClick={handleDoubleClick}
                        onDblTap={handleDoubleTab}
                        {...commonProps}
                    />
                </Group>
            );

        default:
            return null;
    }
};

export default ElementRenderer;
