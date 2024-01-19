import { BuildQueryResult, DBQueryConfig, ExtractTablesWithRelations, inArray, KnownKeysOnly } from 'drizzle-orm';
import { PgInsertValue, PgUpdateSetSource } from 'drizzle-orm/pg-core';
import { NodePgDatabase, } from 'drizzle-orm/node-postgres';
import { Nullable } from 'src/common/types';
import { RemovePropertiesWithNever } from 'src/common/types';
import * as tables from 'src/infra/postgres/tables';
import { Entity, EntityRelations, Transaction } from 'src/infra/postgres/other/types';
import { zip } from 'lodash';

export abstract class BaseService<
  TTableName extends keyof RemovePropertiesWithNever<{
    [K in keyof ExtractTablesWithRelations<typeof tables>]:
      'id' extends keyof ExtractTablesWithRelations<typeof tables>[K]['columns']
        ? K
        : never
  }>
> {
  protected readonly table: typeof tables[TTableName];

  public constructor(
    protected readonly tableName: TTableName,
    protected readonly drizzle: NodePgDatabase<typeof tables>,
  ) {
    this.table = tables[tableName];
  }

  public async findOne<TSelection extends Omit<DBQueryConfig<'many', true, ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>[TTableName]>, 'limit'>>(
    config?: KnownKeysOnly<TSelection, Omit<DBQueryConfig<'many', true, ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>[TTableName]>, 'limit'>>
  ): Promise<Nullable<BuildQueryResult<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>[TTableName], TSelection>>> {
    return this
      .drizzle
      .query[this.tableName]
      .findFirst(config)
      .then((entity) => entity ?? null);
  }

  public async exists<TSelection extends Omit<DBQueryConfig<'many', true, ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>[TTableName]>, 'limit'>>(
    config?: KnownKeysOnly<TSelection, Omit<DBQueryConfig<'many', true, ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>[TTableName]>, 'limit'>>
  ): Promise<boolean> {
    return this
      .findOne(config)
      .then((entity) => Boolean(entity));
  }

  public async findMany<TConfig extends DBQueryConfig<'many', true, ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>[TTableName]>>(
    config?: KnownKeysOnly<TConfig, DBQueryConfig<'many', true, ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>[TTableName]>>
  ): Promise<BuildQueryResult<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>[TTableName], TConfig>[]> {
    return this
      .drizzle
      .query[this.tableName]
      .findMany(config);
  }

  public async findManyWithPagination<TConfig extends DBQueryConfig<'many', true, ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>[TTableName]>>(
    { page = 1, limit }: { page?: number, limit: number },
    config?: KnownKeysOnly<TConfig, DBQueryConfig<'many', true, ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>[TTableName]>>
  ): Promise<{
    items: BuildQueryResult<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>[TTableName], TConfig>[];
    itemCount: number;
    itemsPerPage: number;
    currentPage: number;
  }> {
    // TODO: check for boundaries
    const offset = (page - 1) * limit;

    return this
      .findMany({
        ...config,
        limit,
        offset,
      } as typeof config)
      .then((entities) => ({
        items: entities,
        itemCount: entities.length,
        itemsPerPage: offset,
        currentPage: page,
        // TODO: Add fields: totalItems, totalPages
      }))
  }

  public async createMany(
    values: Array<PgInsertValue<typeof tables[TTableName]>>,
    tx?: Transaction,
  ): Promise<Array<Entity<TTableName>>> {
    return (tx ?? this.drizzle)
      .insert(this.table)
      .values(values)
      .returning()
  }

  public async createOne(
    values: PgInsertValue<typeof tables[TTableName]>,
    tx?: Transaction,
  ): Promise<Entity<TTableName>> {
    return this.createMany([values], tx)
      .then(([entity]) => entity!);
  }

  public async updateMany<
    TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>[TTableName]>,
  >(
    entities: Array<Entity<TTableName, TEntityRelations>>,
    values: PgUpdateSetSource<typeof tables[TTableName]>,
    tx?: Transaction,
  ): Promise<Array<Entity<TTableName, TEntityRelations>>>  {
    return (tx ?? this.drizzle)
      .update(this.table)
      .set(values)
      .where(inArray(this.table.id, entities.map(({ id }) => id)))
      .returning()
      .then((updatedEntities) => zip(entities, [...updatedEntities]).map(([entity, updatedEntity]) => ({
        ...entity!,
        ...updatedEntity!,
      })));
  }

  public async updateOne<
    TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>[TTableName]>,
  >(
    entity: Entity<TTableName, TEntityRelations>,
    values: PgUpdateSetSource<typeof tables[TTableName]>,
    tx?: Transaction,
  ): Promise<Entity<TTableName, TEntityRelations>> {
    return this.updateMany([entity], values, tx)
      .then(([entity]) => entity!);
  }

  public async deleteMany<
    TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>[TTableName]>,
  >(
    entities: Array<Entity<TTableName, TEntityRelations>>,
    tx?: Transaction,
  ): Promise<Array<Entity<TTableName, TEntityRelations>>> {
    return (tx ?? this.drizzle)
      .delete(this.table)
      .where(inArray(this.table.id, entities.map(({ id }) => id)))
      .returning()
      .then((deletedEntities) => zip(entities, [...deletedEntities]).map(([entity, deletedEntity]) => ({
        ...entity!,
        ...deletedEntity!,
      })));
  }

  public async deleteOne<
    TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>[TTableName]>,
  >(
    entity: Entity<TTableName, TEntityRelations>,
    tx?: Transaction,
  ): Promise<Entity<TTableName, TEntityRelations>> {
    return this.deleteMany([entity], tx)
      .then(([deletedEntity]) => deletedEntity!);
  }
}
