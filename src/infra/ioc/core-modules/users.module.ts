import { Module } from '@nestjs/common';
import { PostgresModule } from '../../postgres/postgres.module';
import { UsersRepository } from 'src/core/repositories/users.repository';
import { UsersUseCase } from 'src/core/use-cases/users.use-case';

@Module({
  imports: [PostgresModule],
  providers: [UsersUseCase, UsersRepository],
  exports: [UsersUseCase, UsersRepository],
})
export class UsersModule {}
