export interface LineElement {
    id: string;
    type: 'line';
    points: number[];
    stroke: string;
    strokeWidth: number;
    tension: number;
    lineCap: 'round' | 'butt' | 'square';
    lineJoin: 'round' | 'bevel' | 'miter';
    globalCompositeOperation: 'source-over' | 'destination-out';
    layerId: string;
    opacity?: number;
    dash?: number[];
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
}

export interface CurveElement {
    id: string;
    type: 'curve';
    points: number[];
    stroke: string;
    strokeWidth: number;
    layerId: string;
    opacity?: number;
    tension: number; // High tension for smooth curves
    lineCap: 'round' | 'butt' | 'square';
    lineJoin: 'round' | 'bevel' | 'miter';
    closed?: boolean; // Whether the curve is closed (connects back to start)
}

export interface ArrowElement {
    id: string;
    type: 'arrow';
    points: number[];
    stroke: string;
    strokeWidth: number;
    fill?: string;
    layerId: string;
    pointerLength?: number;
    pointerWidth?: number;
    tension?: number;
    lineCap?: CanvasLineCap;
    lineJoin?: CanvasLineJoin;
    opacity: number;
}

export interface RectElement {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    id: string;
    type: 'rect';
    image?: HTMLImageElement;
    layerId: string;
    opacity: number;
}

export interface CircleElement {
    x: number;
    y: number;
    radius: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    id: string;
    type: 'circle';
    layerId: string;
    opacity: number;
}

export interface LineShapeElement {
    points: number[];
    stroke: string;
    strokeWidth: number;
    id: string;
    type: 'line-shape';
    layerId: string;
    opacity: number;
}

export interface RectangleElement {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    id: string;
    type: 'rectangle';
    layerId: string;
    opacity: number;
}

export interface TriangleElement {
    x: number;
    y: number;
    sides: number;
    radius: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    id: string;
    type: 'triangle';
    layerId: string;
    opacity: number;
}

export interface TextElement {
    x: number;
    y: number;
    text: string;
    fontSize: number;
    fontFamily: string;
    fill: string;
    id: string;
    type: 'text';
    layerId: string;
    width?: number;
    height?: number;
    rotation?: number;
}

export interface ImageElement {
    id: string;
    type: 'image';
    x: number;
    y: number;
    width: number;
    height: number;
    src: string; // base64 data URL or image URL
    originalWidth: number;
    originalHeight: number;
    rotation?: number;
    opacity?: number;
    layerId: string;
    scaleX?: number;
    scaleY?: number;
    offsetX?: number;
    offsetY?: number;
    skewX?: number;
    skewY?: number;
}

export type DrawingElement =
    | LineElement
    | ArrowElement
    | RectElement
    | CircleElement
    | LineShapeElement
    | RectangleElement
    | TriangleElement
    | ImageElement
    | TextElement
    | CurveElement;

export interface Resolution {
    name: string;
    width: number;
    height: number;
}

export type ToolType =
    | 'pencil'
    | 'eraser'
    | 'brush'
    | 'marker'
    | 'pen'
    | 'bucket'
    | 'rectangle'
    | 'circle'
    | 'line'
    | 'curve'
    | 'arrow'
    | 'triangle'
    | 'select'
    | 'image'
    | 'text';

export const POPULAR_RESOLUTIONS: Resolution[] = [
    { name: 'HD (16:9)', width: 1280, height: 720 },
    { name: 'Full HD', width: 1920, height: 1080 },
    { name: 'Square', width: 1080, height: 1080 },
    { name: 'Instagram Post', width: 1080, height: 1350 },
    { name: 'Instagram Story', width: 1080, height: 1920 },
    { name: 'Twitter Post', width: 1200, height: 675 },
    { name: 'Facebook Post', width: 1200, height: 630 },
];
