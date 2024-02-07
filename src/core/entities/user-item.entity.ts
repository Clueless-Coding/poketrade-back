import { UserEntity } from './user.entity';
import { AutoMap } from '@automapper/classes';
import { ItemEntity } from './item.entity';

export class UserItemEntity {
  @AutoMap()
  public readonly receivedAt: Date;
  @AutoMap(() => UserEntity)
  public readonly user: UserEntity;
  @AutoMap(() => ItemEntity)
  public readonly item: ItemEntity;
}

export type CreateUserItemEntityValues = Omit<UserItemEntity,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'receivedAt'
>;
export type UpdateUserItemEntityValues = Partial<
  & CreateUserItemEntityValues
  & Pick<UserItemEntity, 'receivedAt'>
>;
