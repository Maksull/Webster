import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './index.js';

@Entity()
export class Template {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    description: string | null = null;

    @Column({ type: 'int' })
    width!: number;

    @Column({ type: 'int' })
    height!: number;

    @Column({ type: 'varchar', length: 11, default: '#FFFFFF' })
    backgroundColor!: string;

    @Column({ type: 'jsonb' })
    layers!: any;

    @Column({ type: 'jsonb' })
    elementsByLayer!: any;

    @Column({ type: 'varchar', nullable: true })
    thumbnail: string | null = null;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'createdBy' })
    creator!: User;

    @Column({ type: 'uuid' })
    createdBy!: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt!: Date;
}
