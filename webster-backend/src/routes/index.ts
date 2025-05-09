import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.route.js';

export async function registerRoutes(app: FastifyInstance) {
    await authRoutes(app);
}
