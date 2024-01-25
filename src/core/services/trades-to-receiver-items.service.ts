import { Injectable } from '@nestjs/common';
import { and, eq, SQL } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { Optional, UUIDv4 } from 'src/common/types';
import { InjectDatabase } from 'src/infra/decorators/inject-database.decorator';
import { Database } from 'src/infra/postgres/other/types';
import { pokemonsTable, tradesTable, tradesToReceiverItemsTable, TradeToReceiverItemEntity, userItemsTable, usersTable } from 'src/infra/postgres/tables';
import { TradesService } from './trades.service';
import { UserItemsService } from './user-items.service';

type Where = Partial<{
  tradeId: UUIDv4,
  receiverItemId: UUIDv4,
}>

type FindOptions = Partial<{
  where: Where,
}>

@Injectable()
export class TradesToReceiverItemsService {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,

    private readonly tradesService: TradesService,
    private readonly userItemsService: UserItemsService,
  ) {}

  private mapWhereToSQL(
    where: Where,
  ): Optional<SQL> {
    return and(
      where.tradeId !== undefined
        ? eq(tradesToReceiverItemsTable.tradeId, where.tradeId)
        : undefined,
      where.receiverItemId !== undefined
        ? eq(tradesToReceiverItemsTable.receiverItemId, where.receiverItemId)
        : undefined,
    );
  }

  private baseSelectBuilder(
    findOptions: FindOptions,
  ) {
    const { where = {} } = findOptions;

    const sendersTable = alias(usersTable, 'senders');
    const receiversTable = alias(usersTable, 'receivers');

    return this.db
      .select()
      .from(tradesToReceiverItemsTable)
      .innerJoin(tradesTable, eq(tradesTable.id, tradesToReceiverItemsTable.tradeId))
      .innerJoin(sendersTable, eq(sendersTable.id, tradesTable.senderId))
      .innerJoin(receiversTable, eq(receiversTable.id, tradesTable.receiverId))
      .innerJoin(userItemsTable, eq(userItemsTable.id, tradesToReceiverItemsTable.receiverItemId))
      .innerJoin(usersTable, eq(usersTable.id, userItemsTable.userId))
      .innerJoin(pokemonsTable, eq(pokemonsTable.id, userItemsTable.pokemonId))
      .where(this.mapWhereToSQL(where));
  }

  private mapSelectBuilderRowToEntity(
    row: Record<
      | 'trades_to_receiver_items'
      | 'trades'
      | 'senders'
      | 'receivers'
      | 'user_items'
      | 'users'
      | 'pokemons',
      any>,
  ) {
    return {
      ...row.trades_to_receiver_items,
      trade: this.tradesService.mapSelectBuilderRowToEntity(row),
      receiverItem: this.userItemsService.mapSelectBuilderRowToEntity(row),
    }
  }

  public async findMany(
    findOptions: FindOptions,
  ): Promise<Array<TradeToReceiverItemEntity>> {
    return this
      .baseSelectBuilder(findOptions)
      .then((rows) => rows.map((row) => this.mapSelectBuilderRowToEntity(row)));
  }
}
