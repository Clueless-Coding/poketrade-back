import { PrimaryGeneratedColumn } from 'typeorm';
import { UUIDv4 } from 'src/common/types';
import { AutoMap } from '@automapper/classes';

export abstract class BaseEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  public readonly id: UUIDv4;
}

