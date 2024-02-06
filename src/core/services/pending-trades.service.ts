import { Injectable } from '@nestjs/common';
import { CreatePendingTradeInputDTO } from 'src/api/dtos/pending-trades/create-pending-trade.input.dto';
import { UUIDv4 } from 'src/common/types';
import { Database, Transaction } from 'src/infra/postgres/types';
import { AcceptedTradeEntity, CancelledTradeEntity, PendingTradeEntity, RejectedTradeEntity } from '../entities/trade.entity';
import { UserEntity } from '../entities/user.entity';
import { ITradesRepository } from '../repositories/trades.repository';
import { ITradesToUserItemsRepository } from '../repositories/trades-to-user-items.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PENDING_TRADE_ACCEPTED_EVENT, PENDING_TRADE_CREATED_EVENT } from '../events';
import { IUsersRepository } from '../repositories/users.repository';
import { IUserItemsRepository } from '../repositories/user-items.repository';
import { AppConflictException, AppValidationException } from '../exceptions';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';
import { TradeToReceiverItemEntity, TradeToSenderItemEntity } from '../entities/trade-to-user-item.entity';

@Injectable()
export class PendingTradesService {
  public constructor(
    private readonly tradesRepository: ITradesRepository,
    private readonly tradesToUserItemsRepository: ITradesToUserItemsRepository,
    private readonly userItemsRepository: IUserItemsRepository,
    private readonly usersRepository: IUsersRepository,
    private readonly eventEmitter: EventEmitter2,
    @InjectDatabase()
    private readonly db: Database,
  ) {}

  private async _createPendingTrade(
    sender: UserEntity,
    dto: CreatePendingTradeInputDTO,
    tx: Transaction,
  ): Promise<{
    pendingTrade: PendingTradeEntity,
    tradesToSenderItems: Array<TradeToSenderItemEntity>,
    tradesToReceiverItems: Array<TradeToReceiverItemEntity>,
  }> {
    if (!dto.senderItemIds.length && !dto.receiverItemIds.length) {
      throw new AppValidationException(
        '`senderItemIds` and `receiverItemIds` cannot be empty simultaneously',
      );
    }

    const [senderItems, receiver, receiverItems] = await Promise.all([
      this.userItemsRepository.findUserItemsByIds({
        ids: dto.senderItemIds,
        notFoundErrorMessageFn: (id) => `Trade sender item (\`${id}\`) not found`,
      }),
      this.usersRepository.findUserById({
        id: dto.receiverId,
        notFoundErrorMessageFn: (id) => `Trade receiver (\`${id}\`) not found`,
      }),
      this.userItemsRepository.findUserItemsByIds({
        ids: dto.receiverItemIds,
        notFoundErrorMessageFn: (id) => `Trade receiver item (\`${id}\`) not found`,
      }),
    ]);

    if (sender.id === receiver.id) {
      throw new AppConflictException('You cannot send trade to yourself');
    }

    for (const senderItem of senderItems) {
      if (senderItem.user.id !== sender.id) {
        throw new AppConflictException(
          `Trade sender item (\`${senderItem.id}\`) does not belong to you`,
        );
      }
    }

    for (const receiverItem of receiverItems) {
      if (receiverItem.user.id !== receiver.id) {
        throw new AppConflictException(
          `Trade receiver item (\`${receiverItem.id}\`) does not belong to them`,
        );
      }
    }

    return this.tradesRepository
      .createPendingTrade({
        sender,
        senderItems,
        receiver,
        receiverItems,
      }, tx)
      .then((createPendingTradeResult) => {
        this.eventEmitter.emit(PENDING_TRADE_CREATED_EVENT, createPendingTradeResult.pendingTrade);
        return createPendingTradeResult;
      });
  }

  public async createPendingTrade(
    sender: UserEntity,
    dto: CreatePendingTradeInputDTO,
  ): Promise<{
    pendingTrade: PendingTradeEntity,
    tradesToSenderItems: Array<TradeToSenderItemEntity>,
    tradesToReceiverItems: Array<TradeToReceiverItemEntity>,
  }> {
    return this.db.transaction(async (tx) => (
      this._createPendingTrade(sender, dto, tx)
    ));
  }

  private async _cancelPendingTradeById(
    user: UserEntity,
    id: UUIDv4,
    tx: Transaction,
  ): Promise<CancelledTradeEntity> {
    const pendingTrade = await this.tradesRepository.findPendingTradeById({ id });

    if (user.id !== pendingTrade.sender.id) {
      throw new AppConflictException('You cannot cancel a trade that is not yours');
    }

    return this.tradesRepository.updatePendingTradeToCancelledTrade(pendingTrade, tx);
  }

  public async cancelPendingTradeById(
    user: UserEntity,
    id: UUIDv4,
  ): Promise<CancelledTradeEntity> {
    return this.db.transaction(async (tx) => (
      this._cancelPendingTradeById(user, id, tx)
    ));
  }

  private async _acceptPendingTradeById(
    user: UserEntity,
    id: UUIDv4,
    tx: Transaction,
  ): Promise<AcceptedTradeEntity> {
    const pendingTrade = await this.tradesRepository.findPendingTradeById({ id });

    const {
      sender,
      receiver,
    } = pendingTrade;

    if (user.id !== receiver.id) {
      throw new AppConflictException('You are not a receiver of this trade');
    }

    const [tradesToSenderItems, tradesToReceiverItems] = await Promise.all([
      this.tradesToUserItemsRepository.findTradesToSenderItems({
        where: {
          tradeId: pendingTrade.id,
        },
      }),
      this.tradesToUserItemsRepository.findTradesToReceiverItems({
        where: {
          tradeId: pendingTrade.id,
        },
      }),
    ]);

    await Promise.all([
      this.userItemsRepository.transferUserItemsToAnotherUser(
        tradesToSenderItems.map(({ senderItem }) => senderItem),
        receiver,
        tx,
      ),
      this.userItemsRepository.transferUserItemsToAnotherUser(
        tradesToReceiverItems.map(({ receiverItem }) => receiverItem),
        sender,
        tx,
      ),
    ]);

    return this.tradesRepository
      .updatePendingTradeToAcceptedTrade(pendingTrade, tx)
      .then((acceptedTrade) => {
        this.eventEmitter.emit(PENDING_TRADE_ACCEPTED_EVENT, acceptedTrade);
        return acceptedTrade;
      });
  }

  public async acceptPendingTradeById(
    user: UserEntity,
    id: UUIDv4,
  ): Promise<AcceptedTradeEntity> {
    return this.db.transaction(async (tx) => (
      this._acceptPendingTradeById(user, id, tx)
    ));
  }

  private async _rejectPendingTradeById(
    user: UserEntity,
    id: UUIDv4,
    tx: Transaction,
  ): Promise<RejectedTradeEntity> {
    const pendingTrade = await this.tradesRepository.findPendingTradeById({ id });

    if (user.id !== pendingTrade.receiver.id) {
      throw new AppConflictException('You cannot reject a trade that is sent to you');
    }

    return this.tradesRepository.updatePendingTradeToRejectedTrade(pendingTrade, tx);
  }

  public async rejectPendingTradeById(
    user: UserEntity,
    id: UUIDv4,
  ): Promise<RejectedTradeEntity> {
    return this.db.transaction(async (tx) => (
      this._rejectPendingTradeById(user, id, tx)
    ));
  }
}
