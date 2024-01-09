import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UUIDv4 } from 'src/common/types';
import { PendingTradesUseCase } from 'src/core/use-cases/pending-trades.use-case';
import { AcceptedTradeEntity } from 'src/infra/postgres/entities/accepted-trade.entity';
import { PendingTradeEntity } from 'src/infra/postgres/entities/pending-trade.entity';
import { UserModel } from 'src/infra/postgres/entities/user.entity';
import { DataSource } from 'typeorm';
import { User } from '../decorators/user.decorator';
import { AcceptedTradeOutputDTO } from '../dtos/accepted-trades/accepted-trade.output.dto';
import { CreatePendingTradeInputDTO } from '../dtos/pending-trades/create-pending-trade.input.dto';
import { PendingTradeOutputDTO } from '../dtos/pending-trades/pending-trade.output.dto';
import { TradeOutputDTO } from '../dtos/trades/trade.output.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Trades')
@Controller('trades')
export class TradesController {
  public constructor(
    @InjectMapper()
    private readonly mapper: Mapper,

    private readonly pendingTradesUseCase: PendingTradesUseCase,
    private readonly dataSource: DataSource,
  ) {}

  @ApiCreatedResponse({ type: TradeOutputDTO })
  @ApiSecurity('AccessToken')
  @Post()
  @UseGuards(JwtAuthGuard)
  public async createPendingTrade(
    @User() user: UserModel,
    @Body() dto: CreatePendingTradeInputDTO,
  ) {
    const pendingTrade = await this.pendingTradesUseCase.createPendingTrade(user, dto);

    return this.mapper.map(pendingTrade, PendingTradeEntity, PendingTradeOutputDTO);
  }

  @ApiCreatedResponse()
  @ApiSecurity('AccessToken')
  @Post(':id/accept')
  @UseGuards(JwtAuthGuard)
  public async acceptPendingTradeById(
    @User() user: UserModel,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: UUIDv4,
  ) {
    const acceptedTrade = await this.pendingTradesUseCase.acceptPendingTradeById(user, id, this.dataSource);

    return this.mapper.map(acceptedTrade, AcceptedTradeEntity, AcceptedTradeOutputDTO);
  }
}
