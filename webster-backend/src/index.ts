import 'reflect-metadata';
import 'dotenv/config';
import cors from '@fastify/cors';
import fastify, { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import path from 'path';
import { fileURLToPath } from 'url';
import fastifyStatic from '@fastify/static';
import { environmentConfig } from './config/index.js';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: FastifyInstance = fastify({
    logger: {
        level: 'error',
    },
});

app.register(fastifyStatic, {
    root: path.join(path.dirname(__dirname), 'public'),
    prefix: '/public/',
});

const start = async () => {
    try {
        await app.register(multipart);
        await app.register(cors, {
            origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            credentials: true,
            allowedHeaders: ['Content-Type', 'Authorization'],
        });

        app.get('/', async () => {
            return { message: 'Hello, Fastify!' };
        });

        await app.listen({
            port: environmentConfig.port,
            host: environmentConfig.host,
        });
        console.log(`Server is running at http://${environmentConfig.host}:${environmentConfig.port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

process.on('SIGINT', async () => {
    try {
        await app.close();
        console.log('Server has been gracefully shutdown');
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
});

start();
