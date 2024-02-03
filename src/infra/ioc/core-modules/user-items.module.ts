import { Module } from '@nestjs/common';
import { QuickSoldUserItemsRepository } from 'src/core/repositories/quick-sold-user-items.repository';
import { UserItemsRepository } from 'src/core/repositories/user-items.repository';
import { UserItemsService } from 'src/core/services/user-items.service';
import { PostgresModule } from '../../postgres/postgres.module';
import { UsersModule } from './users.module';

@Module({
  imports: [
    PostgresModule,
    UsersModule,
  ],
  providers: [
    UserItemsService,
    UserItemsRepository,
    QuickSoldUserItemsRepository,
  ],
  exports: [
    UserItemsService,
    UserItemsRepository,
    QuickSoldUserItemsRepository,
  ],
})
export class UserItemsModule {}
