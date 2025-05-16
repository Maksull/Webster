import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './index.js';

@Entity()
export class Canvas {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    description?: string | null;

    @Column({ type: 'int' })
    width!: number;

    @Column({ type: 'int' })
    height!: number;

    @Column({ type: 'varchar', length: 11, default: '#FFFFFF' })
    backgroundColor!: string;

    @Column({ type: 'jsonb' })
    layers!: any; // Store layers as JSON

    @Column({ type: 'jsonb' })
    elementsByLayer!: any; // Store elements by layer as JSON

    @Column({ type: 'varchar', nullable: true })
    thumbnail?: string | null;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: User;

    @Column({ type: 'uuid' })
    userId!: string;

    @Column({ type: 'timestamp', nullable: true })
    lastModified?: Date | null;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt!: Date;
}
