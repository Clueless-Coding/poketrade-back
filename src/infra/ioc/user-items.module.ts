import { Module } from '@nestjs/common';
import { QuickSoldUserItemsService } from 'src/core/services/quick-sold-user-items.service';
import { UserItemsService } from 'src/core/services/user-items.service';
import { UserItemsUseCase } from 'src/core/use-cases/user-items.use-case';
import { PostgresModule } from '../postgres/postgres.module';
import { UsersModule } from './users.module';

@Module({
  imports: [
    PostgresModule,
    UsersModule,
  ],
  providers: [
    UserItemsUseCase,
    UserItemsService,
    QuickSoldUserItemsService,
  ],
  exports: [
    UserItemsUseCase,
    UserItemsService,
    QuickSoldUserItemsService,
  ],
})
export class UserItemsModule {}
