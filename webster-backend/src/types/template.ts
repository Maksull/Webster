import { DrawingLayer, DrawingElement } from './elements.js';

export interface CreateTemplateDto {
    name: string;
    description?: string | null;
}

export interface CreateCanvasFromTemplateDto {
    name: string;
    description?: string | null;
}

export interface TemplateResponseDto {
    id: string;
    name: string;
    description: string | null;
    width: number;
    height: number;
    backgroundColor: string;
    layers: DrawingLayer[];
    elementsByLayer: Record<string, DrawingElement[]>;
    thumbnail: string | null;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
