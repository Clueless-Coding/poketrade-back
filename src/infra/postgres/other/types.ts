import { PackEntity, PackModel } from "src/infra/postgres/entities/pack.entity";
import { PokemonEntity, PokemonModel } from "src/infra/postgres/entities/pokemon.entity";
import { UserEntity, UserModel } from "src/infra/postgres/entities/user.entity";

// NOTE: Add new Entities here
type EntityToModel<Entity, Relations> =
  Entity extends UserEntity<Relations> ? UserModel<Relations>
  : Entity extends PokemonEntity<Relations> ? PokemonModel<Relations>
  : Entity extends PackEntity<Relations> ? PackModel<Relations>
  : never;


type EntityOrArrayOfEntitiesToModel<EntityOrArrayOfEntities, Relations> =
  EntityOrArrayOfEntities extends Array<infer Entity>
    ? Array<EntityToModel<Entity, Relations>>
    : EntityToModel<EntityOrArrayOfEntities, Relations>

export type GetEntityRelations<Entity, Properties extends keyof Entity> = keyof Pick<Entity, Properties>;

export type CreateModel<
  Entity,
  Relations extends keyof Entity,
  RelationsOptions,
> =
  & Omit<Entity, Relations>
  & {
    [K in keyof RelationsOptions]: EntityOrArrayOfEntitiesToModel<
      Entity[Extract<K, Relations>],
      RelationsOptions[K] extends true
        ? {}
        : RelationsOptions[K]>
  };

export type From<T> = Exclude<T, boolean | undefined>;
