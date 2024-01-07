import { Module } from '@nestjs/common';
import { QuickSoldUserInventoryEntriesService } from 'src/core/services/quick-sold-user-inventory-entries.service';
import { UserInventoryEntriesService } from 'src/core/services/user-inventory-entries.service';
import { UserInventoryEntriesUseCase } from 'src/core/use-cases/user-inventory-entries.use-case';
import { QuickSoldUserInventoryEntryEntity } from '../postgres/entities/quick-sold-user-inventory-entry.entity';
import { UserInventoryEntryEntity } from '../postgres/entities/user-inventory-entry.entity';
import { PostgresModule } from '../postgres/postgres.module';
import { UsersModule } from './users.module';

@Module({
  imports: [
    PostgresModule.forFeature([
      UserInventoryEntryEntity,
      QuickSoldUserInventoryEntryEntity,
    ]),
    UsersModule,
  ],
  providers: [
    UserInventoryEntriesUseCase,
    UserInventoryEntriesService,
    QuickSoldUserInventoryEntriesService,
  ],
  exports: [
    UserInventoryEntriesUseCase,
    UserInventoryEntriesService,
    QuickSoldUserInventoryEntriesService,
  ],
})
export class UserInventoryEntriesModule {}
