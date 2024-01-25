import { Injectable } from '@nestjs/common';
import { Database } from 'src/infra/postgres/other/types';
import { tradesTable, usersTable, TradeEntity, TradeStatus } from 'src/infra/postgres/tables';
import { InjectDatabase } from 'src/infra/decorators/inject-database.decorator';
import { and, eq, inArray, SQL } from 'drizzle-orm';
import { Nullable, Optional, UUIDv4 } from 'src/common/types';
import { alias } from 'drizzle-orm/pg-core';

type Where = Partial<{
  id: UUIDv4,
  ids: Array<UUIDv4>
  status: TradeStatus,
}>

type FindOptions = Partial<{
  where: Where,
}>

@Injectable()
export class TradesService {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,
  ) {}

  private mapWhereToSQL(
    where: Where,
  ): Optional<SQL> {
    return and(
      where.id !== undefined
        ? eq(tradesTable.id, where.id)
        : undefined,
      where.ids !== undefined
        ? inArray(tradesTable.id, where.ids)
        : undefined,
      where.status !== undefined
        ? eq(tradesTable.status, where.status)
        : undefined,
    );
  }

  public mapSelectBuilderRowToEntity(
    row: Record<'trades' | 'senders' | 'receivers', any>,
  ) {
    return {
      ...row.trades,
      sender: row.senders,
      receiver: row.receivers,
    }
  }

  private baseSelectBuilder(
    findOptions: FindOptions,
  ) {
    const { where = {} } = findOptions;

    const sendersTable = alias(usersTable, 'senders');
    const receiversTable = alias(usersTable, 'receivers');

    return this.db
      .select()
      .from(tradesTable)
      .innerJoin(sendersTable, eq(sendersTable.id, tradesTable.senderId))
      .innerJoin(receiversTable, eq(receiversTable.id, tradesTable.receiverId))
      .where(this.mapWhereToSQL(where));
  }

  public async findOne(
    findOptions: FindOptions,
  ): Promise<Nullable<TradeEntity>> {
    return this
      .baseSelectBuilder(findOptions)
      .limit(1)
      .then(([row]) => (
        row
        ? this.mapSelectBuilderRowToEntity(row)
        : null
      ));
  }
}
