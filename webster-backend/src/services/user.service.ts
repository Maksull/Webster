import { MultipartFile } from '@fastify/multipart';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { AppDataSource } from '../config/index.js';
import { User } from '../entities/index.js';

const pump = promisify(pipeline);

export class UserService {
    private userRepository = AppDataSource.getRepository(User);

    async getUserById(id: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    async getUserByUsername(username: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { username },
        });
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { email },
        });
    }

    async uploadAvatar(file: MultipartFile | undefined, userId: string): Promise<string> {
        if (!file) {
            throw new Error('No file uploaded');
        }

        // Fetch the event to ensure it exists
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('Event not found');
        }

        const uploadDir = path.resolve(process.cwd(), 'public', 'img', 'users');
        let filePath: string | undefined;

        try {
            // Create the directory if it doesn't exist
            await fs.promises.mkdir(uploadDir, { recursive: true });

            // Generate a unique filename
            const fileExtension = path.extname(file.filename || '.jpg'); // Fallback to .jpg if filename is undefined
            const fileName = `${Date.now()}-${userId}${fileExtension}`;
            filePath = path.join(uploadDir, fileName);

            // Stream the file to disk
            await pump(file.file, fs.createWriteStream(filePath));

            // If the event already has a poster, delete the old one
            if (user.avatar) {
                const oldPosterPath = path.join(uploadDir, user.avatar);
                await fs.promises.unlink(oldPosterPath);
            }

            // Update the event's poster field with the new filename
            user.avatar = fileName;
            await this.userRepository.save(user);

            return fileName;
        } catch (error) {
            // Clean up the uploaded file if something went wrong
            if (filePath && fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
            }

            throw new Error(`Failed to upload poster: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async updateUser(id: string, userData: Partial<User>): Promise<User> {
        const user = await this.getUserById(id);
        Object.assign(user, userData);
        return this.userRepository.save(user);
    }

    async deleteUser(id: string): Promise<void> {
        const user = await this.getUserById(id);
        await this.userRepository.remove(user);
    }

    async deleteAvatar(id: string): Promise<void> {
        const user = await this.getUserById(id);
        const uploadDir = path.resolve(process.cwd(), 'public', 'img', 'users');
        if (user.avatar) {
            const oldPosterPath = path.join(uploadDir, user.avatar);
            await fs.promises.unlink(oldPosterPath);
        }

        user.avatar = null;
        await this.userRepository.save(user);
    }
}
