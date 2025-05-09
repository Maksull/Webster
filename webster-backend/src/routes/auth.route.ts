import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { AuthController } from '../controllers/index.js';

const registerSchema = {
    body: {
        type: 'object',
        required: ['username', 'email', 'password', 'firstName', 'lastName'],
        properties: {
            username: { type: 'string', minLength: 3, maxLength: 30 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            firstName: { type: 'string', minLength: 1 },
            lastName: { type: 'string', minLength: 1 },
        },
        additionalProperties: false,
    },
} as const;

const loginSchema = {
    body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
            username: { type: 'string' },
            password: { type: 'string' },
        },
        additionalProperties: false,
    },
} as const;

const changePasswordSchema = {
    body: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
            currentPassword: { type: 'string' },
            newPassword: { type: 'string', minLength: 8 },
        },
        additionalProperties: false,
    },
} as const;

const changeEmailSchema = {
    body: {
        type: 'object',
        required: ['password', 'newEmail'],
        properties: {
            password: { type: 'string' },
            newEmail: { type: 'string', format: 'email' },
        },
        additionalProperties: false,
    },
} as const;

const verifyEmailSchema = {
    body: {
        type: 'object',
        required: ['code'],
        properties: {
            code: {
                type: 'string',
                pattern: '^[0-9]{6}$',
            },
        },
        additionalProperties: false,
    },
} as const;

const checkResetTokenSchema = {
    body: {
        type: 'object',
        required: ['token'],
        properties: {
            token: { type: 'string' },
        },
        additionalProperties: false,
    },
} as const;

const resetPasswordWithTokenSchema = {
    body: {
        type: 'object',
        required: ['token', 'newPassword'],
        properties: {
            token: { type: 'string' },
            newPassword: { type: 'string', minLength: 8 },
        },
        additionalProperties: false,
    },
} as const;

const emailSchema = {
    body: {
        type: 'object',
        required: ['email'],
        properties: {
            email: { type: 'string', format: 'email' },
        },
        additionalProperties: false,
    },
} as const;

export async function authRoutes(app: FastifyInstance) {
    const authController = new AuthController();

    app.post('/auth/register', { schema: registerSchema }, authController.register.bind(authController));

    app.post('/auth/login', { schema: loginSchema }, authController.login.bind(authController));

    app.post(
        '/auth/logout',
        {
            preHandler: [authenticateToken],
        },
        authController.logout.bind(authController),
    );

    app.post('/auth/verify-email', { schema: verifyEmailSchema }, authController.verifyEmail.bind(authController));

    app.post('/auth/resend-verification-code', { schema: emailSchema }, authController.resendVerificationCode.bind(authController));

    app.post('/auth/confirm-email-change', { schema: verifyEmailSchema }, authController.confirmEmailChange.bind(authController));

    app.post('/auth/reset-password', { schema: emailSchema }, authController.resetPassword.bind(authController));

    app.post('/auth/reset-password-with-token', { schema: resetPasswordWithTokenSchema }, authController.resetPasswordWithToken.bind(authController));

    app.post('/auth/check-reset-token', { schema: checkResetTokenSchema }, authController.checkResetToken.bind(authController));

    app.put<{ Body: { currentPassword: string; newPassword: string } }>(
        '/auth/change-password',
        {
            schema: changePasswordSchema,
            preHandler: [authenticateToken],
        },
        authController.changePassword.bind(authController),
    );

    app.post<{ Body: { password: string; newEmail: string } }>(
        '/auth/change-email',
        {
            schema: changeEmailSchema,
            preHandler: [authenticateToken],
        },
        authController.initiateEmailChange.bind(authController),
    );

    app.get('/auth/verify', {
        preHandler: [authenticateToken],
        handler: async (_request, reply) => {
            // If preHandler succeeds, the token is valid
            return reply.status(200).send({ status: 'success', message: 'Token is valid' });
        },
    });
}
