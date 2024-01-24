import { Module } from '@nestjs/common';
import { PostgresModule } from '../postgres/postgres.module';
import { UsersService } from 'src/core/services/users.service';
import { UsersUseCase } from 'src/core/use-cases/users.use-case';

@Module({
  imports: [PostgresModule],
  providers: [UsersUseCase, UsersService],
  exports: [UsersUseCase, UsersService],
})
export class UsersModule {}
