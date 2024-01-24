import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePendingTradeInputDTO } from 'src/api/dtos/pending-trades/create-pending-trade.input.dto';
import { UUIDv4 } from 'src/common/types';
import { Transaction } from 'src/infra/postgres/other/types';
import { UserItemsUseCase } from './user-items.use-case';
import { UsersUseCase } from './users.use-case';
import { AcceptedTradeEntity, CancelledTradeEntity, PendingTradeEntity, RejectedTradeEntity, TradeToReceiverItemEntity, TradeToSenderItemEntity, UserEntity } from 'src/infra/postgres/tables';
import { PendingTradesService } from '../services/pending-trades.service';
import { TradesToSenderItemsService } from '../services/trades-to-sender-items.service';
import { TradesToReceiverItemsService } from '../services/trades-to-receiver-items.service';

@Injectable()
export class PendingTradesUseCase {
  public constructor(
    private readonly pendingTradesService: PendingTradesService,
    private readonly tradesToSenderItemsService: TradesToSenderItemsService,
    private readonly tradesToReceiverItemsService: TradesToReceiverItemsService,
    private readonly userItemsUseCase: UserItemsUseCase,
    private readonly usersUseCase: UsersUseCase,
  ) {}

  public async createPendingTrade(
    sender: UserEntity,
    dto: CreatePendingTradeInputDTO,
    tx?: Transaction,
  ): Promise<{
    pendingTrade: PendingTradeEntity,
    tradesToSenderItems: Array<TradeToSenderItemEntity>,
    tradesToReceiverItems: Array<TradeToReceiverItemEntity>,
  }> {
    if (!dto.senderItemIds.length && !dto.receiverItemIds.length) {
      throw new HttpException(
        '`senderItemIds` and `receiverItemIds` cannot be empty simultaneously',
        HttpStatus.BAD_REQUEST
      );
    }

    const [senderItems, receiver, receiverItems] = await Promise.all([
      this.userItemsUseCase.getUserItemsByIds(
        dto.senderItemIds,
        {
          errorMessageFn: (id) => `Trade sender item (\`${id}\`) not found`,
        },
      ),
      this.usersUseCase.getUserById(
        dto.receiverId,
        {
          errorMessageFn: (id) => `Trade receiver (\`${id}\`) not found`,
        },
      ),
      this.userItemsUseCase.getUserItemsByIds(
        dto.receiverItemIds,
        {
          errorMessageFn: (id) => `Trade receiver item (\`${id}\`) not found`,
        }
      ),
    ]);

    if (sender.id === receiver.id) {
      throw new HttpException('You cannot send trade to yourself', HttpStatus.CONFLICT);
    }

    for (const senderItem of senderItems) {
      if (senderItem.user.id !== sender.id) {
        throw new HttpException(
          `Trade sender item (\`${senderItem.id}\`) does not belong to you`,
          HttpStatus.CONFLICT,
        );
      }
    }

    for (const receiverItem of receiverItems) {
      if (receiverItem.user.id !== receiver.id) {
        throw new HttpException(
          `Trade receiver item (\`${receiverItem.id}\`) does not belong to them`,
          HttpStatus.CONFLICT,
        );
      }
    }

    return this.pendingTradesService.createOne({
      sender,
      senderItems,
      receiver,
      receiverItems,
    }, tx);
  }

  public async getPendingTrade(
    where: Partial<{ id: UUIDv4 }> = {},
    options: Partial<{
      errorMessage: string;
      errorStatus: HttpStatus;
    }> = {},
  ): Promise<PendingTradeEntity> {
    const {
      errorMessage = 'Pending trade not found',
      errorStatus = HttpStatus.NOT_FOUND,
    } = options;

    const pendingTrade = await this.pendingTradesService.findOne({
      where
    });

    if (!pendingTrade) {
      throw new HttpException(errorMessage, errorStatus);
    }

    return pendingTrade;
  }

  public async getPendingTradeById(
    id: UUIDv4,
    options: Partial<{
      errorMessageFn: (id: UUIDv4) => string,
      errorStatus: HttpStatus,
    }> = {},
  ): Promise<PendingTradeEntity> {
    const {
      errorMessageFn = (id) => `Pending trade (\`${id}\`) not found`,
      errorStatus = HttpStatus.NOT_FOUND,
    } = options;

    return this.getPendingTrade({ id }, {
      errorMessage: errorMessageFn(id),
      errorStatus,
    });
  }

  public async cancelPendingTrade(
    user: UserEntity,
    pendingTrade: PendingTradeEntity,
    tx?: Transaction,
  ): Promise<CancelledTradeEntity> {
    if (user.id !== pendingTrade.sender.id) {
      throw new HttpException('You cannot cancel a trade that is not yours', HttpStatus.CONFLICT);
    }

    return this.pendingTradesService.updateOneToCancelled(pendingTrade, tx);
  }

  public async cancelPendingTradeById(
    user: UserEntity,
    id: UUIDv4,
    tx?: Transaction,
  ): Promise<CancelledTradeEntity> {
    const pendingTrade = await this.getPendingTradeById(id);

    return this.cancelPendingTrade(user, pendingTrade, tx);
  }

  public async acceptPendingTrade(
    user: UserEntity,
    pendingTrade: PendingTradeEntity,
    tx?: Transaction,
  ): Promise<AcceptedTradeEntity> {
    const {
      sender,
      receiver,
    } = pendingTrade;

    if (user.id !== receiver.id) {
      throw new HttpException('You are not a receiver of this trade', HttpStatus.CONFLICT);
    }

    const [tradesToSenderItems, tradesToReceiverItems] = await Promise.all([
      this.tradesToSenderItemsService.findMany({
        where: {
          tradeId: pendingTrade.id,
        },
      }),
      this.tradesToReceiverItemsService.findMany({
        where: {
          tradeId: pendingTrade.id,
        },
      }),
    ]);

    await Promise.all([
      this.userItemsUseCase.transferUserItemsToAnotherUser(
        tradesToSenderItems.map(({ senderItem }) => senderItem),
        receiver,
        tx,
      ),
      this.userItemsUseCase.transferUserItemsToAnotherUser(
        tradesToReceiverItems.map(({ receiverItem }) => receiverItem),
        sender,
        tx,
      ),
    ]);

    return this.pendingTradesService.updateOneToAccepted(pendingTrade, tx);
  }

  public async acceptPendingTradeById(
    user: UserEntity,
    id: UUIDv4,
    tx?: Transaction,
  ): Promise<AcceptedTradeEntity> {
    const pendingTrade = await this.getPendingTradeById(id);

    return this.acceptPendingTrade(user, pendingTrade, tx);
  }

  public async rejectPendingTrade(
    user: UserEntity,
    pendingTrade: PendingTradeEntity,
    tx?: Transaction,
  ): Promise<RejectedTradeEntity> {
    if (user.id !== pendingTrade.receiver.id) {
      throw new HttpException('You cannot reject a trade that is sent to you', HttpStatus.CONFLICT);
    }

    return this.pendingTradesService.updateOneToRejected(pendingTrade, tx);
  }

  public async rejectPendingTradeById(
    user: UserEntity,
    id: UUIDv4,
    tx?: Transaction,
  ) {
    const pendingTrade = await this.getPendingTradeById(id);

    return this.rejectPendingTrade(user, pendingTrade, tx);
  }
}
