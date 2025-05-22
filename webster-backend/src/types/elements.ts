export interface DrawingLayer {
    id: string;
    name: string;
    visible: boolean;
    locked: boolean;
    opacity: number;
}

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
}

export interface RectElement {
    id: string;
    type: 'rect';
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    layerId: string;
}

export interface CircleElement {
    id: string;
    type: 'circle';
    x: number;
    y: number;
    radius: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    layerId: string;
}

export interface LineShapeElement {
    id: string;
    type: 'line-shape';
    points: number[];
    stroke: string;
    strokeWidth: number;
    layerId: string;
}

export interface RectangleElement {
    id: string;
    type: 'rectangle';
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    layerId: string;
}

export interface TriangleElement {
    id: string;
    type: 'triangle';
    x: number;
    y: number;
    sides: number;
    radius: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    layerId: string;
}

export interface TextElement {
    id: string;
    type: 'text';
    x: number;
    y: number;
    text: string;
    fontSize: number;
    fontFamily: string;
    fill: string;
    width?: number;
    height?: number;
    rotation?: number;
    layerId: string;
    opacity?: number;
}

export interface ImageElement {
    id: string;
    type: 'image';
    x: number;
    y: number;
    width: number;
    height: number;
    src: string; // base64 data URL
    originalWidth: number;
    originalHeight: number;
    rotation?: number;
    layerId: string;
    opacity?: number;
}

export type DrawingElement = LineElement | RectElement | CircleElement | LineShapeElement | RectangleElement | TriangleElement | TextElement | ImageElement;
