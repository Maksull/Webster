import { useEffect, RefObject } from 'react';
import { Stage } from 'konva/lib/Stage';
import { Node } from 'konva/lib/Node';
import { DrawingElement } from '@/types/elements';
import { ToolType } from '@/types/elements';

export const useEraserCursor = (
    stageRef: RefObject<Stage | null>,
    tool: ToolType,
    elementsByLayer: Map<string, DrawingElement[]>,
) => {
    useEffect(() => {
        const stage = stageRef.current;
        if (!stage || tool !== 'eraser') return;

        const handleMouseMove = () => {
            const pos = stage.getPointerPosition();
            if (!pos) return;

            // Check if mouse is over any erasable object
            let canErase = false;

            // Get shapes at current position
            const shapes = stage.getAllIntersections(pos);
            const targetShapes = shapes.filter(
                (shape: Node) =>
                    shape !== stage &&
                    shape.getClassName() !== 'Stage' &&
                    (shape.getClassName() === 'Rect' ||
                        shape.getClassName() === 'Circle' ||
                        shape.getClassName() === 'Line' ||
                        shape.getClassName() === 'Arrow' ||
                        shape.getClassName() === 'RegularPolygon' ||
                        shape.getClassName() === 'Text' ||
                        shape.getClassName() === 'Image'),
            );

            if (targetShapes.length > 0) {
                // Check if any of these shapes correspond to actual elements
                for (const shape of targetShapes) {
                    const shapeId = shape.attrs.id;
                    if (shapeId) {
                        elementsByLayer.forEach(
                            (elements: DrawingElement[]) => {
                                const element = elements.find(
                                    (el: DrawingElement) => el.id === shapeId,
                                );
                                if (element) {
                                    canErase = true;
                                }
                            },
                        );
                        if (canErase) break;
                    }
                }
            }

            // Also check position-based detection for elements without proper IDs
            if (!canErase) {
                elementsByLayer.forEach((elements: DrawingElement[]) => {
                    elements.forEach((element: DrawingElement) => {
                        if (isPointInElement(pos.x, pos.y, element)) {
                            canErase = true;
                        }
                    });
                });
            }

            // Update cursor class
            const container = stage.container();
            container.classList.toggle('eraser-mode', true);
            container.classList.toggle('can-erase', canErase);
        };

        const handleMouseLeave = () => {
            const container = stage.container();
            container.classList.remove('eraser-mode', 'can-erase');
        };

        // Add event listeners
        stage.on('mousemove', handleMouseMove);
        stage.on('mouseleave', handleMouseLeave);

        // Set initial cursor
        const container = stage.container();
        container.classList.add('eraser-mode');

        return () => {
            if (stage) {
                stage.off('mousemove', handleMouseMove);
                stage.off('mouseleave', handleMouseLeave);
                const container = stage.container();
                container.classList.remove('eraser-mode', 'can-erase');
            }
        };
    }, [tool, elementsByLayer, stageRef]);

    // Helper function - you'll need to import this from your existing code
    const isPointInElement = (
        x: number,
        y: number,
        element: DrawingElement,
    ): boolean => {
        switch (element.type) {
            case 'rectangle':
            case 'rect': {
                const { x: ex, y: ey, width, height } = element;
                return (
                    x >= ex && x <= ex + width && y >= ey && y <= ey + height
                );
            }
            case 'circle': {
                const { x: ex, y: ey, radius } = element;
                const dx = x - ex;
                const dy = y - ey;
                return dx * dx + dy * dy <= radius * radius;
            }
            case 'triangle': {
                const { x: ex, y: ey, radius } = element;
                const dx = x - ex;
                const dy = y - ey;
                return dx * dx + dy * dy <= radius * radius;
            }
            case 'image': {
                const { x: ex, y: ey, width, height } = element;
                return (
                    x >= ex && x <= ex + width && y >= ey && y <= ey + height
                );
            }
            case 'line':
            case 'line-shape':
            case 'arrow': {
                const { points } = element;
                for (let i = 0; i < points.length - 2; i += 2) {
                    const x1 = points[i];
                    const y1 = points[i + 1];
                    const x2 = points[i + 2];
                    const y2 = points[i + 3];
                    const distToSegment = distanceToLineSegment(
                        x1,
                        y1,
                        x2,
                        y2,
                        x,
                        y,
                    );
                    if (distToSegment <= 5) {
                        return true;
                    }
                }
                return false;
            }
            case 'text': {
                const { x: ex, y: ey, width, height, fontSize, text } = element;
                const textWidth = width || (text?.length * fontSize) / 2 || 0;
                const textHeight = height || fontSize || 0;
                const padding = 10;
                return (
                    x >= ex - padding &&
                    x <= ex + textWidth + padding &&
                    y >= ey - padding &&
                    y <= ey + textHeight + padding
                );
            }
            default:
                return false;
        }
    };

    const distanceToLineSegment = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        x: number,
        y: number,
    ): number => {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq !== 0) {
            param = dot / len_sq;
        }

        let xx: number, yy: number;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = x - xx;
        const dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    };
};
