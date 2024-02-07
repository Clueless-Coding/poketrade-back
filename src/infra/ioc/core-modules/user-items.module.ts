import { Module } from '@nestjs/common';
import { IQuickSoldItemsRepository } from 'src/core/repositories/quick-sold-items.repository';
import { IUserItemsRepository } from 'src/core/repositories/user-items.repository';
import { UserItemsService } from 'src/core/services/user-items.service';
import { PostgresModule } from '../../postgres/postgres.module';
import { UsersModule } from './users.module';
import { UserItemsRepository } from 'src/infra/postgres/repositories/user-items.repository';
import { QuickSoldItemsRepository } from 'src/infra/postgres/repositories/quick-sold-items.repository';

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
      provide: IQuickSoldItemsRepository,
      useClass: QuickSoldItemsRepository,
    },
  ],
  exports: [
    UserItemsService,
    IUserItemsRepository,
    IQuickSoldItemsRepository,
  ],
})
export class UserItemsModule {}
