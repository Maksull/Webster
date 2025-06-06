import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.route.js';
import { userRoutes } from './user.routes.js';
import { canvasRoutes } from './canvas.routes.js';
import { templateRoutes } from './template.routes.js';

export async function registerRoutes(app: FastifyInstance) {
    await authRoutes(app);
    await userRoutes(app);
    await canvasRoutes(app);
    await templateRoutes(app);
}
