import { Template, Canvas } from '../entities/index.js';
import { AppDataSource } from '../config/index.js';
import { TemplateResponseDto, CreateTemplateDto, CreateCanvasFromTemplateDto, CanvasResponseDto } from '../types/index.js';
import { defaultTemplates, TemplateDefinition } from '../types/defaultTemplates.js';

export const TEMPLATE_ERROR_MESSAGES = {
    TEMPLATE_NOT_FOUND: 'Template not found',
    CANVAS_NOT_FOUND: 'Canvas not found',
    UNAUTHORIZED: 'You are not authorized to access this resource',
    INVALID_INPUT: 'Invalid input data',
};

export class TemplateService {
    private templateRepository = AppDataSource.getRepository(Template);
    private canvasRepository = AppDataSource.getRepository(Canvas);

    async getDefaultTemplates(): Promise<TemplateDefinition[]> {
        return defaultTemplates;
    }

    async createTemplateFromCanvas(canvasId: string, userId: string, data: CreateTemplateDto): Promise<TemplateResponseDto> {
        const canvas = await this.canvasRepository.findOne({
            where: { id: canvasId },
        });

        if (!canvas) {
            throw new Error(TEMPLATE_ERROR_MESSAGES.CANVAS_NOT_FOUND);
        }

        if (canvas.userId !== userId) {
            throw new Error(TEMPLATE_ERROR_MESSAGES.UNAUTHORIZED);
        }

        const template = this.templateRepository.create({
            name: data.name,
            description: data.description || null,
            width: canvas.width,
            height: canvas.height,
            backgroundColor: canvas.backgroundColor,
            layers: canvas.layers,
            elementsByLayer: canvas.elementsByLayer,
            thumbnail: canvas.thumbnail || null,
            createdBy: userId,
        });

        const savedTemplate = await this.templateRepository.save(template);
        return this.mapToResponseDto(savedTemplate);
    }

    async getUserTemplates(userId: string): Promise<TemplateResponseDto[]> {
        const templates = await this.templateRepository.find({
            where: { createdBy: userId },
            order: { updatedAt: 'DESC' },
        });

        return templates.map(template => this.mapToResponseDto(template));
    }

    async getTemplate(id: string, userId: string): Promise<TemplateResponseDto> {
        const template = await this.templateRepository.findOne({
            where: { id },
        });

        if (!template) {
            throw new Error(TEMPLATE_ERROR_MESSAGES.TEMPLATE_NOT_FOUND);
        }

        if (template.createdBy !== userId) {
            throw new Error(TEMPLATE_ERROR_MESSAGES.UNAUTHORIZED);
        }

        return this.mapToResponseDto(template);
    }

    async createCanvasFromTemplate(templateId: string, userId: string, data: CreateCanvasFromTemplateDto): Promise<CanvasResponseDto> {
        const template = await this.templateRepository.findOne({
            where: { id: templateId },
        });

        if (!template) {
            throw new Error(TEMPLATE_ERROR_MESSAGES.TEMPLATE_NOT_FOUND);
        }

        if (template.createdBy !== userId) {
            throw new Error(TEMPLATE_ERROR_MESSAGES.UNAUTHORIZED);
        }

        const canvas = this.canvasRepository.create({
            name: data.name,
            description: data.description || null,
            width: template.width,
            height: template.height,
            backgroundColor: template.backgroundColor,
            layers: template.layers,
            elementsByLayer: template.elementsByLayer,
            thumbnail: template.thumbnail || null,
            userId: userId,
        });

        const savedCanvas = await this.canvasRepository.save(canvas);
        return this.mapCanvasToResponseDto(savedCanvas);
    }

    async deleteTemplate(id: string, userId: string): Promise<void> {
        const template = await this.templateRepository.findOne({
            where: { id },
        });

        if (!template) {
            throw new Error(TEMPLATE_ERROR_MESSAGES.TEMPLATE_NOT_FOUND);
        }

        if (template.createdBy !== userId) {
            throw new Error(TEMPLATE_ERROR_MESSAGES.UNAUTHORIZED);
        }

        await this.templateRepository.remove(template);
    }

    private mapToResponseDto(template: Template): TemplateResponseDto {
        return {
            id: template.id,
            name: template.name,
            description: template.description ?? null,
            width: template.width,
            height: template.height,
            backgroundColor: template.backgroundColor,
            layers: template.layers,
            elementsByLayer: template.elementsByLayer,
            thumbnail: template.thumbnail ?? null,
            createdBy: template.createdBy,
            createdAt: template.createdAt,
            updatedAt: template.updatedAt,
        };
    }

    private mapCanvasToResponseDto(canvas: Canvas): CanvasResponseDto {
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
            createdAt: canvas.createdAt,
            updatedAt: canvas.updatedAt,
        };
    }
}
