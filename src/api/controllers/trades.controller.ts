import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiOkResponseWithPagination } from '../decorators/api-ok-response-with-pagination.decorator';
import { TradeOutputDTO } from '../dtos/trades/trade.output.dto';
import { AccessTokenAuthGuard } from '../guards/access-token-auth.guard';
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { TradesService } from 'src/core/services/trades.service';
import { PaginationOptionsInputDTO } from '../dtos/pagination.input.dto';
import { mapPaginatedArray } from 'src/common/helpers/map-paginated-array.helper';
import { TradeEntity } from 'src/core/entities/trade.entity';
import { UUIDv4Param } from '../decorators/uuidv4-param.decorator';
import { TradesToItemsService } from 'src/core/services/trades-to-items.service';
import { TradeToReceiverItemEntity, TradeToSenderItemEntity } from 'src/core/entities/trade-to-item.entity';
import { ItemOutputDTO } from '../dtos/items/item.output.dto';

@ApiTags('Trades')
@Controller('trades')
export class TradesController {
  public constructor(
    @InjectMapper()
    private readonly mapper: Mapper,

    private readonly tradesService: TradesService,
    private readonly tradesToItemsService: TradesToItemsService,
  ) {}

  @ApiOkResponseWithPagination({ type: TradeOutputDTO })
  @ApiBearerAuth('AccessToken')
  @Get()
  @UseGuards(AccessTokenAuthGuard)
  public async getTradesWithPagination(
    @Query() paginationOptionsDTO: PaginationOptionsInputDTO,
  ): Promise<PaginatedArray<TradeOutputDTO>> {
    const trades = await this.tradesService.getTradesWithPagination(paginationOptionsDTO);

    return mapPaginatedArray(this.mapper, trades, TradeEntity, TradeOutputDTO);
  }

  @ApiOkResponse({ type: TradeOutputDTO })
  @ApiBearerAuth('AccessToken')
  @Get(':id')
  @UseGuards(AccessTokenAuthGuard)
  public async getTradeById(
    @UUIDv4Param('id') id: UUIDv4,
  ): Promise<TradeOutputDTO> {
    const trade = await this.tradesService.getTradeById(id);

    return this.mapper.map(trade, TradeEntity, TradeOutputDTO);
  }

  @ApiOkResponseWithPagination({ type: ItemOutputDTO })
  @ApiBearerAuth('AccessToken')
  @Get(':id/sender-items')
  @UseGuards(AccessTokenAuthGuard)
  public async getTradeSenderItemsWithPaginationByTradeId(
    @UUIDv4Param('id') id: UUIDv4,
    @Query() paginationOptionsDTO: PaginationOptionsInputDTO,
  ): Promise<PaginatedArray<ItemOutputDTO>> {
    const tradesToSenderItems = await this.tradesToItemsService.getTradesToSenderItemsWithPaginationByTradeId(id, paginationOptionsDTO);

    return mapPaginatedArray(
      this.mapper,
      tradesToSenderItems,
      TradeToSenderItemEntity,
      ItemOutputDTO,
    );
  }

  @ApiOkResponseWithPagination({ type: ItemOutputDTO })
  @ApiBearerAuth('AccessToken')
  @Get(':id/receiver-items')
  @UseGuards(AccessTokenAuthGuard)
  public async getTradeReceiverItemsWithPaginationByTradeId(
    @UUIDv4Param('id') id: UUIDv4,
    @Query() paginationOptionsDTO: PaginationOptionsInputDTO,
  ): Promise<PaginatedArray<ItemOutputDTO>> {
    const tradesToReceiverItems = await this.tradesToItemsService.getTradesToReceiverItemsWithPaginationByTradeId(id, paginationOptionsDTO);

    return mapPaginatedArray(
      this.mapper,
      tradesToReceiverItems,
      TradeToReceiverItemEntity,
      ItemOutputDTO,
    );
  }
}
