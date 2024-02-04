import { Module } from '@nestjs/common';
import { PostgresModule } from '../../postgres/postgres.module';
import { IUsersRepository } from 'src/core/repositories/users.repository';
import { UsersService } from 'src/core/services/users.service';
import { UsersRepository } from 'src/infra/postgres/repositories/users.repository';

@Module({
  imports: [PostgresModule],
  providers: [
    UsersService,
    {
      provide: IUsersRepository,
      useClass: UsersRepository,
    },
  ],
  exports: [UsersService, IUsersRepository],
})
export class UsersModule {}
