import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTradeEntityFields, TradeEntity, TradeModel } from 'src/infra/postgres/entities/trade.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TradesService {
  public constructor(
    @InjectRepository(TradeEntity)
    private readonly tradesRepository: Repository<TradeEntity>,
  ) {}

  public async createOne(fields: CreateTradeEntityFields): Promise<TradeModel> {
    const trade = this.tradesRepository.create(fields);

    return this.tradesRepository.save(trade);
  }
}
