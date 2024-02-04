import { Module } from '@nestjs/common';
import { IQuickSoldUserItemsRepository } from 'src/core/repositories/quick-sold-user-items.repository';
import { IUserItemsRepository } from 'src/core/repositories/user-items.repository';
import { UserItemsService } from 'src/core/services/user-items.service';
import { PostgresModule } from '../../postgres/postgres.module';
import { UsersModule } from './users.module';
import { UserItemsRepository } from 'src/infra/postgres/repositories/user-items.repository';
import { QuickSoldUserItemsRepository } from 'src/infra/postgres/repositories/quick-sold-user-items.repository';

@Module({
  imports: [
    PostgresModule,
    UsersModule,
  ],
  providers: [
    UserItemsService,
    {
      provide: IUserItemsRepository,
      useClass: UserItemsRepository,
    },
    {
      provide: IQuickSoldUserItemsRepository,
      useClass: QuickSoldUserItemsRepository,
    },
  ],
  exports: [
    UserItemsService,
    IUserItemsRepository,
    IQuickSoldUserItemsRepository,
  ],
})
export class UserItemsModule {}
