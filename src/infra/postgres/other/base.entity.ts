import { PrimaryGeneratedColumn } from 'typeorm';
import { UUIDv4 } from 'src/common/types';
import { AutoMap } from '@automapper/classes';
import { BaseEntity as TypeormBaseEntity } from 'typeorm';

export abstract class BaseEntity extends TypeormBaseEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  public readonly id: UUIDv4;
}

