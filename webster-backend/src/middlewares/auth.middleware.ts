import { environmentConfig } from '../config/index.js';
import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    userId: string;
}

// For storing invalidated tokens
export class TokenBlacklist {
    private static tokens = new Set<string>();

    static add(token: string): void {
        this.tokens.add(token);
    }

    static has(token: string): boolean {
        return this.tokens.has(token);
    }

    // Method to clean up expired tokens (could be called periodically)
    static cleanup(): void {
        // In a production app, you'd want to implement a more sophisticated cleanup
    }
}

declare module 'fastify' {
    interface FastifyRequest {
        user?: {
            userId: string;
        };
    }
}

export async function authenticateToken(request: FastifyRequest, reply: FastifyReply) {
    try {
        const authHeader = request.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return reply.status(401).send({ status: 'error', message: 'Access token is required' });
        }

        if (TokenBlacklist.has(token)) {
            return reply.status(401).send({ status: 'error', message: 'Token has been invalidated' });
        }

        // Use the defined JwtPayload interface for type assertion
        const decoded = jwt.verify(token, environmentConfig.jwtSecret) as JwtPayload;

        // Ensure the decoded object has the userId property (though the type assertion helps)
        if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded && typeof decoded.userId === 'string') {
            request.user = {
                userId: decoded.userId,
            };
        } else {
            // If the payload structure is unexpected despite verification passing
            return reply.status(401).send({ status: 'error', message: 'Invalid token payload' });
        }

        // No explicit return needed at the end of a successful hook
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return reply.status(401).send({ status: 'error', message: 'Invalid token' });
        }
        if (error instanceof jwt.TokenExpiredError) {
            return reply.status(401).send({ status: 'error', message: 'Token expired' });
        }
        return reply.status(401).send({ status: 'error', message: 'Authentication failed' });
    }
}

export async function optionalAuthenticateToken(request: FastifyRequest) {
    try {
        const authHeader = request.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            // No token provided, continue without user data
            return;
        }

        if (TokenBlacklist.has(token)) {
            // Token is blacklisted, continue without user data
            return;
        }

        const decoded = jwt.verify(token, environmentConfig.jwtSecret) as JwtPayload;

        // Ensure the decoded object has the userId property
        if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded && typeof decoded.userId === 'string') {
            request.user = {
                userId: decoded.userId,
            };
        }
        // If payload is invalid, we still continue without user data as it's optional auth

        // No explicit return needed
    } catch {
        // Token validation failed (invalid signature, expired, etc.),
        // but we still continue without user data as it's optional auth.
        return;
    }
}
