import { Module } from '@nestjs/common';
import { PostgresModule } from '../postgres/postgres.module';
import { UserEntity } from '../postgres/entities/user.entity';
import { UsersService } from 'src/core/services/users.service';
import { UsersUseCase } from 'src/core/use-cases/users.use-case';
import { UserPokemonEntity } from '../postgres/entities/user-pokemon.entity';

@Module({
  imports: [PostgresModule.forFeature([UserEntity, UserPokemonEntity])],
  providers: [UsersUseCase, UsersService],
  exports: [UsersUseCase, UsersService],
})
export class UsersModule {}
