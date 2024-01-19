import { Injectable } from '@nestjs/common';
import { NodePgDatabase, NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { InjectDrizzle } from 'src/infra/postgres/postgres.module';
import { BaseService } from './base.service';
import * as tables from 'src/infra/postgres/tables';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { ExtractTablesWithRelations } from 'drizzle-orm';

@Injectable()
export class PokemonsService extends BaseService<'pokemons'> {
  public constructor(
    @InjectDrizzle()
    drizzle: NodePgDatabase<typeof tables>,
  ) {
    super('pokemons', drizzle);
  }

  public async deleteAll(
    tx?: PgTransaction<NodePgQueryResultHKT, typeof tables, ExtractTablesWithRelations<typeof tables>>,
  ): Promise<Array<typeof tables['pokemons']['$inferSelect']>> {
    return (tx ?? this.drizzle)
      .delete(this.table)
      .returning();
  }
}
