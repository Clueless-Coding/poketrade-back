import { eq, ExtractTablesWithRelations } from 'drizzle-orm';
import { PgInsertValue, PgTransaction, PgUpdateSetSource } from 'drizzle-orm/pg-core';
import { PostgresJsDatabase, PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import { RemovePropertiesWithNever } from 'src/infra/postgres/other/types';
import * as tables from 'src/infra/postgres/tables';

export class BaseService<
  TableName extends keyof RemovePropertiesWithNever<{
    [K in keyof ExtractTablesWithRelations<typeof tables>]:
      'id' extends keyof ExtractTablesWithRelations<typeof tables>[K]['columns']
        ? K
        : never
  }>
> {
  public constructor(
    private readonly tableName: TableName,
    protected readonly drizzle: PostgresJsDatabase<typeof tables>,
  ) {}

  public async findOne(
    config?: Parameters<PostgresJsDatabase<typeof tables>['query'][TableName]['findFirst']>[0],
  ) {
    return this.drizzle.query[this.tableName]
      .findFirst(config)
      .then((entity) => entity ?? null);
  }

  public async exists(
    config?: Parameters<PostgresJsDatabase<typeof tables>['query'][TableName]['findFirst']>[0],
  ): Promise<boolean> {
    return this.findOne(config)
      .then((entity) => Boolean(entity));
  }

  public async findMany(
    config?: Parameters<PostgresJsDatabase<typeof tables>['query'][TableName]['findMany']>[0],
  ) {
    return this.drizzle.query[this.tableName]
      .findMany(config);
  }

  public async findManyWithPagination(
    paginationOptions: { page: number, limit: number },
    config?: Parameters<PostgresJsDatabase<typeof tables>['query'][TableName]['findMany']>[0],
  ) {
    // TODO: check for boundaries
    const { limit, offset } = {
      limit: paginationOptions.limit,
      offset: (paginationOptions.page - 1) * paginationOptions.limit,
    };

    return this.drizzle.query[this.tableName]
      .findMany({
        ...config,
        limit,
        offset,
      });
  }

  public async createOne(
    values: PgInsertValue<typeof tables[TableName]>,
    tx?: PgTransaction<PostgresJsQueryResultHKT, typeof tables, ExtractTablesWithRelations<typeof tables>>,
  ): Promise<typeof tables[TableName]['$inferSelect']> {
    return (tx ?? this.drizzle)
      .insert(tables[this.tableName])
      .values(values)
      .returning()
      .then(([entity]) => entity!);
  }

  public async updateOne(
    entity: typeof tables[TableName]['$inferSelect'],
    values: PgUpdateSetSource<typeof tables[TableName]>,
    tx?: PgTransaction<PostgresJsQueryResultHKT, typeof tables, ExtractTablesWithRelations<typeof tables>>,
  ): Promise<typeof tables[TableName]['$inferSelect']> {
    return (tx ?? this.drizzle)
      .update(tables[this.tableName])
      .set(values)
      .where(eq(tables[this.tableName].id, entity.id))
      .returning()
      .then(([entity]) => entity!);
  }

  public async deleteOne(
    entity: typeof tables[TableName]['$inferSelect'],
    tx?: PgTransaction<PostgresJsQueryResultHKT, typeof tables, ExtractTablesWithRelations<typeof tables>>,
  ): Promise<typeof tables[TableName]['$inferSelect']> {
    return (tx ?? this.drizzle)
      .delete(tables[this.tableName])
      .where(eq(tables[this.tableName].id, entity.id))
      .returning()
      .then(([entity]) => entity!);
  }
}
