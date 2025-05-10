import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { UserController } from '@/controllers/index.js';

export async function userRoutes(app: FastifyInstance) {
    const userController = new UserController();

    app.get('/users/profile', { preHandler: [authenticateToken] }, userController.getCurrentUser.bind(userController));

    app.get<{
        Params: {
            id: string;
        };
    }>('/users/:id', { preHandler: [authenticateToken] }, userController.getUserById.bind(userController));

    app.post<{
        Params: {
            id: string;
        };
    }>('/users/:id/avatar', { preHandler: [authenticateToken] }, userController.uploadAvatar.bind(userController));

    app.put<{
        Body: {
            firstName?: string;
            lastName?: string;
            username?: string;
            avatar?: string;
            phone?: string;
            bio?: string;
            showNameInEventVisitors?: boolean;
            [key: string]: any;
        };
    }>('/users/profile', { preHandler: [authenticateToken] }, userController.updateCurrentUser.bind(userController));

    app.delete('/users/profile', { preHandler: [authenticateToken] }, userController.deleteCurrentUser.bind(userController));

    app.delete<{
        Params: {
            id: string;
        };
    }>('/users/:id/avatar', { preHandler: [authenticateToken] }, userController.deleteAvatar.bind(userController));
}
