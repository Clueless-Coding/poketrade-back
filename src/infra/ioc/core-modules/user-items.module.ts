import { Module } from '@nestjs/common';
import { QuickSoldUserItemsRepository } from 'src/core/repositories/quick-sold-user-items.repository';
import { UserItemsRepository } from 'src/core/repositories/user-items.repository';
import { UserItemsUseCase } from 'src/core/use-cases/user-items.use-case';
import { PostgresModule } from '../../postgres/postgres.module';
import { UsersModule } from './users.module';

@Module({
  imports: [
    PostgresModule,
    UsersModule,
  ],
  providers: [
    UserItemsUseCase,
    UserItemsRepository,
    QuickSoldUserItemsRepository,
  ],
  exports: [
    UserItemsUseCase,
    UserItemsRepository,
    QuickSoldUserItemsRepository,
  ],
})
export class UserItemsModule {}
