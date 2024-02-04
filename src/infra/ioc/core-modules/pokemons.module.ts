import { Module } from '@nestjs/common';
import { PostgresModule } from '../../postgres/postgres.module';
import { PokemonsService } from 'src/core/services/pokemons.service';
import { IPokemonsRepository } from 'src/core/repositories/pokemons.repository';
import { PokemonsRepository } from 'src/infra/postgres/repositories/pokemons.repository';

@Module({
  imports: [PostgresModule],
  providers: [
    PokemonsService,
    {
      provide: IPokemonsRepository,
      useClass: PokemonsRepository,
    },
  ],
  exports: [PokemonsService, IPokemonsRepository],
})
export class PokemonsModule {}
