import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TransactionFor } from 'nest-transact';
import { CreatePendingTradeInputDTO } from 'src/api/dtos/pending-trades/create-pending-trade.input.dto';
import { UUIDv4 } from 'src/common/types';
import { AcceptedTradeModel } from 'src/infra/postgres/entities/accepted-trade.entity';
import { CancelledTradeModel } from 'src/infra/postgres/entities/cancelled-trade.entity';
import { PendingTradeEntity, PendingTradeModel } from 'src/infra/postgres/entities/pending-trade.entity';
import { RejectedTradeModel } from 'src/infra/postgres/entities/rejected-trade.entity';
import { UserModel } from 'src/infra/postgres/entities/user.entity';
import { FindEntityRelationsOptions } from 'src/infra/postgres/other/types';
import { DataSource, FindOptionsWhere } from 'typeorm';
import { PendingTradesService } from '../services/pending-trades.service';
import { UserInventoryEntriesUseCase } from './user-inventory-entries.use-case';
import { UsersUseCase } from './users.use-case';

@Injectable()
export class PendingTradesUseCase extends TransactionFor<PendingTradesUseCase> {
  public constructor(
    private readonly pendingTradesService: PendingTradesService,
    private readonly usersUseCase: UsersUseCase,
    private readonly userInventoryEntriesUseCase: UserInventoryEntriesUseCase,

    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  public async createPendingTrade(sender: UserModel, dto: CreatePendingTradeInputDTO) {
    const [senderInventoryEntries, receiver, receiverInventoryEntries] = await Promise.all([
      this.userInventoryEntriesUseCase.findManyUserInventoryEntriesByIds(
        dto.senderInventoryEntryIds,
        (id) => `Trade sender inventory entry (\`${id}\`) not found`,
      ),
      this.usersUseCase.findUserById(
        dto.receiverId,
        (id) => `Trade receiver (\`${id}\`) not found`,
      ),
      this.userInventoryEntriesUseCase.findManyUserInventoryEntriesByIds(
        dto.receiverInventoryEntryIds,
        (id) => `Trade receiver inventory entry (\`${id}\`) not found`,
      ),
    ]);

    if (sender.id === receiver.id) {
      throw new HttpException('You cannot send trade to yourself', HttpStatus.CONFLICT);
    }

    for (const senderInventoryEntry of senderInventoryEntries) {
      if (senderInventoryEntry.user.id !== sender.id) {
        throw new HttpException(
          `Trade sender inventory entry (\`${senderInventoryEntry.id}\`) does not belong to you`,
          HttpStatus.CONFLICT,
        );
      }
    }


    for (const receiverInventoryEntry of receiverInventoryEntries) {
      if (receiverInventoryEntry.user.id !== receiver.id) {
        throw new HttpException(
          `Trade receiver inventory entry (\`${receiverInventoryEntry.id}\`) does not belong to them`,
          HttpStatus.CONFLICT,
        );
      }
    }

    return this.pendingTradesService.createOne({
      sender,
      senderInventoryEntries,
      receiver,
      receiverInventoryEntries,
    });
  }

  public async findPendingTrade<
    T extends FindEntityRelationsOptions<PendingTradeEntity>,
  >(
    where: FindOptionsWhere<PendingTradeEntity>,
    relations?: T,
    errorMessage?: string,
  ): Promise<PendingTradeModel<T>> {
    const pendingTrade = await this.pendingTradesService.findOne(where, relations);

    if (!pendingTrade) {
      throw new HttpException(errorMessage ?? 'Pending trade not found', HttpStatus.NOT_FOUND);
    }

    return pendingTrade;
  }

  public async findPendingTradeById<
    T extends FindEntityRelationsOptions<PendingTradeEntity>,
  >(
    id: UUIDv4,
    relations?: T,
    errorMessageFn?: (id: UUIDv4) => string,
  ): Promise<PendingTradeModel<T>> {
    return this.findPendingTrade({ id }, relations, errorMessageFn?.(id) ?? `Pending trade (\`${id}\`) not found`);
  }

  private async _acceptPendingTradeById(
    user: UserModel,
    id: UUIDv4
  ): Promise<AcceptedTradeModel<{
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
  }>> {
    const pendingTrade = await this.findPendingTradeById(
      id,
      {
        sender: true,
        senderInventoryEntries: { pokemon: true },
        receiver: true,
        receiverInventoryEntries: { pokemon: true },
      },
    );

    return this._acceptPendingTrade(user, pendingTrade);
  }

  public async acceptPendingTradeById(user: UserModel, id: UUIDv4, dataSource: DataSource) {
    return dataSource.transaction((manager) => {
      return this.withTransaction(manager)._acceptPendingTradeById(user, id);
    })
  }

  private async _acceptPendingTrade(
    user: UserModel,
    pendingTrade: PendingTradeModel<{
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
    }>,
  ): Promise<AcceptedTradeModel<{
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
  }>> {
    const {
      sender,
      senderInventoryEntries,
      receiver,
      receiverInventoryEntries,
    } = pendingTrade;

    if (user.id !== receiver.id) {
      throw new HttpException('You are not a receiver of this trade', HttpStatus.CONFLICT);
    }

    await Promise.all([
      this.userInventoryEntriesUseCase.transferUserInventoryEntriesToAnotherUser(
        senderInventoryEntries,
        receiver,
      ),
      this.userInventoryEntriesUseCase.transferUserInventoryEntriesToAnotherUser(
        receiverInventoryEntries,
        sender,
      ),
    ]);

    return this.pendingTradesService.updateToAccepted(pendingTrade);
  }

  public async acceptPendingTrade(
    user: UserModel,
    pendingTrade: PendingTradeModel<{
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
    }>,
    dataSource: DataSource,
  ) {
    return dataSource.transaction((manager) => {
      return this.withTransaction(manager)._acceptPendingTrade(user, pendingTrade);
    })
  }

  private async _cancelPendingTradeById(
    user: UserModel,
    id: UUIDv4,
  ): Promise<CancelledTradeModel<{
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
  }>> {
    const pendingTrade = await this.findPendingTradeById(id, {
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
    })

    return this._cancelPendingTrade(user, pendingTrade);
  }

  public async cancelPendingTradeById(
    user: UserModel,
    id: UUIDv4,
    dataSource: DataSource,
  ) {
    return dataSource.transaction((manager) => {
      return this.withTransaction(manager)._cancelPendingTradeById(user, id);
    })
  }

  private async _cancelPendingTrade(
    user: UserModel,
    pendingTrade: PendingTradeModel<{
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
    }>
  ): Promise<CancelledTradeModel<{
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
  }>> {
    if (user.id !== pendingTrade.sender.id) {
      throw new HttpException('You cannot cancel a trade that is not yours', HttpStatus.CONFLICT);
    }

    return this.pendingTradesService.updateToCancelled(pendingTrade);
  }

  public async cancelPendingTrade(
    user: UserModel,
    pendingTrade: PendingTradeModel<{
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
    }>,
    dataSource: DataSource,
  ) {
    return dataSource.transaction((manager) => {
      return this.withTransaction(manager)._cancelPendingTrade(user, pendingTrade);
    })
  }

  private async _rejectPendingTrade(
    user: UserModel,
    pendingTrade: PendingTradeModel<{
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
    }>
  ): Promise<RejectedTradeModel<{
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
  }>> {
    if (user.id !== pendingTrade.receiver.id) {
      throw new HttpException('You cannot reject a trade that is sent to you', HttpStatus.CONFLICT);
    }

    return this.pendingTradesService.updateToRejected(pendingTrade);
  }

  public async rejectPendingTrade(
    user: UserModel,
    pendingTrade: PendingTradeModel<{
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
    }>,
    dataSource: DataSource,
  ) {
    return dataSource.transaction((manager) => {
      return this.withTransaction(manager)._rejectPendingTrade(user, pendingTrade);
    })
  }

  private async _rejectPendingTradeById(
    user: UserModel,
    id: UUIDv4,
  ): Promise<RejectedTradeModel<{
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
  }>> {
    const pendingTrade = await this.findPendingTradeById(id, {
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
    })

    return this._rejectPendingTrade(user, pendingTrade);
  }

  public async rejectPendingTradeById(
    user: UserModel,
    id: UUIDv4,
    dataSource: DataSource,
  ) {
    return dataSource.transaction((manager) => {
      return this.withTransaction(manager)._rejectPendingTradeById(user, id);
    })
  }

}
