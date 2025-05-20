import { DrawingElement } from './elements';

export interface DrawingLayer {
    id: string;
    name: string;
    visible: boolean;
    locked: boolean;
    opacity: number;
}

export interface DrawingState {
    layers: DrawingLayer[];
    elementsByLayer: Map<string, DrawingElement[]>;
}

export interface HistoryRecord {
    layers: DrawingLayer[];
    elementsByLayer: Map<string, DrawingElement[]>;
    backgroundColor: string;
}
