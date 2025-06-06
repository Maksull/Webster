import { CanvasService, ERROR_MESSAGES } from '../services/canvas.service.js';
import { CreateCanvasDto, UpdateCanvasDto } from '../types/index.js';
import { FastifyRequest, FastifyReply } from 'fastify';

export class CanvasController {
    private canvasService: CanvasService;

    constructor() {
        this.canvasService = new CanvasService();
    }

    async createCanvas(request: FastifyRequest<{ Body: CreateCanvasDto }>, reply: FastifyReply) {
        try {
            const userId = request.user?.userId;

            if (!userId) {
                return reply.status(401).send({
                    status: 'error',
                    message: 'Authentication required',
                });
            }

            const canvas = await this.canvasService.createCanvas(userId, request.body);

            return reply.status(201).send({
                status: 'success',
                data: { canvas },
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                status: 'error',
                message: 'Internal server error',
            });
        }
    }

    async getUserCanvases(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = request.user?.userId;

            if (!userId) {
                return reply.status(401).send({
                    status: 'error',
                    message: 'Authentication required',
                });
            }

            const canvases = await this.canvasService.getUserCanvases(userId);

            return reply.status(200).send({
                status: 'success',
                data: { canvases },
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                status: 'error',
                message: 'Internal server error',
            });
        }
    }

    async getCanvas(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            const userId = request.user?.userId;

            const canvas = await this.canvasService.getCanvas(id, userId);

            return reply.status(200).send({
                status: 'success',
                data: { canvas },
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === ERROR_MESSAGES.CANVAS_NOT_FOUND) {
                    return reply.status(404).send({
                        status: 'error',
                        message: 'Canvas not found',
                    });
                }

                if (error.message === ERROR_MESSAGES.UNAUTHORIZED) {
                    return reply.status(403).send({
                        status: 'error',
                        message: 'You are not authorized to view this canvas',
                    });
                }
            }

            request.log.error(error);
            return reply.status(500).send({
                status: 'error',
                message: 'Internal server error',
            });
        }
    }

    async updateCanvas(request: FastifyRequest<{ Params: { id: string }; Body: UpdateCanvasDto }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            const userId = request.user?.userId;

            if (!userId) {
                return reply.status(401).send({
                    status: 'error',
                    message: 'Authentication required',
                });
            }

            const canvas = await this.canvasService.updateCanvas(id, userId, request.body);

            return reply.status(200).send({
                status: 'success',
                data: { canvas },
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === ERROR_MESSAGES.CANVAS_NOT_FOUND) {
                    return reply.status(404).send({
                        status: 'error',
                        message: 'Canvas not found',
                    });
                }

                if (error.message === ERROR_MESSAGES.UNAUTHORIZED) {
                    return reply.status(403).send({
                        status: 'error',
                        message: 'You are not authorized to update this canvas',
                    });
                }
            }

            request.log.error(error);
            return reply.status(500).send({
                status: 'error',
                message: 'Internal server error',
            });
        }
    }

    async deleteCanvas(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            const userId = request.user?.userId;

            if (!userId) {
                return reply.status(401).send({
                    status: 'error',
                    message: 'Authentication required',
                });
            }

            await this.canvasService.deleteCanvas(id, userId);

            return reply.status(200).send({
                status: 'success',
                message: 'Canvas deleted successfully',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === ERROR_MESSAGES.CANVAS_NOT_FOUND) {
                    return reply.status(404).send({
                        status: 'error',
                        message: 'Canvas not found',
                    });
                }

                if (error.message === ERROR_MESSAGES.UNAUTHORIZED) {
                    return reply.status(403).send({
                        status: 'error',
                        message: 'You are not authorized to delete this canvas',
                    });
                }
            }

            request.log.error(error);
            return reply.status(500).send({
                status: 'error',
                message: 'Internal server error',
            });
        }
    }

    async getPublicCanvases(request: FastifyRequest, reply: FastifyReply) {
        try {
            const canvases = await this.canvasService.getPublicCanvases();

            return reply.status(200).send({
                status: 'success',
                data: { canvases },
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                status: 'error',
                message: 'Internal server error',
            });
        }
    }
}
