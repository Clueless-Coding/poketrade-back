import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateQuickSoldUserInventoryEntryEntityFields,
  QuickSoldUserInventoryEntryEntity,
  QuickSoldUserInventoryEntryModel,
} from 'src/infra/postgres/entities/quick-sold-user-inventory-entry.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QuickSoldUserInventoryEntriesService {
  public constructor(
    @InjectRepository(QuickSoldUserInventoryEntryEntity)
    private readonly quickSoldUserInventoryEntriesRepository: Repository<QuickSoldUserInventoryEntryEntity>,
  ) {}

  public async createOne(
    fields: CreateQuickSoldUserInventoryEntryEntityFields,
  ): Promise<QuickSoldUserInventoryEntryModel<{ user: true, pokemon: true }>> {
    const quickSoldUserInventoryEntry = this.quickSoldUserInventoryEntriesRepository.create(fields);

    return this.quickSoldUserInventoryEntriesRepository.save(quickSoldUserInventoryEntry);
  }
}
