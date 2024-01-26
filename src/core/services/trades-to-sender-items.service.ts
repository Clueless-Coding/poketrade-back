import { Injectable } from '@nestjs/common';
import { and, eq, SQL } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { Optional, UUIDv4 } from 'src/common/types';
import { InjectDatabase } from 'src/infra/decorators/inject-database.decorator';
import { Database } from 'src/infra/postgres/other/types';
import { pokemonsTable, tradesTable, tradesToSenderItemsTable, TradeToSenderItemEntity, userItemsTable, usersTable } from 'src/infra/postgres/tables';
import { TradesService } from './trades.service';
import { UserItemsService } from './user-items.service';

type Where = Partial<{
  tradeId: UUIDv4,
  senderItemId: UUIDv4,
}>

type FindTradesToSenderItemsOptions = Partial<{
  where: Where,
}>

@Injectable()
export class TradesToSenderItemsService {
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
        ? eq(tradesToSenderItemsTable.tradeId, where.tradeId)
        : undefined,
      where.senderItemId !== undefined
        ? eq(tradesToSenderItemsTable.senderItemId, where.senderItemId)
        : undefined,
    );
  }

  private baseSelectBuilder(
    findTradesToSenderItemsOptions: FindTradesToSenderItemsOptions,
  ) {
    const { where = {} } = findTradesToSenderItemsOptions;

    const sendersTable = alias(usersTable, 'senders');
    const receiversTable = alias(usersTable, 'receivers');

    return this.db
      .select()
      .from(tradesToSenderItemsTable)
      .innerJoin(tradesTable, eq(tradesTable.id, tradesToSenderItemsTable.tradeId))
      .innerJoin(sendersTable, eq(sendersTable.id, tradesTable.senderId))
      .innerJoin(receiversTable, eq(receiversTable.id, tradesTable.receiverId))
      .innerJoin(userItemsTable, eq(userItemsTable.id, tradesToSenderItemsTable.senderItemId))
      .innerJoin(usersTable, eq(usersTable.id, userItemsTable.userId))
      .innerJoin(pokemonsTable, eq(pokemonsTable.id, userItemsTable.pokemonId))
      .where(this.mapWhereToSQL(where));
  }

  private mapSelectBuilderRowToEntity(
    row: Record<
      | 'trades_to_sender_items'
      | 'trades'
      | 'senders'
      | 'receivers'
      | 'user_items'
      | 'users'
      | 'pokemons',
      any>,
  ) {
    return {
      ...row.trades_to_sender_items,
      trade: this.tradesService.mapSelectBuilderRowToEntity(row),
      senderItem: this.userItemsService.mapSelectBuilderRowToEntity(row),
    }
  }

  public async findTradesToSenderItems(
    findTradesToSenderItemsOptions: FindTradesToSenderItemsOptions,
  ): Promise<Array<TradeToSenderItemEntity>> {
    return this
      .baseSelectBuilder(findTradesToSenderItemsOptions)
      .then((rows) => rows.map((row) => this.mapSelectBuilderRowToEntity(row)));
  }
}
