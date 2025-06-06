import { DrawingElement } from './elements';
import { DrawingLayer } from './layers';

export interface Template {
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
