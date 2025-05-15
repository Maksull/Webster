import { randomBytes, pbkdf2Sync } from 'crypto';
import jwt from 'jsonwebtoken';
import { addMinutes } from 'date-fns';
import { User } from '../entities/index.js';
import { AppDataSource, environmentConfig } from '../config/index.js';
import { EmailService } from './index.js';
import { TokenBlacklist } from '../middlewares/index.js';
import { ChangeEmailDto, ChangePasswordDto, LoginDto, RegisterUserDto } from '../types/index.js';

const PBKDF2_ITERATIONS = 10000;
const PBKDF2_KEY_LENGTH = 64;
const PBKDF2_DIGEST = 'sha512';
const SALT_BYTE_LENGTH = 16;

const VERIFICATION_CODE_EXPIRY_MINUTES = 15;
const EMAIL_CHANGE_CODE_EXPIRY_MINUTES = 15;
const RESET_PASSWORD_TOKEN_EXPIRY_MINUTES = 15;
const JWT_EXPIRY = '24h';

const PASSWORD_VALIDATION_REQUIREMENTS = {
    minLength: 8,
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/,
    specialChar: /[^A-Za-z0-9]/,
};

export const ERROR_MESSAGES = {
    USER_NOT_FOUND: 'User not found',
    INVALID_CREDENTIALS: 'Invalid credentials',
    EMAIL_ALREADY_REGISTERED: 'Email already registered',
    USERNAME_TAKEN: 'Username already taken',
    PASSWORD_VALIDATION_MIN_LENGTH: `Password must be at least ${PASSWORD_VALIDATION_REQUIREMENTS.minLength} characters long`,
    PASSWORD_VALIDATION_UPPERCASE: 'Password must contain at least one uppercase letter',
    PASSWORD_VALIDATION_LOWERCASE: 'Password must contain at least one lowercase letter',
    PASSWORD_VALIDATION_NUMBER: 'Password must contain at least one number',
    PASSWORD_VALIDATION_SPECIAL_CHAR: 'Password must contain at least one special character',
    EMAIL_NOT_VERIFIED: 'Email not verified',
    INVALID_VERIFICATION_CODE: 'Invalid verification code',
    VERIFICATION_CODE_EXPIRED: 'Verification code has expired',
    EMAIL_ALREADY_VERIFIED: 'Email already verified',
    INCORRECT_CURRENT_PASSWORD: 'Current password is incorrect',
    EMAIL_ALREADY_IN_USE: 'Email already in use',
    NO_EMAIL_CHANGE_REQUESTED: 'No email change was requested',
    INVALID_RESET_TOKEN: 'Invalid reset password token',
    RESET_TOKEN_EXPIRED: 'Reset password token has expired',
    JWT_SECRET_MISSING: 'Server configuration error: JWT secret missing.',
    INVALID_STORED_HASH_FORMAT: 'Invalid stored hash format encountered.',
};

export class AuthService {
    private userRepository = AppDataSource.getRepository(User);
    private emailService: EmailService;

    constructor() {
        this.emailService = new EmailService();
    }

    private hashPassword(password: string): string {
        const salt = randomBytes(SALT_BYTE_LENGTH).toString('hex');
        const hash = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, PBKDF2_DIGEST).toString('hex');
        return `${salt}:${hash}`;
    }

    private comparePassword(password: string, storedHash: string): boolean {
        const parts = storedHash.split(':');

        if (parts.length !== 2) {
            console.error(ERROR_MESSAGES.INVALID_STORED_HASH_FORMAT);
            return false;
        }

        const salt = parts[0]!;
        const hash = parts[1]!;

        try {
            const calculatedHash = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, PBKDF2_DIGEST).toString('hex');
            return hash === calculatedHash;
        } catch (error) {
            console.error('Error during password comparison:', error);
            return false;
        }
    }

    private generateVerificationCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private validatePasswordStrength(password: string): { isValid: boolean; message: string } {
        if (password.length < PASSWORD_VALIDATION_REQUIREMENTS.minLength) {
            return { isValid: false, message: ERROR_MESSAGES.PASSWORD_VALIDATION_MIN_LENGTH };
        }
        if (!PASSWORD_VALIDATION_REQUIREMENTS.uppercase.test(password)) {
            return { isValid: false, message: ERROR_MESSAGES.PASSWORD_VALIDATION_UPPERCASE };
        }
        if (!PASSWORD_VALIDATION_REQUIREMENTS.lowercase.test(password)) {
            return { isValid: false, message: ERROR_MESSAGES.PASSWORD_VALIDATION_LOWERCASE };
        }
        if (!PASSWORD_VALIDATION_REQUIREMENTS.number.test(password)) {
            return { isValid: false, message: ERROR_MESSAGES.PASSWORD_VALIDATION_NUMBER };
        }
        if (!PASSWORD_VALIDATION_REQUIREMENTS.specialChar.test(password)) {
            return { isValid: false, message: ERROR_MESSAGES.PASSWORD_VALIDATION_SPECIAL_CHAR };
        }
        return { isValid: true, message: 'Password meets all requirements' };
    }

    async register(registerData: RegisterUserDto): Promise<{ user: User; token: string }> {
        const existingUser = await this.userRepository.findOne({
            where: [{ email: registerData.email }, { username: registerData.username }],
            select: ['id', 'email', 'username'],
        });

        if (existingUser) {
            if (existingUser.email === registerData.email) {
                throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED);
            }
            throw new Error(ERROR_MESSAGES.USERNAME_TAKEN);
        }

        const passwordValidation = this.validatePasswordStrength(registerData.password);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.message);
        }

        const hashedPassword = this.hashPassword(registerData.password);
        const verificationCode = this.generateVerificationCode();

        const user = this.userRepository.create({
            ...registerData,
            password: hashedPassword,
            verificationCode,
            verificationCodeExpiresAt: addMinutes(new Date(), VERIFICATION_CODE_EXPIRY_MINUTES),
            isEmailVerified: false,
        });

        const savedUser = await this.userRepository.save(user);

        this.emailService.sendVerificationEmail(savedUser.email, verificationCode).catch(error => {
            console.error(`Failed to send verification email to ${savedUser.email}:`, error);
        });

        const token = this.generateToken(savedUser);

        // Create user response object by picking non-sensitive properties
        const userResponse = {
            id: savedUser.id, // Assuming id is a public field
            username: savedUser.username,
            email: savedUser.email,
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            role: savedUser.role,
            isEmailVerified: savedUser.isEmailVerified,
            avatar: savedUser.avatar,
            // Add other public fields as needed, explicitly excluding password
        };

        return { user: userResponse as User, token }; // Cast back to User if necessary for type compatibility
    }

    async changePassword(userId: string, data: ChangePasswordDto): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'password'],
        });

        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        const isPasswordValid = this.comparePassword(data.currentPassword, user.password);
        if (!isPasswordValid) {
            throw new Error(ERROR_MESSAGES.INCORRECT_CURRENT_PASSWORD);
        }

        const passwordValidation = this.validatePasswordStrength(data.newPassword);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.message);
        }

        user.password = this.hashPassword(data.newPassword);
        await this.userRepository.save(user);
    }

    async resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { resetPasswordToken: token },
            select: ['id', 'resetPasswordTokenExpiresAt'],
        });

        if (!user) {
            throw new Error(ERROR_MESSAGES.INVALID_RESET_TOKEN);
        }

        if (user.resetPasswordTokenExpiresAt && user.resetPasswordTokenExpiresAt < new Date()) {
            throw new Error(ERROR_MESSAGES.RESET_TOKEN_EXPIRED);
        }

        const passwordValidation = this.validatePasswordStrength(newPassword);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.message);
        }

        const userToUpdate = await this.userRepository.findOne({ where: { id: user.id } });

        if (!userToUpdate) {
            console.error(`User with ID ${user.id} not found during password reset update.`);
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        userToUpdate.password = this.hashPassword(newPassword);
        userToUpdate.resetPasswordToken = null;
        userToUpdate.resetPasswordTokenExpiresAt = null;

        await this.userRepository.save(userToUpdate);
    }

    async login(loginData: LoginDto): Promise<{ user: User; token: string }> {
        const user = await this.userRepository.findOne({
            where: { username: loginData.username },
            select: ['id', 'username', 'email', 'password', 'firstName', 'lastName', 'role', 'isEmailVerified', 'avatar'],
        });

        if (!user || !this.comparePassword(loginData.password, user.password)) {
            throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        if (!user.isEmailVerified) {
            throw new Error(ERROR_MESSAGES.EMAIL_NOT_VERIFIED);
        }

        const token = this.generateToken(user);

        // Create user response object by picking non-sensitive properties
        const userResponse = {
            id: user.id, // Assuming id is a public field
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            avatar: user.avatar,
            // Add other public fields as needed, explicitly excluding password
        };

        return { user: userResponse as User, token }; // Cast back to User if necessary
    }

    async logout(token: string): Promise<{ message: string }> {
        TokenBlacklist.add(token);
        return { message: 'Successfully logged out' };
    }

    private generateToken(user: Pick<User, 'id' | 'username'>): string {
        const payload = {
            userId: user.id,
            username: user.username,
        };
        if (!environmentConfig.jwtSecret) {
            console.error(ERROR_MESSAGES.JWT_SECRET_MISSING);
            throw new Error(ERROR_MESSAGES.JWT_SECRET_MISSING);
        }
        return jwt.sign(payload, environmentConfig.jwtSecret, { expiresIn: JWT_EXPIRY });
    }

    async verifyEmail(code: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { verificationCode: code },
        });

        if (!user) {
            throw new Error(ERROR_MESSAGES.INVALID_VERIFICATION_CODE);
        }

        if (user.isEmailVerified) {
            throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED);
        }

        if (user.verificationCodeExpiresAt && user.verificationCodeExpiresAt < new Date()) {
            throw new Error(ERROR_MESSAGES.VERIFICATION_CODE_EXPIRED);
        }

        user.isEmailVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpiresAt = null;

        return this.userRepository.save(user);
    }

    async initiateEmailChange(userId: string, data: ChangeEmailDto): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'email', 'password'],
        });

        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        const isPasswordValid = this.comparePassword(data.password, user.password);
        if (!isPasswordValid) {
            throw new Error(ERROR_MESSAGES.INCORRECT_CURRENT_PASSWORD);
        }

        const existingUserWithNewEmail = await this.userRepository.findOne({
            where: { email: data.newEmail },
            select: ['id'],
        });

        if (existingUserWithNewEmail && existingUserWithNewEmail.id !== user.id) {
            throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_IN_USE);
        }

        if (user.email === data.newEmail) {
            console.log(`User ${userId} attempted to change email to the same address.`);
            return;
        }

        const verificationCode = this.generateVerificationCode();
        user.newEmail = data.newEmail;
        user.emailChangeCode = verificationCode;
        user.emailChangeCodeExpiresAt = addMinutes(new Date(), EMAIL_CHANGE_CODE_EXPIRY_MINUTES);

        await this.userRepository.save(user);

        this.emailService.sendEmailChangeVerification(data.newEmail, verificationCode).catch(error => {
            console.error(`Failed to send email change verification email to ${data.newEmail}:`, error);
        });
    }

    async confirmEmailChange(code: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { emailChangeCode: code },
        });

        if (!user) {
            throw new Error(ERROR_MESSAGES.INVALID_VERIFICATION_CODE);
        }

        if (!user.newEmail || !user.emailChangeCodeExpiresAt) {
            throw new Error(ERROR_MESSAGES.NO_EMAIL_CHANGE_REQUESTED);
        }

        if (user.emailChangeCodeExpiresAt < new Date()) {
            throw new Error(ERROR_MESSAGES.VERIFICATION_CODE_EXPIRED);
        }

        user.email = user.newEmail;
        user.newEmail = null;
        user.emailChangeCode = null;
        user.emailChangeCodeExpiresAt = null;

        return this.userRepository.save(user);
    }

    async resendVerificationCode(email: string): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { email },
        });

        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        if (user.isEmailVerified) {
            throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED);
        }

        const verificationCode = this.generateVerificationCode();
        user.verificationCode = verificationCode;
        user.verificationCodeExpiresAt = addMinutes(new Date(), VERIFICATION_CODE_EXPIRY_MINUTES);

        await this.userRepository.save(user);

        this.emailService.sendVerificationEmail(user.email, verificationCode).catch(error => {
            console.error(`Failed to resend verification email to ${user.email}:`, error);
        });
    }

    async resetPassword(email: string): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { email },
        });

        if (!user) {
            // Throwing here reveals if an email exists. Consider returning success always for security.
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        const resetCode = this.generateVerificationCode();
        user.resetPasswordToken = resetCode;
        user.resetPasswordTokenExpiresAt = addMinutes(new Date(), RESET_PASSWORD_TOKEN_EXPIRY_MINUTES);

        await this.userRepository.save(user);

        this.emailService.sendResetPasswordEmail(user.email, resetCode).catch(error => {
            console.error(`Failed to send reset password email to ${user.email}:`, error);
        });
    }

    async checkResetToken(token: string): Promise<boolean> {
        const user = await this.userRepository.findOne({
            where: { resetPasswordToken: token },
            select: ['id', 'resetPasswordTokenExpiresAt'],
        });

        if (!user) {
            throw new Error(ERROR_MESSAGES.INVALID_RESET_TOKEN);
        }

        if (user.resetPasswordTokenExpiresAt && user.resetPasswordTokenExpiresAt < new Date()) {
            throw new Error(ERROR_MESSAGES.RESET_TOKEN_EXPIRED);
        }

        return true;
    }
}
