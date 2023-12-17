import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UUIDv4 } from 'src/common/types';
import { AutoMap } from '@automapper/classes';

export abstract class BaseEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  public readonly id: UUIDv4;

  @AutoMap()
  @CreateDateColumn({ type: 'timestamptz' })
  public readonly createdAt: Date;

  @AutoMap()
  @UpdateDateColumn({ type: 'timestamptz' })
  public readonly updatedAt: Date;
}

