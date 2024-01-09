import { OpenedPackEntity, OpenedPackModel } from "src/infra/postgres/entities/opened-pack.entity";
import { PackEntity, PackModel } from "src/infra/postgres/entities/pack.entity";
import { PokemonEntity, PokemonModel } from "src/infra/postgres/entities/pokemon.entity";
import { UserEntity, UserModel } from "src/infra/postgres/entities/user.entity";
import { UserInventoryEntryEntity, UserInventoryEntryModel } from "../entities/user-inventory-entry.entity";
import { BaseEntity as TypeormBaseEntity } from "typeorm";
import { TradeEntity, TradeModel } from "../entities/trade.entity";
import { Nullable } from "src/common/types";
import { PendingTradeEntity, PendingTradeModel } from "../entities/pending-trade.entity";
import { AcceptedTradeEntity, AcceptedTradeModel } from "../entities/accepted-trade.entity";

// NOTE: Add new Entities here
type EntityToModel<
  Entity extends TypeormBaseEntity,
  Relations extends FindEntityRelationsOptions<Entity> = {},
> =
  Entity extends UserEntity ? UserModel<Relations>
  : Entity extends PokemonEntity ? PokemonModel<Relations>
  : Entity extends PackEntity ? PackModel<Relations>
  : Entity extends OpenedPackEntity ? OpenedPackModel<Relations>
  : Entity extends UserInventoryEntryEntity ? UserInventoryEntryModel<Relations>
  : Entity extends TradeEntity ? TradeModel<Relations>
  : Entity extends PendingTradeEntity ? PendingTradeModel<Relations>
  : Entity extends AcceptedTradeEntity ? AcceptedTradeModel<Relations>
  : never;


type EntityOrArrayOfEntitiesToModel<
  EntityOrArrayOfEntities extends Array<TypeormBaseEntity> | Nullable<TypeormBaseEntity> | TypeormBaseEntity,
  Relations = {}
> =
  EntityOrArrayOfEntities extends Array<infer ArrayEntity extends TypeormBaseEntity>
    ? Array<EntityToModel<ArrayEntity, Relations>>
    : EntityOrArrayOfEntities extends infer Entity extends TypeormBaseEntity
      ? EntityToModel<Entity, Relations>
      : EntityOrArrayOfEntities extends Nullable<infer NullableEntity extends TypeormBaseEntity>
        ? Nullable<EntityToModel<NullableEntity, Relations>>
        : never

type RemovePropertiesWith<T extends Record<string, unknown>, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K]
}

type RemovePropertiesWithNever<T extends Record<string, unknown>> = RemovePropertiesWith<T, never>;

export type FindEntityRelationsOptions<
  Entity extends TypeormBaseEntity,
> =
Partial<RemovePropertiesWithNever<{
  [K in keyof Entity]:
    Entity[K] extends Array<infer ArrayEntity extends TypeormBaseEntity>
      ? true | FindEntityRelationsOptions<ArrayEntity>
      : Entity[K] extends TypeormBaseEntity
        ? true | FindEntityRelationsOptions<Entity[K]>
        : Entity[K] extends Nullable<infer NullableEntity extends TypeormBaseEntity>
          ? true | FindEntityRelationsOptions<NullableEntity>
          : never
}>>;

export type CreateModel<
  Entity extends TypeormBaseEntity,
  RelationsOptions extends FindEntityRelationsOptions<Entity>,
> =
  & Omit<Entity, keyof FindEntityRelationsOptions<Entity>>
  & {
    [K in keyof RelationsOptions]: EntityOrArrayOfEntitiesToModel<
      // @ts-ignore
      Entity[Extract<K, keyof Entity>],
      RelationsOptions[K] extends true
        ? {}
        : RelationsOptions[K]
    >;
  };

export type CreateEntityFields<
  Entity extends TypeormBaseEntity,
  Fields extends keyof Entity,
  T = Pick<Entity, Fields>,
> = {
  [K in keyof T]: K extends keyof FindEntityRelationsOptions<Entity>
    ? EntityOrArrayOfEntitiesToModel<
      // @ts-ignore
      T[K]
    >
    : T[K]
};

export type UpdateEntityFields<
  Entity extends TypeormBaseEntity,
  Fields extends keyof Entity,
> = Partial<CreateEntityFields<Entity, Fields>>;
