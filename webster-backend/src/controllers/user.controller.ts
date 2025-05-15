import { User } from '../entities/index.js';
import { UserService } from '../services/index.js';
import { FastifyRequest, FastifyReply } from 'fastify';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = request.user!.userId;
            const user = await this.userService.getUserById(userId);

            // Don't return sensitive fields (use rest operator for unused vars)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, resetPasswordToken, resetPasswordTokenExpiresAt, verificationCode, verificationCodeExpiresAt, ...userWithoutSensitiveInfo } =
                user;

            return reply.send({
                status: 'success',
                data: userWithoutSensitiveInfo,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'User not found') {
                    return reply.status(404).send({
                        status: 'error',
                        message: 'User not found',
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

    async getUserById(
        request: FastifyRequest<{
            Params: {
                id: string;
            };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const { id } = request.params;
            const user = await this.userService.getUserById(id);

            // Don't return sensitive fields (use rest operator for unused vars)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, resetPasswordToken, resetPasswordTokenExpiresAt, verificationCode, verificationCodeExpiresAt, ...userWithoutSensitiveInfo } =
                user;

            return reply.send({
                status: 'success',
                data: userWithoutSensitiveInfo,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'User not found') {
                    return reply.status(404).send({
                        status: 'error',
                        message: 'User not found',
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

    async uploadAvatar(
        request: FastifyRequest<{
            Params: { id: string };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const file = await request.file();
            const { id } = request.params;

            const avatar = await this.userService.uploadAvatar(file, id);

            return reply.status(200).send({
                status: 200,
                data: {
                    avatar,
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'No file uploaded') {
                    return reply.status(400).send({
                        status: 'error',
                        message: 'No file uploaded',
                    });
                }

                if (error.message === 'Event not found') {
                    return reply.status(404).send({
                        status: 'error',
                        message: 'Event not found',
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

    async updateCurrentUser(
        request: FastifyRequest<{
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
        }>,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user!.userId;
            const updateData = request.body;

            // Prevent updating sensitive fields via this endpoint
            const safeUpdateData: Partial<User> = { ...updateData };
            delete safeUpdateData.password;
            delete safeUpdateData.email;
            delete safeUpdateData.role;
            delete safeUpdateData.isEmailVerified;

            const updatedUser = await this.userService.updateUser(userId, safeUpdateData);

            // Don't return sensitive fields
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, resetPasswordToken, resetPasswordTokenExpiresAt, verificationCode, verificationCodeExpiresAt, ...userWithoutSensitiveInfo } =
                updatedUser;

            return reply.send({
                status: 'success',
                data: userWithoutSensitiveInfo,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'User not found') {
                    return reply.status(404).send({
                        status: 'error',
                        message: 'User not found',
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

    async deleteCurrentUser(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = request.user!.userId;
            await this.userService.deleteUser(userId);

            return reply.send({
                status: 'success',
                message: 'User account deleted successfully',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'User not found') {
                    return reply.status(404).send({
                        status: 'error',
                        message: 'User not found',
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

    async deleteAvatar(
        request: FastifyRequest<{
            Params: { id: string };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const { id } = request.params;

            await this.userService.deleteAvatar(id);

            return reply.status(200).send({
                status: 'OK',
            });
        } catch (error) {
            if (error instanceof Error) {
                request.log.error(error);
                return reply.status(500).send({
                    status: 'error',
                    message: 'Internal server error',
                });
            }
        }
    }
}
