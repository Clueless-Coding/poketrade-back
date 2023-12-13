import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UUIDv4 } from 'src/common/types';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public readonly id: UUIDv4;

  @CreateDateColumn({ type: 'timestamptz' })
  public readonly createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  public readonly updatedAt: Date;
}

