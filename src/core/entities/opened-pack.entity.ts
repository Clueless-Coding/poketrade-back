import { UUIDv4 } from 'src/common/types';
import { UserEntity } from './user.entity';
import { PokemonEntity } from './pokemon.entity';
import { PackEntity } from './pack.entity';
import { AutoMap } from '@automapper/classes';

export class OpenedPackEntity {
  @AutoMap()
  public readonly id: UUIDv4;
  @AutoMap()
  public readonly openedAt: Date;
  @AutoMap(() => UserEntity)
  public readonly user: UserEntity;
  @AutoMap(() => PackEntity)
  public readonly pack: PackEntity;
  @AutoMap(() => PokemonEntity)
  public readonly pokemon: PokemonEntity;
}

export type CreateOpenedPackEntityValues = Omit<OpenedPackEntity,
  | 'id'
  | 'openedAt'
>;
