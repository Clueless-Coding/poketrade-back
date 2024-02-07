import { UUIDv4 } from 'src/common/types';
import { UserEntity } from './user.entity';
import { PackEntity } from './pack.entity';
import { AutoMap } from '@automapper/classes';
import { ItemEntity } from './item.entity';

export class OpenedPackEntity {
  @AutoMap()
  public readonly id: UUIDv4;
  @AutoMap()
  public readonly openedAt: Date;
  @AutoMap(() => UserEntity)
  public readonly user: UserEntity;
  @AutoMap(() => PackEntity)
  public readonly pack: PackEntity;
  @AutoMap(() => ItemEntity)
  public readonly item: ItemEntity;
}

export type CreateOpenedPackEntityValues = Omit<OpenedPackEntity,
  | 'id'
  | 'openedAt'
>;
