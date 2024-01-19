import { HttpException, HttpStatus } from '@nestjs/common';
import { and, eq, ExtractTablesWithRelations } from 'drizzle-orm';
import { CreatePendingTradeInputDTO } from 'src/api/dtos/pending-trades/create-pending-trade.input.dto';
import { UUIDv4 } from 'src/common/types';
import {
  CancelledTradeEntity,
  AcceptedTradeEntity,
  RejectedTradeEntity,
  PendingTradeEntity,
  Transaction,
  UserEntity,
  EntityRelations,
  entityRelationsToWith,
} from 'src/infra/postgres/other/types';
import { TradesService } from '../services/trades.service';
import { UserItemsUseCase } from './user-items.use-case';
import { UsersUseCase } from './users.use-case';
import * as tables from 'src/infra/postgres/tables';

export class PendingTradesUseCase {
  public constructor(
    private readonly tradesService: TradesService,
    private readonly userItemsUseCase: UserItemsUseCase,
    private readonly usersUseCase: UsersUseCase,
  ) {}

  public async createPendingTrade(
    sender: UserEntity,
    dto: CreatePendingTradeInputDTO,
    tx?: Transaction,
  ): Promise<PendingTradeEntity<{
    sender: true,
    senderItems: true,
    receiver: true,
    receiverItems: true,
  }>> {
    const [senderItems, receiver, receiverItems] = await Promise.all([
      this.userItemsUseCase.getUserItemsByIds(
        dto.senderItemIds,
        (id) => `Trade sender item (\`${id}\`) not found`,
      ),
      this.usersUseCase.getUserById(
        dto.receiverId,
        {
          errorMessageFn: (id) => `Trade receiver (\`${id}\`) not found`,
        },
      ),
      this.userItemsUseCase.getUserItemsByIds(
        dto.receiverItemIds,
        (id) => `Trade receiver item (\`${id}\`) not found`,
      ),
    ]);

    if (sender.id === receiver.id) {
      throw new HttpException('You cannot send trade to yourself', HttpStatus.CONFLICT);
    }

    for (const senderItem of senderItems) {
      if (senderItem.user!.id !== sender.id) {
        throw new HttpException(
          `Trade sender item (\`${senderItem.id}\`) does not belong to you`,
          HttpStatus.CONFLICT,
        );
      }
    }

    for (const receiverItem of receiverItems) {
      if (receiverItem.user!.id !== receiver.id) {
        throw new HttpException(
          `Trade receiver item (\`${receiverItem.id}\`) does not belong to them`,
          HttpStatus.CONFLICT,
        );
      }
    }

    return this.tradesService
      .createOnePending({
        senderId: sender.id,
        senderItems,
        receiverId: receiver.id,
        receiverItems,
      }, tx)
      .then((trade) => ({
        ...trade,
        sender,
        receiver,
      }));
  }

  public async getPendingTrade<
    TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>['trades']> = {},
  >(
    where: Partial<{ id: UUIDv4 }> = {},
    options: Partial<{
      entityRelations: TEntityRelations,
      errorMessage: string;
      errorStatus: HttpStatus;
    }> = {},
  ): Promise<PendingTradeEntity<TEntityRelations>> {
    const pendingTrade = await this.tradesService.findOne({
      where: (table) => and(
        ...(where.id ? [eq(table.id, where.id)]: []),
        eq(table.status, 'PENDING'),
      ),
      with: entityRelationsToWith(options.entityRelations ?? {}),
    }) as PendingTradeEntity<TEntityRelations>;

    if (!pendingTrade) {
      throw new HttpException(
        options.errorMessage ?? 'Pending trade not found',
        options.errorStatus ?? HttpStatus.NOT_FOUND,
      );
    }

    return pendingTrade;
  }

  public async getPendingTradeById<
    TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>['trades']> = {},
  >(
    id: UUIDv4,
    options: Partial<{
      entityRelations: TEntityRelations,
      errorMessageFn: (id: UUIDv4) => string,
      errorStatus: HttpStatus,
    }> = {},
  ): Promise<PendingTradeEntity<TEntityRelations>> {
    return this.getPendingTrade({ id }, {
      entityRelations: options.entityRelations,
      errorMessage: options.errorMessageFn?.(id) ?? `Pending trade (\`${id}\`) not found`,
      errorStatus: options.errorStatus,
    });
  }

  public async cancelPendingTrade<
    TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>['trades']> & { sender: true },
  >(
    user: UserEntity,
    pendingTrade: PendingTradeEntity<TEntityRelations>,
    tx?: Transaction,
  ): Promise<CancelledTradeEntity<TEntityRelations>> {
    if (user.id !== pendingTrade.sender!.id) {
      throw new HttpException('You cannot cancel a trade that is not yours', HttpStatus.CONFLICT);
    }

    return this.tradesService.updateOneToCancelled(pendingTrade, tx);
  }

  public async cancelPendingTradeById(
    user: UserEntity,
    id: UUIDv4,
    tx?: Transaction,
  ): Promise<CancelledTradeEntity<{ sender: true }>> {
    const pendingTrade = await this.getPendingTradeById(id, {
      entityRelations: { sender: true }
    });

    return this.cancelPendingTrade(user, pendingTrade, tx);
  }

  public async acceptPendingTrade(
    user: UserEntity,
    pendingTrade: PendingTradeEntity<{
      sender: true,
      senderItems: { userItem: true },
      receiver: true,
      receiverItems: { userItem: true },
    }>,
    tx?: Transaction,
  ): Promise<AcceptedTradeEntity<{
    sender: true,
    senderItems: { userItem: true },
    receiver: true,
    receiverItems: { userItem: true },
  }>> {
    const {
      sender,
      senderItems,
      receiver,
      receiverItems,
    } = pendingTrade;

    if (user.id !== receiver!.id) {
      throw new HttpException('You are not a receiver of this trade', HttpStatus.CONFLICT);
    }

    await Promise.all([
      this.userItemsUseCase.transferUserItemsToAnotherUser(
        senderItems.map(({ userItem }) => userItem!),
        receiver!,
        tx,
      ),
      this.userItemsUseCase.transferUserItemsToAnotherUser(
        receiverItems.map(({ userItem }) => userItem!),
        sender!,
        tx,
      ),
    ]);

    return this.tradesService.updateOneToAccepted(pendingTrade, tx);
  }

  public async acceptPendingTradeById(
    user: UserEntity,
    id: UUIDv4,
    tx?: Transaction,
  ): Promise<AcceptedTradeEntity<{
      sender: true,
      senderItems: { userItem: true },
      receiver: true,
      receiverItems: { userItem: true },
  }>> {
    const pendingTrade = await this.getPendingTradeById(id, {
      entityRelations: {
        sender: true,
        senderItems: { userItem: true },
        receiver: true,
        receiverItems: { userItem: true },
      }
    });

    return this.acceptPendingTrade(user, pendingTrade, tx);
  }

  public async rejectPendingTrade<
    TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>['trades']> & { receiver: true },
  >(
    user: UserEntity,
    pendingTrade: PendingTradeEntity<TEntityRelations>,
    tx?: Transaction,
  ): Promise<RejectedTradeEntity<TEntityRelations>> {
    if (user.id !== pendingTrade.receiver!.id) {
      throw new HttpException('You cannot reject a trade that is sent to you', HttpStatus.CONFLICT);
    }

    return this.tradesService.updateOneToRejected(pendingTrade, tx);
  }

  public async rejectPendingTradeById(
    user: UserEntity,
    id: UUIDv4,
    tx?: Transaction,
  ) {
    const pendingTrade = await this.getPendingTradeById(id, {
      entityRelations: { receiver: true }
    })

    return this.rejectPendingTrade(user, pendingTrade, tx);
  }
}
