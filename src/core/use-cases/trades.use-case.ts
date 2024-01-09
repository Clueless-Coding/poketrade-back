import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTradeInputDTO } from 'src/api/dtos/trades/create-trade.input.dto';
import { TradeStatus } from 'src/infra/postgres/entities/trade.entity';
import { UserModel } from 'src/infra/postgres/entities/user.entity';
import { TradesService } from '../services/trades.service';
import { UserInventoryEntriesUseCase } from './user-inventory-entries.use-case';
import { UsersUseCase } from './users.use-case';

@Injectable()
export class TradesUseCase {
  public constructor(
    private readonly tradesService: TradesService,
    private readonly usersUseCase: UsersUseCase,
    private readonly userInventoryEntriesUseCase: UserInventoryEntriesUseCase,
  ) {}

  public async createTrade(sender: UserModel, dto: CreateTradeInputDTO) {
    const [senderInventoryEntries, receiver, receiverInventoryEntries, ] = await Promise.all([
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

    for (const receiverInventoryEntry of receiverInventoryEntries) {
      if (receiverInventoryEntry.user.id !== receiver.id) {
        throw new HttpException(
          `Trade receiver inventory entry (\`${receiverInventoryEntry.id}\`) does not belong to them`,
          HttpStatus.CONFLICT,
        );
      }
    }

    for (const senderInventoryEntry of receiverInventoryEntries) {
      if (senderInventoryEntry.user.id !== receiver.id) {
        throw new HttpException(
          `Trade sender inventory entry (\`${senderInventoryEntry.id}\`) does not belong to them`,
          HttpStatus.CONFLICT,
        );
      }
    }

    return this.tradesService.createOne({
      status: TradeStatus.PENDING,
      sender,
      senderInventoryEntries,
      receiver,
      receiverInventoryEntries,
    });
  }
}
