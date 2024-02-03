import { Module } from '@nestjs/common';
import { PostgresModule } from '../../postgres/postgres.module';
import { PokemonsService } from 'src/core/services/pokemons.service';
import { PokemonsRepository } from 'src/core/repositories/pokemons.repository';

@Module({
  imports: [PostgresModule],
  providers: [PokemonsService, PokemonsRepository],
  exports: [PokemonsService, PokemonsRepository],
})
export class PokemonsModule {}
