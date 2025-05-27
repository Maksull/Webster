export interface Template {
    id: string;
    name: string;
    description: string | null;
    width: number;
    height: number;
    backgroundColor: string;
    layers: any[];
    elementsByLayer: Record<string, any[]>;
    thumbnail: string | null;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
