import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UUIDv4 } from 'src/common/types';
import { PendingTradesUseCase } from 'src/core/use-cases/pending-trades.use-case';
import { InjectDatabase } from 'src/infra/decorators/inject-database.decorator';
import { Database } from 'src/infra/postgres/other/types';
import { AcceptedTradeEntity, CancelledTradeEntity, PendingTradeEntity, RejectedTradeEntity, UserEntity } from 'src/infra/postgres/tables';
import { User } from '../decorators/user.decorator';
import { AcceptedTradeOutputDTO } from '../dtos/accepted-trades/accepted-trade.output.dto';
import { CancelledTradeOuputDTO } from '../dtos/cancelled-trades/cancelled-trade.output.dto';
import { CreatePendingTradeInputDTO } from '../dtos/pending-trades/create-pending-trade.input.dto';
import { PendingTradeOutputDTO } from '../dtos/pending-trades/pending-trade.output.dto';
import { RejectedTradeOutputDTO } from '../dtos/rejected-trades/rejected-trade.output.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Trades')
@Controller('trades')
export class TradesController {
  public constructor(
    @InjectMapper()
    private readonly mapper: Mapper,
    @InjectDatabase()
    private readonly db: Database,

    private readonly pendingTradesUseCase: PendingTradesUseCase,
  ) {}

  @ApiCreatedResponse({ type: PendingTradeOutputDTO })
  @ApiSecurity('AccessToken')
  @Post()
  @UseGuards(JwtAuthGuard)
  public async createPendingTrade(
    @User() user: UserEntity,
    @Body() dto: CreatePendingTradeInputDTO,
  ) {
    // TODO: Return `tradesToSenderItems` and `tradesToReceiverItems` to the client
    const { pendingTrade, tradesToSenderItems, tradesToReceiverItems } = await this.db.transaction(async (tx) => (
      this.pendingTradesUseCase.createPendingTrade(user, dto, tx)
    ));

    return this.mapper.map<PendingTradeEntity, PendingTradeOutputDTO>(
      pendingTrade,
      'PendingTradeEntity',
      'PendingTradeOutputDTO',
    );
  }

  @ApiCreatedResponse({ type: AcceptedTradeOutputDTO })
  @ApiSecurity('AccessToken')
  @Post(':id/accept')
  @UseGuards(JwtAuthGuard)
  public async acceptPendingTradeById(
    @User() user: UserEntity,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: UUIDv4,
  ) {
    const acceptedTrade = await this.db.transaction(async (tx) => (
      this.pendingTradesUseCase.acceptPendingTradeById(user, id, tx)
    ));

    return this.mapper.map<AcceptedTradeEntity, AcceptedTradeOutputDTO>(
      acceptedTrade,
      'AcceptedTradeEntity',
      'AcceptedTradeOutputDTO',
    );
  }

  @ApiCreatedResponse({ type: CancelledTradeOuputDTO })
  @ApiSecurity('AccessToken')
  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  public async cancelPendingTradeById(
    @User() user: UserEntity,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: UUIDv4,
  ) {
    const cancelledTrade = await this.db.transaction(async (tx) => (
      this.pendingTradesUseCase.cancelPendingTradeById(user, id, tx)
    ));

    return this.mapper.map<CancelledTradeEntity, CancelledTradeOuputDTO>(
      cancelledTrade,
      'CancelledTradeEntity',
      'CancelledTradeOuputDTO',
    );
  }

  @ApiCreatedResponse({ type: RejectedTradeOutputDTO })
  @ApiSecurity('AccessToken')
  @Post(':id/reject')
  @UseGuards(JwtAuthGuard)
  public async rejectPendingTradeById(
    @User() user: UserEntity,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: UUIDv4,
  ) {
    const rejectedTrade = await this.db.transaction(async (tx) => (
      this.pendingTradesUseCase.rejectPendingTradeById(user, id, tx)
    ));

    return this.mapper.map<RejectedTradeEntity, RejectedTradeOutputDTO>(
      rejectedTrade,
      'RejectedTradeEntity',
      'RejectedTradeOutputDTO'
    );
  }
}
