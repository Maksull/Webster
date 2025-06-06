import { DrawingLayer } from './layers';
import { DrawingElement } from './elements';

export interface Canvas {
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
