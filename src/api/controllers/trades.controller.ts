import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UUIDv4 } from 'src/common/types';
import { PendingTradesService } from 'src/core/services/pending-trades.service';
import { AcceptedTradeEntity, CancelledTradeEntity, PendingTradeEntity, RejectedTradeEntity, UserEntity } from 'src/infra/postgres/tables';
import { User } from '../decorators/user.decorator';
import { AcceptedTradeOutputDTO } from '../dtos/accepted-trades/accepted-trade.output.dto';
import { CancelledTradeOuputDTO } from '../dtos/cancelled-trades/cancelled-trade.output.dto';
import { CreatePendingTradeInputDTO } from '../dtos/pending-trades/create-pending-trade.input.dto';
import { PendingTradeOutputDTO } from '../dtos/pending-trades/pending-trade.output.dto';
import { RejectedTradeOutputDTO } from '../dtos/rejected-trades/rejected-trade.output.dto';
import { AccessTokenAuthGuard } from '../guards/access-token-auth.guard';

@ApiTags('Trades')
@Controller('trades')
export class TradesController {
  public constructor(
    @InjectMapper()
    private readonly mapper: Mapper,

    private readonly pendingTradesService: PendingTradesService,
  ) {}

  @ApiCreatedResponse({ type: PendingTradeOutputDTO })
  @ApiSecurity('AccessToken')
  @Post()
  @UseGuards(AccessTokenAuthGuard)
  public async createPendingTrade(
    @User() user: UserEntity,
    @Body() dto: CreatePendingTradeInputDTO,
  ): Promise<PendingTradeOutputDTO> {
    const pendingTrade = await this.pendingTradesService.createPendingTrade(user, dto);

    return this.mapper.map<PendingTradeEntity, PendingTradeOutputDTO>(
      pendingTrade,
      'PendingTradeEntity',
      'PendingTradeOutputDTO',
    );
  }

  @ApiCreatedResponse({ type: CancelledTradeOuputDTO })
  @ApiSecurity('AccessToken')
  @Post(':id/cancel')
  @UseGuards(AccessTokenAuthGuard)
  public async cancelPendingTradeById(
    @User() user: UserEntity,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: UUIDv4,
  ) {
    const cancelledTrade = await this.pendingTradesService.cancelPendingTradeById(user, id)

    return this.mapper.map<CancelledTradeEntity, CancelledTradeOuputDTO>(
      cancelledTrade,
      'CancelledTradeEntity',
      'CancelledTradeOuputDTO',
    );
  }

  @ApiCreatedResponse({ type: AcceptedTradeOutputDTO })
  @ApiSecurity('AccessToken')
  @Post(':id/accept')
  @UseGuards(AccessTokenAuthGuard)
  public async acceptPendingTradeById(
    @User() user: UserEntity,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: UUIDv4,
  ) {
    const acceptedTrade = await this.pendingTradesService.acceptPendingTradeById(user, id);

    return this.mapper.map<AcceptedTradeEntity, AcceptedTradeOutputDTO>(
      acceptedTrade,
      'AcceptedTradeEntity',
      'AcceptedTradeOutputDTO',
    );
  }

  @ApiCreatedResponse({ type: RejectedTradeOutputDTO })
  @ApiSecurity('AccessToken')
  @Post(':id/reject')
  @UseGuards(AccessTokenAuthGuard)
  public async rejectPendingTradeById(
    @User() user: UserEntity,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: UUIDv4,
  ) {
    const rejectedTrade = await this.pendingTradesService.rejectPendingTradeById(user, id);

    return this.mapper.map<RejectedTradeEntity, RejectedTradeOutputDTO>(
      rejectedTrade,
      'RejectedTradeEntity',
      'RejectedTradeOutputDTO'
    );
  }
}
