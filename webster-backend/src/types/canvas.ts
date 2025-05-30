import { DrawingLayer, DrawingElement } from './elements.js';

export interface CreateCanvasDto {
    name: string;
    description?: string | null;
    width: number;
    height: number;
    backgroundColor: string;
    layers: DrawingLayer[];
    elementsByLayer: Record<string, DrawingElement[]>;
}

export interface UpdateCanvasDto {
    name?: string;
    description?: string | null;
    width?: number;
    height?: number;
    backgroundColor?: string;
    layers?: DrawingLayer[];
    elementsByLayer?: Record<string, DrawingElement[]>;
}

export interface CanvasResponseDto {
    id: string;
    name: string;
    description?: string | null;
    width: number;
    height: number;
    backgroundColor: string;
    layers: DrawingLayer[];
    elementsByLayer: Record<string, DrawingElement[]>;
    thumbnail?: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
