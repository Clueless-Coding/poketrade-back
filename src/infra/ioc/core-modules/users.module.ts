import { Module } from '@nestjs/common';
import { PostgresModule } from '../../postgres/postgres.module';
import { UsersRepository } from 'src/core/repositories/users.repository';
import { UsersService } from 'src/core/services/users.service';

@Module({
  imports: [PostgresModule],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
