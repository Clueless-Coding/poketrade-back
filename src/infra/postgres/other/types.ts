import { OpenedPackEntity, OpenedPackModel } from "src/infra/postgres/entities/opened-pack.entity";
import { PackEntity, PackModel } from "src/infra/postgres/entities/pack.entity";
import { PokemonEntity, PokemonModel } from "src/infra/postgres/entities/pokemon.entity";
import { UserEntity, UserModel } from "src/infra/postgres/entities/user.entity";
import { UserInventoryEntryEntity, UserInventoryEntryModel } from "../entities/user-inventory-entry.entity";

// NOTE: Add new Entities here
type EntityToModel<Entity, Relations = {}> =
  Entity extends UserEntity<Relations> ? UserModel<Relations>
  : Entity extends PokemonEntity<Relations> ? PokemonModel<Relations>
  : Entity extends PackEntity<Relations> ? PackModel<Relations>
  : Entity extends OpenedPackEntity<Relations> ? OpenedPackModel<Relations>
  : Entity extends UserInventoryEntryEntity<Relations> ? UserInventoryEntryModel<Relations>
  : never;


type EntityOrArrayOfEntitiesToModel<EntityOrArrayOfEntities, Relations = {}> =
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

export type CreateEntityFields<
  Entity,
  Relations,
  Fields extends keyof Entity,
  T = Pick<Entity, Fields>,
> = { [K in keyof T]: K extends Relations ? EntityOrArrayOfEntitiesToModel<T[K]> : T[K] };

export type UpdateEntityFields<
  Entity,
  Relations,
  Fields extends keyof Entity,
> = Partial<CreateEntityFields<Entity, Relations, Fields>>;
