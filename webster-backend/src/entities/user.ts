import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 100 })
    firstName!: string;

    @Column({ type: 'varchar', length: 100 })
    lastName!: string;

    @Column({ type: 'varchar', unique: true })
    email!: string;

    @Column({ type: 'varchar', select: false })
    password!: string;

    @Column({ type: 'varchar', unique: true })
    username!: string;

    @Column({ type: 'varchar', nullable: true })
    avatar?: string | null;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role!: UserRole;

    @Column({ type: 'boolean', default: false })
    isEmailVerified!: boolean;

    @Column({ type: 'varchar', nullable: true })
    verificationCode?: string | null;

    @Column({ type: 'timestamp', nullable: true })
    verificationCodeExpiresAt?: Date | null;

    @Column({ type: 'varchar', nullable: true })
    resetPasswordToken?: string | null;

    @Column({ type: 'timestamp', nullable: true })
    resetPasswordTokenExpiresAt?: Date | null;

    @Column({ type: 'varchar', nullable: true })
    newEmail?: string | null;

    @Column({ type: 'varchar', nullable: true })
    emailChangeCode?: string | null;

    @Column({ type: 'timestamp', nullable: true })
    emailChangeCodeExpiresAt?: Date | null;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt!: Date;
}
