import { UUIDv4 } from 'src/common/types';
import { UserEntity } from './user.entity';
import { PokemonEntity } from './pokemon.entity';
import { AutoMap } from '@automapper/classes';

export class UserItemEntity {
  @AutoMap()
  public readonly id: UUIDv4;
  @AutoMap()
  public readonly receivedAt: Date;
  @AutoMap(() => UserEntity)
  public readonly user: UserEntity;
  @AutoMap(() => PokemonEntity)
  public readonly pokemon: PokemonEntity;
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
