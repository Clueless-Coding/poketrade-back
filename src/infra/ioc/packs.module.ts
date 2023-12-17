import { Module } from '@nestjs/common';
import { PostgresModule } from '../postgres/postgres.module';
import { PokemonsModule } from './pokemons.module';
import { PacksUseCase } from 'src/core/use-cases/packs.use-case';
import { UsersModule } from './users.module';

@Module({
  imports: [PostgresModule, PokemonsModule, UsersModule],
  providers: [PacksUseCase],
  exports: [PacksUseCase],
})
export class PacksModule {}
