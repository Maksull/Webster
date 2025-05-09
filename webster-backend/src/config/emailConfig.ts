import nodemailer from 'nodemailer';

export const emailConfig = {
    from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
    transport: nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    }),
};
