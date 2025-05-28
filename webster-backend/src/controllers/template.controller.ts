import { TemplateService, TEMPLATE_ERROR_MESSAGES } from '../services/template.service.js';
import { CreateTemplateDto, CreateCanvasFromTemplateDto } from '../types/index.js';
import { FastifyRequest, FastifyReply } from 'fastify';

export class TemplateController {
    private templateService: TemplateService;

    constructor() {
        this.templateService = new TemplateService();
    }

    async getDefaultTemplates(request: FastifyRequest, reply: FastifyReply) {
        try {
            const templates = await this.templateService.getDefaultTemplates();
            return reply.status(200).send({
                status: 'success',
                data: { templates },
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                status: 'error',
                message: 'Internal server error',
            });
        }
    }

    async createTemplateFromCanvas(
        request: FastifyRequest<{
            Params: { canvasId: string };
            Body: CreateTemplateDto;
        }>,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user?.userId;
            if (!userId) {
                return reply.status(401).send({
                    status: 'error',
                    message: 'Authentication required',
                });
            }

            const { canvasId } = request.params;
            const template = await this.templateService.createTemplateFromCanvas(canvasId, userId, request.body);

            return reply.status(201).send({
                status: 'success',
                data: { template },
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === TEMPLATE_ERROR_MESSAGES.CANVAS_NOT_FOUND) {
                    return reply.status(404).send({
                        status: 'error',
                        message: 'Canvas not found',
                    });
                }
                if (error.message === TEMPLATE_ERROR_MESSAGES.UNAUTHORIZED) {
                    return reply.status(403).send({
                        status: 'error',
                        message: 'You are not authorized to create a template from this canvas',
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

    async getUserTemplates(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = request.user?.userId;
            if (!userId) {
                return reply.status(401).send({
                    status: 'error',
                    message: 'Authentication required',
                });
            }

            const templates = await this.templateService.getUserTemplates(userId);
            return reply.status(200).send({
                status: 'success',
                data: { templates },
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                status: 'error',
                message: 'Internal server error',
            });
        }
    }

    async getTemplate(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            const userId = request.user?.userId;
            if (!userId) {
                return reply.status(401).send({
                    status: 'error',
                    message: 'Authentication required',
                });
            }

            const template = await this.templateService.getTemplate(id, userId);
            return reply.status(200).send({
                status: 'success',
                data: { template },
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === TEMPLATE_ERROR_MESSAGES.TEMPLATE_NOT_FOUND) {
                    return reply.status(404).send({
                        status: 'error',
                        message: 'Template not found',
                    });
                }
                if (error.message === TEMPLATE_ERROR_MESSAGES.UNAUTHORIZED) {
                    return reply.status(403).send({
                        status: 'error',
                        message: 'You are not authorized to view this template',
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

    async createCanvasFromTemplate(
        request: FastifyRequest<{
            Params: { id: string };
            Body: CreateCanvasFromTemplateDto;
        }>,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user?.userId;
            if (!userId) {
                return reply.status(401).send({
                    status: 'error',
                    message: 'Authentication required',
                });
            }

            const { id } = request.params;
            const canvas = await this.templateService.createCanvasFromTemplate(id, userId, request.body);

            return reply.status(201).send({
                status: 'success',
                data: { canvas },
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === TEMPLATE_ERROR_MESSAGES.TEMPLATE_NOT_FOUND) {
                    return reply.status(404).send({
                        status: 'error',
                        message: 'Template not found',
                    });
                }
                if (error.message === TEMPLATE_ERROR_MESSAGES.UNAUTHORIZED) {
                    return reply.status(403).send({
                        status: 'error',
                        message: 'You are not authorized to use this template',
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

    async deleteTemplate(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const userId = request.user?.userId;
            if (!userId) {
                return reply.status(401).send({
                    status: 'error',
                    message: 'Authentication required',
                });
            }

            const { id } = request.params;
            await this.templateService.deleteTemplate(id, userId);

            return reply.status(200).send({
                status: 'success',
                message: 'Template deleted successfully',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === TEMPLATE_ERROR_MESSAGES.TEMPLATE_NOT_FOUND) {
                    return reply.status(404).send({
                        status: 'error',
                        message: 'Template not found',
                    });
                }
                if (error.message === TEMPLATE_ERROR_MESSAGES.UNAUTHORIZED) {
                    return reply.status(403).send({
                        status: 'error',
                        message: 'You are not authorized to delete this template',
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
}
