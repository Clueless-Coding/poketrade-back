import { OpenedPackEntity, OpenedPackModel } from "src/infra/postgres/entities/opened-pack.entity";
import { PackEntity, PackModel } from "src/infra/postgres/entities/pack.entity";
import { PokemonEntity, PokemonModel } from "src/infra/postgres/entities/pokemon.entity";
import { UserEntity, UserModel } from "src/infra/postgres/entities/user.entity";
import { UserInventoryEntryEntity, UserInventoryEntryModel } from "../entities/user-inventory-entry.entity";
import { BaseEntity as TypeormBaseEntity } from "typeorm";

// NOTE: Add new Entities here
type EntityToModel<Entity, Relations = {}> =
  Entity extends UserEntity ? UserModel<Relations>
  : Entity extends PokemonEntity ? PokemonModel<Relations>
  : Entity extends PackEntity ? PackModel<Relations>
  : Entity extends OpenedPackEntity ? OpenedPackModel<Relations>
  : Entity extends UserInventoryEntryEntity ? UserInventoryEntryModel<Relations>
  : never;


type EntityOrArrayOfEntitiesToModel<EntityOrArrayOfEntities, Relations = {}> =
  EntityOrArrayOfEntities extends Array<infer Entity>
    ? Array<EntityToModel<Entity, Relations>>
    : EntityToModel<EntityOrArrayOfEntities, Relations>

type PickEntityRelations<Entity> = Pick<Entity, {
  [K in keyof Entity]:
    Entity[K] extends Array<TypeormBaseEntity>
      ? K
      : Entity[K] extends TypeormBaseEntity
        ? K
        : never
}[keyof Entity]>;

type GetEntityRelations<
  Entity,
  EntityRelations = PickEntityRelations<Entity>,
> = {
  [K in keyof EntityRelations]:
    EntityRelations[K] extends Array<infer ArrayEntity>
      ? ArrayEntity extends TypeormBaseEntity
        ? PickEntityRelations<ArrayEntity>
        : never
      : EntityRelations[K] extends TypeormBaseEntity
        ? PickEntityRelations<EntityRelations[K]>
        : never;
};

export type FindEntityRelationsOptions<
  Entity,
  EntityRelations = GetEntityRelations<Entity>,
> = {
  [K in keyof EntityRelations]?: true | FindEntityRelationsOptions<EntityRelations[K]>;
};

export type CreateModel<
  Entity extends TypeormBaseEntity,
  RelationsOptions extends FindEntityRelationsOptions<Entity>,
> =
  & Omit<Entity, keyof FindEntityRelationsOptions<Entity>>
  & {
    [K in keyof RelationsOptions]: EntityOrArrayOfEntitiesToModel<
      Entity[Extract<K, keyof Entity>],
      RelationsOptions[K] extends true
        ? {}
        : RelationsOptions[K]
    >;
  };

export type CreateEntityFields<
  Entity,
  Fields extends keyof Entity,
  EntityRelations = GetEntityRelations<Entity>,
  T = Pick<Entity, Fields>,
> = {
  [K in keyof T]: K extends keyof EntityRelations ? EntityOrArrayOfEntitiesToModel<T[K]> : T[K]
};

export type UpdateEntityFields<
  Entity,
  Fields extends keyof Entity,
> = Partial<CreateEntityFields<Entity, Fields>>;
