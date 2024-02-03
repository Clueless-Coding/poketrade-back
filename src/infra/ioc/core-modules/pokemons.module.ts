import { Module } from '@nestjs/common';
import { PostgresModule } from '../../postgres/postgres.module';
import { PokemonsUseCase } from 'src/core/use-cases/pokemons.use-case';
import { PokemonsRepository } from 'src/core/repositories/pokemons.repository';

@Module({
  imports: [PostgresModule],
  providers: [PokemonsUseCase, PokemonsRepository],
  exports: [PokemonsUseCase, PokemonsRepository],
})
export class PokemonsModule {}
