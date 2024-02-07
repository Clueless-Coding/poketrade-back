import { AutoMap } from "@automapper/classes";
import { UUIDv4 } from "src/common/types";
import { PokemonEntity } from "./pokemon.entity";
import { UserEntity } from "./user.entity";

export class ItemEntity {
  @AutoMap()
  public readonly id: UUIDv4;

  @AutoMap()
  public readonly createdAt: Date;

  @AutoMap(() => PokemonEntity)
  public readonly pokemon: PokemonEntity;

  @AutoMap(() => UserEntity)
  public readonly owner?: UserEntity;
}

export type CreateItemEntityValues = Omit<ItemEntity, 'id' | 'createdAt' | 'owner'>;
