import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.route.js';
import { userRoutes } from './user.routes.js';

export async function registerRoutes(app: FastifyInstance) {
    await authRoutes(app);
    await userRoutes(app);
}
