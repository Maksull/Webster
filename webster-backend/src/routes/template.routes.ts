import { TemplateController } from '../controllers/template.controller.js';
import { authenticateToken } from '../middlewares/index.js';
import { CreateTemplateDto, CreateCanvasFromTemplateDto } from '../types/index.js';
import { FastifyInstance, FastifyRequest } from 'fastify';

const createTemplateSchema = {
    body: {
        type: 'object',
        required: ['name'],
        properties: {
            name: { type: 'string', minLength: 1, maxLength: 255 },
            description: { type: 'string', nullable: true, maxLength: 500 },
        },
    },
    params: {
        type: 'object',
        required: ['canvasId'],
        properties: {
            canvasId: { type: 'string', format: 'uuid' },
        },
    },
} as const;

const createCanvasFromTemplateSchema = {
    body: {
        type: 'object',
        required: ['name'],
        properties: {
            name: { type: 'string', minLength: 1, maxLength: 255 },
            description: { type: 'string', nullable: true },
        },
    },
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
} as const;

const getTemplateSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
} as const;

export async function templateRoutes(app: FastifyInstance) {
    const templateController = new TemplateController();

    // Get default templates (public endpoint)
    app.get('/templates/defaults', async (request, reply) => {
        return await templateController.getDefaultTemplates(request, reply);
    });

    app.post(
        '/templates/from-canvas/:canvasId',
        {
            schema: createTemplateSchema,
            preHandler: [authenticateToken],
        },
        async (request, reply) => {
            return await templateController.createTemplateFromCanvas(
                request as FastifyRequest<{
                    Params: { canvasId: string };
                    Body: CreateTemplateDto;
                }>,
                reply,
            );
        },
    );

    app.get(
        '/templates',
        {
            preHandler: [authenticateToken],
        },
        async (request, reply) => {
            return await templateController.getUserTemplates(request, reply);
        },
    );

    app.get(
        '/templates/:id',
        {
            schema: getTemplateSchema,
            preHandler: [authenticateToken],
        },
        async (request, reply) => {
            return await templateController.getTemplate(request as FastifyRequest<{ Params: { id: string } }>, reply);
        },
    );

    app.post(
        '/templates/:id/create-canvas',
        {
            schema: createCanvasFromTemplateSchema,
            preHandler: [authenticateToken],
        },
        async (request, reply) => {
            return await templateController.createCanvasFromTemplate(
                request as FastifyRequest<{
                    Params: { id: string };
                    Body: CreateCanvasFromTemplateDto;
                }>,
                reply,
            );
        },
    );

    app.delete(
        '/templates/:id',
        {
            schema: getTemplateSchema,
            preHandler: [authenticateToken],
        },
        async (request, reply) => {
            return await templateController.deleteTemplate(request as FastifyRequest<{ Params: { id: string } }>, reply);
        },
    );
}
