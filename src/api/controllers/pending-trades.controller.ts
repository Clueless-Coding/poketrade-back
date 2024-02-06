import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { UUIDv4 } from 'src/common/types';
import { PendingTradesService } from 'src/core/services/pending-trades.service';
import { AcceptedTradeEntity, CancelledTradeEntity, PendingTradeEntity, RejectedTradeEntity } from 'src/core/entities/trade.entity';
import { UserEntity } from 'src/core/entities/user.entity';
import { User } from '../decorators/user.decorator';
import { AcceptedTradeOutputDTO } from '../dtos/accepted-trades/accepted-trade.output.dto';
import { CancelledTradeOuputDTO } from '../dtos/cancelled-trades/cancelled-trade.output.dto';
import { CreatePendingTradeInputDTO } from '../dtos/pending-trades/create-pending-trade.input.dto';
import { PendingTradeOutputDTO } from '../dtos/pending-trades/pending-trade.output.dto';
import { RejectedTradeOutputDTO } from '../dtos/rejected-trades/rejected-trade.output.dto';
import { AccessTokenAuthGuard } from '../guards/access-token-auth.guard';
import { UUIDv4Param } from '../decorators/uuidv4-param.decorator';
import { CreatePendingTradeOutputDTO } from '../dtos/pending-trades/create-pending-trade.output.dto';
import { TradeToReceiverItemEntity, TradeToSenderItemEntity } from 'src/core/entities/trade-to-user-item.entity';
import { UserItemOutputDTO } from '../dtos/user-items/user-item.output.dto';

@ApiTags('Pending Trades')
@Controller('pending-trades')
export class PendingTradesController {
  public constructor(
    @InjectMapper()
    private readonly mapper: Mapper,

    private readonly pendingTradesService: PendingTradesService,
  ) {}

  @ApiCreatedResponse({ type: CreatePendingTradeOutputDTO })
  @ApiBearerAuth('AccessToken')
  @Post()
  @UseGuards(AccessTokenAuthGuard)
  public async createPendingTrade(
    @User() user: UserEntity,
    @Body() dto: CreatePendingTradeInputDTO,
  ): Promise<CreatePendingTradeOutputDTO> {
    const { pendingTrade, tradesToSenderItems, tradesToReceiverItems } = await this.pendingTradesService.createPendingTrade(user, dto);

    return {
      pendingTrade: this.mapper.map(pendingTrade, PendingTradeEntity, PendingTradeOutputDTO),
      senderItems: this.mapper.mapArray(tradesToSenderItems, TradeToSenderItemEntity, UserItemOutputDTO),
      receiverItems: this.mapper.mapArray(tradesToReceiverItems, TradeToReceiverItemEntity, UserItemOutputDTO),
    };
  }

  @ApiCreatedResponse({ type: CancelledTradeOuputDTO })
  @ApiBearerAuth('AccessToken')
  @Post(':id/cancel')
  @UseGuards(AccessTokenAuthGuard)
  public async cancelPendingTradeById(
    @User() user: UserEntity,
    @UUIDv4Param('id') id: UUIDv4,
  ) {
    const cancelledTrade = await this.pendingTradesService.cancelPendingTradeById(user, id)

    return this.mapper.map(
      cancelledTrade,
      CancelledTradeEntity,
      CancelledTradeOuputDTO,
    );
  }

  @ApiCreatedResponse({ type: AcceptedTradeOutputDTO })
  @ApiBearerAuth('AccessToken')
  @Post(':id/accept')
  @UseGuards(AccessTokenAuthGuard)
  public async acceptPendingTradeById(
    @User() user: UserEntity,
    @UUIDv4Param('id') id: UUIDv4,
  ) {
    const acceptedTrade = await this.pendingTradesService.acceptPendingTradeById(user, id);

    return this.mapper.map(
      acceptedTrade,
      AcceptedTradeEntity,
      AcceptedTradeOutputDTO,
    );
  }

  @ApiCreatedResponse({ type: RejectedTradeOutputDTO })
  @ApiBearerAuth('AccessToken')
  @Post(':id/reject')
  @UseGuards(AccessTokenAuthGuard)
  public async rejectPendingTradeById(
    @User() user: UserEntity,
    @UUIDv4Param('id') id: UUIDv4,
  ) {
    const rejectedTrade = await this.pendingTradesService.rejectPendingTradeById(user, id);

    return this.mapper.map(
      rejectedTrade,
      RejectedTradeEntity,
      RejectedTradeOutputDTO,
    );
  }
}
