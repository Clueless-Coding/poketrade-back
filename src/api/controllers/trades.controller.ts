import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { TradesUseCase } from 'src/core/use-cases/trades.use-case';
import { TradeEntity } from 'src/infra/postgres/entities/trade.entity';
import { UserModel } from 'src/infra/postgres/entities/user.entity';
import { User } from '../decorators/user.decorator';
import { CreateTradeInputDTO } from '../dtos/trades/create-trade.input.dto';
import { TradeOutputDTO } from '../dtos/trades/trade.output.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Trades')
@Controller('trades')
export class TradesController {
  public constructor(
    @InjectMapper()
    private readonly mapper: Mapper,

    private readonly tradesUseCase: TradesUseCase,
  ) {}

  @ApiCreatedResponse({ type: TradeOutputDTO })
  @ApiSecurity('AccessToken')
  @Post()
  @UseGuards(JwtAuthGuard)
  public async createTrade(
    @User() user: UserModel,
    @Body() dto: CreateTradeInputDTO,
  ) {
    const trade = await this.tradesUseCase.createTrade(user, dto);

    return this.mapper.map(trade, TradeEntity, TradeOutputDTO);
  }
}
