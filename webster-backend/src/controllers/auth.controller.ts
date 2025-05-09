import { AuthService } from '@/services/index.js';
import { ERROR_MESSAGES } from '@/services/auth.service.js';
import { ChangeEmailDto, ChangePasswordDto, LoginDto, RegisterUserDto } from '@/types/index.js';
import { FastifyRequest, FastifyReply } from 'fastify';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    async register(request: FastifyRequest<{ Body: RegisterUserDto }>, reply: FastifyReply) {
        try {
            // AuthService now returns the user object without the password
            const { user, token } = await this.authService.register(request.body);

            return reply.status(201).send({
                status: 'success',
                data: {
                    user: user, // Use the user object directly
                    token,
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                // Check against ERROR_MESSAGES constants instead of string literals
                if (error.message === ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED || error.message === ERROR_MESSAGES.USERNAME_TAKEN) {
                    return reply.status(409).send({
                        status: 'error',
                        message: error.message,
                    });
                }

                // Handle password strength validation errors from the service
                if (error.message.startsWith('Password must')) {
                    // Simple check based on the error message pattern
                    return reply.status(400).send({
                        status: 'error',
                        message: error.message,
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

    async login(request: FastifyRequest<{ Body: LoginDto }>, reply: FastifyReply) {
        try {
            // AuthService now returns the user object without the password
            const { user, token } = await this.authService.login(request.body);

            return reply.status(200).send({
                status: 'success',
                data: {
                    user: user, // Use the user object directly
                    token,
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === ERROR_MESSAGES.INVALID_CREDENTIALS) {
                    // Use a generic message for invalid credentials for security
                    return reply.status(401).send({
                        status: 'error',
                        message: 'Invalid username or password',
                    });
                }
                if (error.message === ERROR_MESSAGES.EMAIL_NOT_VERIFIED) {
                    return reply.status(403).send({
                        status: 'error',
                        message: 'Please verify your email before logging in',
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

    async logout(request: FastifyRequest, reply: FastifyReply) {
        try {
            // Assumes the token is in the Authorization header
            const authHeader = request.headers.authorization;
            const token = authHeader?.split(' ')[1]; // Get token after "Bearer "

            if (!token) {
                return reply.status(400).send({
                    status: 'error',
                    message: 'No token provided',
                });
            }

            await this.authService.logout(token);

            return reply.status(200).send({
                status: 'success',
                message: 'Logged out successfully',
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                status: 'error',
                message: 'Internal server error',
            });
        }
    }

    async verifyEmail(request: FastifyRequest<{ Body: { code: string } }>, reply: FastifyReply) {
        try {
            const { code } = request.body;
            await this.authService.verifyEmail(code);

            return reply.status(200).send({
                status: 'success',
                message: 'Email verified successfully',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === ERROR_MESSAGES.INVALID_VERIFICATION_CODE || error.message === ERROR_MESSAGES.VERIFICATION_CODE_EXPIRED) {
                    return reply.status(400).send({
                        status: 'error',
                        message: error.message,
                    });
                }
                if (error.message === ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED) {
                    return reply.status(409).send({
                        status: 'error',
                        message: error.message,
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

    async changePassword(request: FastifyRequest<{ Body: ChangePasswordDto }>, reply: FastifyReply) {
        try {
            if (!request.user?.userId) {
                request.log.warn('Authenticated request without user ID in changePassword');
                return reply.status(401).send({
                    status: 'error',
                    message: 'Unauthorized',
                });
            }
            await this.authService.changePassword(request.user.userId, request.body);

            return reply.status(200).send({
                status: 'success',
                message: 'Password changed successfully',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === ERROR_MESSAGES.INCORRECT_CURRENT_PASSWORD) {
                    return reply.status(400).send({
                        status: 'error',
                        message: error.message,
                    });
                }
                // Handle User not found - unlikely behind auth, but possible edge case
                if (error.message === ERROR_MESSAGES.USER_NOT_FOUND) {
                    return reply.status(404).send({
                        status: 'error',
                        message: error.message,
                    });
                }
                // Handle password strength validation errors
                if (error.message.startsWith('Password must')) {
                    return reply.status(400).send({
                        status: 'error',
                        message: error.message,
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

    async resetPassword(request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply) {
        try {
            await this.authService.resetPassword(request.body.email);

            return reply.status(200).send({
                status: 'success',
                message: 'If a user with that email exists, a reset password email has been sent',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === ERROR_MESSAGES.USER_NOT_FOUND) {
                    request.log.info(`Password reset requested for non-existent user: ${request.body.email}`);
                    return reply.status(200).send({
                        // Still return 200 success for security
                        status: 'success',
                        message: 'If a user with that email exists, a reset password email has been sent',
                    });
                }
            }

            request.log.error(error); // Log unexpected errors
            return reply.status(500).send({
                status: 'error',
                message: 'Internal server error',
            });
        }
    }

    async initiateEmailChange(request: FastifyRequest<{ Body: ChangeEmailDto }>, reply: FastifyReply) {
        try {
            if (!request.user?.userId) {
                request.log.warn('Authenticated request without user ID in initiateEmailChange');
                return reply.status(401).send({
                    status: 'error',
                    message: 'Unauthorized',
                });
            }
            await this.authService.initiateEmailChange(request.user.userId, request.body);

            return reply.status(200).send({
                status: 'success',
                message: 'Verification email sent to new email address',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === ERROR_MESSAGES.INCORRECT_CURRENT_PASSWORD) {
                    return reply.status(400).send({
                        status: 'error',
                        message: error.message,
                    });
                }
                if (error.message === ERROR_MESSAGES.EMAIL_ALREADY_IN_USE) {
                    return reply.status(409).send({
                        status: 'error',
                        message: error.message,
                    });
                }
                if (error.message === ERROR_MESSAGES.USER_NOT_FOUND) {
                    return reply.status(404).send({
                        status: 'error',
                        message: error.message,
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

    async checkResetToken(request: FastifyRequest<{ Body: { token: string } }>, reply: FastifyReply) {
        try {
            await this.authService.checkResetToken(request.body.token);

            return reply.status(200).send({
                status: 'success',
                message: 'Reset token is valid',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === ERROR_MESSAGES.INVALID_RESET_TOKEN || error.message === ERROR_MESSAGES.RESET_TOKEN_EXPIRED) {
                    return reply.status(400).send({
                        status: 'error',
                        message: error.message,
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

    async resetPasswordWithToken(request: FastifyRequest<{ Body: { token: string; newPassword: string } }>, reply: FastifyReply) {
        try {
            await this.authService.resetPasswordWithToken(request.body.token, request.body.newPassword);

            return reply.status(200).send({
                status: 'success',
                message: 'Password reset successfully',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === ERROR_MESSAGES.INVALID_RESET_TOKEN || error.message === ERROR_MESSAGES.RESET_TOKEN_EXPIRED) {
                    return reply.status(400).send({
                        status: 'error',
                        message: error.message,
                    });
                }
                // Handle password strength validation errors
                if (error.message.startsWith('Password must')) {
                    return reply.status(400).send({
                        status: 'error',
                        message: error.message,
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

    async confirmEmailChange(request: FastifyRequest<{ Body: { code: string } }>, reply: FastifyReply) {
        try {
            await this.authService.confirmEmailChange(request.body.code);

            return reply.status(200).send({
                status: 'success',
                message: 'Email changed successfully',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (
                    error.message === ERROR_MESSAGES.INVALID_VERIFICATION_CODE ||
                    error.message === ERROR_MESSAGES.NO_EMAIL_CHANGE_REQUESTED ||
                    error.message === ERROR_MESSAGES.VERIFICATION_CODE_EXPIRED
                ) {
                    return reply.status(400).send({
                        status: 'error',
                        message: error.message,
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

    async resendVerificationCode(request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply) {
        try {
            const { email } = request.body;
            await this.authService.resendVerificationCode(email);

            return reply.status(200).send({
                status: 'success',
                message: 'Verification code resent successfully',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === ERROR_MESSAGES.USER_NOT_FOUND) {
                    return reply.status(404).send({
                        status: 'error',
                        message: error.message,
                    });
                }
                if (error.message === ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED) {
                    return reply.status(409).send({
                        status: 'error',
                        message: error.message,
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
