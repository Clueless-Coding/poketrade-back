import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePendingTradeEntityFields, PendingTradeEntity, PendingTradeModel } from 'src/infra/postgres/entities/pending-trade.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TradesService {
  public constructor(
    @InjectRepository(PendingTradeEntity)
    private readonly pendingTradesRepository: Repository<PendingTradeEntity>,
  ) {}
}
