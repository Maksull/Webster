import { Canvas } from '@/entities/index.js';
import { AppDataSource } from '../config/index.js';
import { CanvasResponseDto, CreateCanvasDto, UpdateCanvasDto } from '@/types/index.js';

export const ERROR_MESSAGES = {
    CANVAS_NOT_FOUND: 'Canvas not found',
    UNAUTHORIZED: 'You are not authorized to access this canvas',
    INVALID_INPUT: 'Invalid input data',
};

export class CanvasService {
    private canvasRepository = AppDataSource.getRepository(Canvas);

    async createCanvas(userId: string, data: CreateCanvasDto): Promise<CanvasResponseDto> {
        const canvas = this.canvasRepository.create({
            ...data,
            userId,
            lastModified: new Date(),
        });

        const savedCanvas = await this.canvasRepository.save(canvas);
        return this.mapToResponseDto(savedCanvas);
    }

    async getUserCanvases(userId: string): Promise<CanvasResponseDto[]> {
        const canvases = await this.canvasRepository.find({
            where: { userId },
            order: { lastModified: 'DESC' },
        });

        return canvases.map(canvas => this.mapToResponseDto(canvas));
    }

    async getCanvas(id: string, userId?: string): Promise<CanvasResponseDto> {
        const canvas = await this.canvasRepository.findOne({
            where: { id },
        });

        if (!canvas) {
            throw new Error(ERROR_MESSAGES.CANVAS_NOT_FOUND);
        }

        // Check if the user is authorized to view this canvas
        if (!canvas.isPublic && userId !== canvas.userId) {
            throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
        }

        return this.mapToResponseDto(canvas);
    }

    async updateCanvas(id: string, userId: string, data: UpdateCanvasDto): Promise<CanvasResponseDto> {
        const canvas = await this.canvasRepository.findOne({
            where: { id },
        });

        if (!canvas) {
            throw new Error(ERROR_MESSAGES.CANVAS_NOT_FOUND);
        }

        if (canvas.userId !== userId) {
            throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
        }

        const updatedCanvas = {
            ...canvas,
            ...data,
            lastModified: new Date(),
        };

        await this.canvasRepository.save(updatedCanvas);
        return this.mapToResponseDto(updatedCanvas);
    }

    async deleteCanvas(id: string, userId: string): Promise<void> {
        const canvas = await this.canvasRepository.findOne({
            where: { id },
        });

        if (!canvas) {
            throw new Error(ERROR_MESSAGES.CANVAS_NOT_FOUND);
        }

        if (canvas.userId !== userId) {
            throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
        }

        await this.canvasRepository.remove(canvas);
    }

    async getPublicCanvases(): Promise<CanvasResponseDto[]> {
        const canvases = await this.canvasRepository.find({
            where: { isPublic: true },
            order: { createdAt: 'DESC' },
        });

        return canvases.map(canvas => this.mapToResponseDto(canvas));
    }

    // Helper method to convert entity to DTO
    private mapToResponseDto(canvas: Canvas): CanvasResponseDto {
        return {
            id: canvas.id,
            name: canvas.name,
            description: canvas.description ?? null,
            width: canvas.width,
            height: canvas.height,
            backgroundColor: canvas.backgroundColor,
            layers: canvas.layers,
            elementsByLayer: canvas.elementsByLayer,
            thumbnail: canvas.thumbnail ?? null,
            userId: canvas.userId,
            isPublic: canvas.isPublic,
            lastModified: canvas.lastModified ?? null,
            createdAt: canvas.createdAt,
            updatedAt: canvas.updatedAt,
        };
    }
}
