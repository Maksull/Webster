import { User } from '@/entities/index.js';
import { DataSourceOptions, DataSource } from 'typeorm';

export const databaseConfig: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'webster',
    entities: [User],
    synchronize: process.env.NODE_ENV !== 'production', // Don't use in production!
    logging: process.env.NODE_ENV !== 'production',
};

export const AppDataSource = new DataSource(databaseConfig);
