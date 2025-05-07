export interface EnvironmentConfig {
    port: number;
    host: string;
}

export const environmentConfig: EnvironmentConfig = {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3001,
    host: process.env.HOST || '127.0.0.1',
};
