import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { BaseEntity } from './base.entity';

export abstract class BaseWithDateEntity extends BaseEntity {
  @AutoMap()
  @CreateDateColumn({ type: 'timestamptz' })
  public readonly createdAt: Date;

  @AutoMap()
  @UpdateDateColumn({ type: 'timestamptz' })
  public readonly updatedAt: Date;
}

