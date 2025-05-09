import { emailConfig } from '@/config/index.js';

export class EmailService {
    transport: any;
    from: string;

    constructor() {
        this.transport = emailConfig.transport;
        this.from = emailConfig.from;
    }

    async sendVerificationEmail(to: string, code: string): Promise<void> {
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Webster Team" <noreply@Webster.com>',
            to,
            subject: 'Verify Your Email Address - Webster',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Webster!</h2>
          <p>Thank you for registering. Please verify your email address to continue.</p>
          <p>Your verification code is: <strong>${code}</strong></p>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
        };

        try {
            await this.transport.sendMail(mailOptions);
        } catch (error) {
            console.error('Failed to send verification email:', error);
            throw new Error('Failed to send verification email');
        }
    }

    async sendResetPasswordEmail(to: string, code: string): Promise<void> {
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Webster Team" <noreply@Webster.com>',
            to,
            subject: 'Reset Your Password - Webster',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Here is your reset code:</p>
          <p><strong>${code}</strong></p>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email or contact support if you're concerned.</p>
        </div>
      `,
        };

        try {
            await this.transport.sendMail(mailOptions);
        } catch (error) {
            console.error('Failed to send reset password email:', error);
            throw new Error('Failed to send reset password email');
        }
    }

    async sendEmailChangeVerification(to: string, code: string): Promise<void> {
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Webster Team" <noreply@Webster.com>',
            to,
            subject: 'Verify Your New Email Address - Webster',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Change Request</h2>
          <p>We received a request to change your email address. Please verify this new email address.</p>
          <p>Your verification code is: <strong>${code}</strong></p>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this change, please contact support immediately.</p>
        </div>
      `,
        };

        try {
            await this.transport.sendMail(mailOptions);
        } catch (error) {
            console.error('Failed to send email change verification email:', error);
            throw new Error('Failed to send email change verification');
        }
    }
}
