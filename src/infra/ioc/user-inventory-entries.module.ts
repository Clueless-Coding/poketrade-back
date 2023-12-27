import { Module } from '@nestjs/common';
import { UserInventoryEntriesService } from 'src/core/services/user-inventory-entries.service';
import { UserInventoryEntriesUseCase } from 'src/core/use-cases/user-inventory-entries.service';
import { UserInventoryEntryEntity } from '../postgres/entities/user-inventory-entry.entity';
import { PostgresModule } from '../postgres/postgres.module';

@Module({
  imports: [PostgresModule.forFeature([UserInventoryEntryEntity])],
  providers: [UserInventoryEntriesUseCase, UserInventoryEntriesService],
  exports: [UserInventoryEntriesUseCase, UserInventoryEntriesService],
})
export class UserInventoryEntryModule {}
