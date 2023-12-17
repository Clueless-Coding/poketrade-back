import { Module } from '@nestjs/common';
import { PostgresModule } from '../postgres/postgres.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PokemonEntity } from '../postgres/entities/pokemon.entity';
import { PokemonsUseCase } from 'src/core/use-cases/pokemons.use-case';
import { PokemonsService } from 'src/core/services/pokemons.service';

@Module({
  imports: [PostgresModule, TypeOrmModule.forFeature([PokemonEntity])],
  providers: [PokemonsUseCase, PokemonsService],
  exports: [PokemonsUseCase, PokemonsService],
})
export class PokemonsModule {}
