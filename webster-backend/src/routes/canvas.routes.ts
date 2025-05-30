import { CanvasController } from '../controllers/index.js';
import { authenticateToken } from '../middlewares/index.js';
import { CreateCanvasDto, UpdateCanvasDto } from '../types/index.js';
import { FastifyInstance, FastifyRequest } from 'fastify';

const createCanvasSchema = {
    body: {
        type: 'object',
        required: ['name', 'width', 'height', 'backgroundColor', 'layers', 'elementsByLayer'],
        properties: {
            name: { type: 'string', minLength: 1, maxLength: 255 },
            description: { type: 'string', nullable: true },
            width: { type: 'integer', minimum: 100 },
            height: { type: 'integer', minimum: 100 },
            backgroundColor: {
                type: 'string',
                pattern: '^(#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})|transparent)$',
            },
            layers: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['id', 'name', 'visible', 'locked', 'opacity'],
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        visible: { type: 'boolean' },
                        locked: { type: 'boolean' },
                        opacity: { type: 'number', minimum: 0, maximum: 1 },
                    },
                },
            },
            elementsByLayer: {
                type: 'object',
                additionalProperties: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['id', 'type', 'layerId'],
                        properties: {
                            id: { type: 'string' },
                            type: {
                                type: 'string',
                                enum: ['line', 'rect', 'circle', 'line-shape', 'rectangle', 'triangle', 'text', 'image'],
                            },
                            layerId: { type: 'string' },
                            x: { type: 'number' },
                            y: { type: 'number' },
                            width: { type: 'number' },
                            height: { type: 'number' },
                            fill: { type: 'string' },
                            stroke: { type: 'string' },
                            strokeWidth: { type: 'number' },
                            opacity: { type: 'number', minimum: 0, maximum: 1 },
                            rotation: { type: 'number' },
                            src: { type: 'string' },
                            originalWidth: { type: 'number' },
                            originalHeight: { type: 'number' },
                            text: { type: 'string' },
                            fontSize: { type: 'number' },
                            fontFamily: { type: 'string' },
                            points: {
                                type: 'array',
                                items: { type: 'number' },
                            },
                            tension: { type: 'number' },
                            lineCap: { type: 'string' },
                            lineJoin: { type: 'string' },
                            globalCompositeOperation: { type: 'string' },
                            radius: { type: 'number' },
                            sides: { type: 'number' },
                            image: { type: 'object' },
                        },
                        additionalProperties: true,
                    },
                },
            },
            thumbnail: { type: 'string' },
        },
    },
} as const;

const updateCanvasSchema = {
    body: {
        type: 'object',
        properties: {
            name: { type: 'string', minLength: 1, maxLength: 255 },
            description: { type: 'string', nullable: true },
            width: { type: 'integer', minimum: 100 },
            height: { type: 'integer', minimum: 100 },
            backgroundColor: {
                type: 'string',
                pattern: '^(#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})|transparent)$',
            },
            layers: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['id', 'name', 'visible', 'locked', 'opacity'],
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        visible: { type: 'boolean' },
                        locked: { type: 'boolean' },
                        opacity: { type: 'number', minimum: 0, maximum: 1 },
                    },
                },
            },
            elementsByLayer: {
                type: 'object',
                additionalProperties: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['id', 'type', 'layerId'],
                        properties: {
                            id: { type: 'string' },
                            type: {
                                type: 'string',
                                enum: ['line', 'rect', 'circle', 'line-shape', 'rectangle', 'triangle', 'text', 'image', 'arrow'],
                            },
                            layerId: { type: 'string' },
                            x: { type: 'number' },
                            y: { type: 'number' },
                            width: { type: 'number' },
                            height: { type: 'number' },
                            fill: { type: 'string' },
                            stroke: { type: 'string' },
                            strokeWidth: { type: 'number' },
                            opacity: { type: 'number', minimum: 0, maximum: 1 },
                            rotation: { type: 'number' },
                            src: { type: 'string' },
                            originalWidth: { type: 'number' },
                            originalHeight: { type: 'number' },
                            text: { type: 'string' },
                            fontSize: { type: 'number' },
                            fontFamily: { type: 'string' },
                            points: {
                                type: 'array',
                                items: { type: 'number' },
                            },
                            tension: { type: 'number' },
                            lineCap: { type: 'string' },
                            lineJoin: { type: 'string' },
                            globalCompositeOperation: { type: 'string' },
                            radius: { type: 'number' },
                            sides: { type: 'number' },
                            image: { type: 'object' },
                        },
                        additionalProperties: true,
                    },
                },
            },
            thumbnail: { type: 'string' },
        },
        additionalProperties: false,
    },
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
} as const;

const getCanvasSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
} as const;

export async function canvasRoutes(app: FastifyInstance) {
    const canvasController = new CanvasController();

    // Create a new canvas
    app.post(
        '/canvases',
        {
            schema: createCanvasSchema,
            preHandler: [authenticateToken],
        },
        async (request, reply) => {
            // Here we cast the request as needed
            return await canvasController.createCanvas(request as FastifyRequest<{ Body: CreateCanvasDto }>, reply);
        },
    );

    // Get all canvases for the authenticated user
    app.get(
        '/canvases',
        {
            preHandler: [authenticateToken],
        },
        async (request, reply) => {
            return await canvasController.getUserCanvases(request, reply);
        },
    );

    // Get all public canvases
    app.get('/canvases/public', {}, async (request, reply) => {
        return await canvasController.getPublicCanvases(request, reply);
    });

    // Get a specific canvas by ID
    app.get(
        '/canvases/:id',
        {
            schema: getCanvasSchema,
            preHandler: [authenticateToken],
        },
        async (request, reply) => {
            return await canvasController.getCanvas(request as FastifyRequest<{ Params: { id: string } }>, reply);
        },
    );

    // Update a canvas
    app.put(
        '/canvases/:id',
        {
            schema: updateCanvasSchema,
            preHandler: [authenticateToken],
        },
        async (request, reply) => {
            return await canvasController.updateCanvas(request as FastifyRequest<{ Params: { id: string }; Body: UpdateCanvasDto }>, reply);
        },
    );

    // Delete a canvas
    app.delete(
        '/canvases/:id',
        {
            schema: getCanvasSchema,
            preHandler: [authenticateToken],
        },
        async (request, reply) => {
            return await canvasController.deleteCanvas(request as FastifyRequest<{ Params: { id: string } }>, reply);
        },
    );
}
