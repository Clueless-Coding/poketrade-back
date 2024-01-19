import { Nullable } from "src/common/types";
import { ExtractTablesWithRelations, FindTableByDBName, One, TableRelationalConfig, TablesRelationalConfig } from "drizzle-orm";
import { RemovePropertiesWithNever } from "src/common/types";
import * as tables from '../tables';
import { PgTransaction } from "drizzle-orm/pg-core";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";

export type EntityRelations<
  TSchema extends TablesRelationalConfig,
  TTableConfig extends TableRelationalConfig,
> = {
  [K in keyof TTableConfig['relations']]?:
    | true
    | EntityRelations<
      TSchema,
      FindTableByDBName<TSchema, TTableConfig['relations'][K]['referencedTableName']>
    >;
};

export type Entity<
  TTableName extends keyof RemovePropertiesWithNever<{
    [K in keyof ExtractTablesWithRelations<typeof tables>]:
      'id' extends keyof ExtractTablesWithRelations<typeof tables>[K]['columns']
        ? K
        : never
  }>,
  TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>[TTableName]> = {},
> = typeof tables[TTableName]['$inferSelect'] & {
  [K in keyof TEntityRelations]:
    // @ts-ignore
    ExtractTablesWithRelations<typeof tables>[TTableName]['relations'][K] extends One<string>
    // TODO: drizzle query with `with` property does leftJoin that's why the field is null
    // This is a annoying because i have all of my one-to-one many-to-one relations with not null constraint
    // Find a way to make this less inconvenient
    ? Nullable<Entity<
        // @ts-ignore
        FindTableByDBName<
          ExtractTablesWithRelations<typeof tables>,
          ExtractTablesWithRelations<typeof tables>[TTableName]['relations'][K]['referencedTableName']
        >['tsName'],
        TEntityRelations[K] extends true ? {} : TEntityRelations[K]
      >>
    : Array<Entity<
        // @ts-ignore
        FindTableByDBName<
          ExtractTablesWithRelations<typeof tables>,
          // @ts-ignore
          ExtractTablesWithRelations<typeof tables>[TTableName]['relations'][K]['referencedTableName']
        >['tsName'],
        TEntityRelations[K] extends true ? {} : TEntityRelations[K]
      >>
};

export type UserEntity<
  TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>['users']> = {},
> = Entity<'users', TEntityRelations>;
export type PokemonEntity<
  TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>['pokemons']> = {},
> = Entity<'pokemons', TEntityRelations>;
export type PackEntity<
  TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>['packs']> = {},
> = Entity<'packs', TEntityRelations>;
export type OpenedPackEntity<
  TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>['openedPacks']> = {},
> = Entity<'openedPacks', TEntityRelations>;
export type UserItemEntity<
  TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>['userItems']> = {},
> = Entity<'userItems', TEntityRelations>;
export type QuickSoldUserItemEntity<
  TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>['quickSoldUserItems']> = {},
> = Entity<'quickSoldUserItems', TEntityRelations>;
type _TradeEntity<
  TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>['trades']> = {},
> = Entity<'trades', TEntityRelations>;
export type PendingTradeEntity<
  TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>['trades']> = {},
> = Omit<_TradeEntity<TEntityRelations>, 'status'> & { status: 'PENDING' };
export type CancelledTradeEntity<
  TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>['trades']> = {},
> = Omit<_TradeEntity<TEntityRelations>, 'status'> & { status: 'CANCELLED' };
export type AcceptedTradeEntity<
  TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>['trades']> = {},
> = Omit<_TradeEntity<TEntityRelations>, 'status'> & { status: 'ACCEPTED' };
export type RejectedTradeEntity<
  TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>['trades']> = {},
> = Omit<_TradeEntity<TEntityRelations>, 'status'> & { status: 'REJECTED' };
export type TradeEntity<
  TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>['trades']> = {},
> =
  | PendingTradeEntity<TEntityRelations>
  | CancelledTradeEntity<TEntityRelations>
  | AcceptedTradeEntity<TEntityRelations>
  | RejectedTradeEntity<TEntityRelations>

export type Transaction = PgTransaction<NodePgQueryResultHKT, typeof tables, ExtractTablesWithRelations<typeof tables>>;

type With<
  TTableName extends keyof ExtractTablesWithRelations<typeof tables>,
> = {
  [K in keyof ExtractTablesWithRelations<typeof tables>[TTableName]['relations']]?: true | {
    with?: With<
        // @ts-ignore
        FindTableByDBName<
          ExtractTablesWithRelations<typeof tables>,
          // @ts-ignore
          ExtractTablesWithRelations<typeof tables>[TTableName]['relations'][K]['referencedTableName']
        >['tsName']
    >
  }
}

// TODO: move it to a separate file
// TODO: check if it works not only on the type level, but in RUNTIME
export const entityRelationsToWith = <
  TTableName extends keyof ExtractTablesWithRelations<typeof tables>,
>(
  entityRelations: EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>[TTableName]>
): With<TTableName> => {
  return Object.entries(entityRelations).reduce((acc, [key, value]) => {
    if (value === true) {
      return {
        ...acc,
        with: {
          // @ts-ignore
          ...acc.with,
          [key]: true,
        }
      }
    } else {
      return {
        ...acc,
        with: {
          // @ts-ignore
          ...acc.with,
          // @ts-ignore
          [key]: entityRelationsToWith(value),
        },
      }
    }
  }, {});
};
