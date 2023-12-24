import { Module } from '@nestjs/common';
import { PostgresModule } from '../postgres/postgres.module';
import { PokemonsModule } from './pokemons.module';
import { PacksUseCase } from 'src/core/use-cases/packs.use-case';
import { UsersModule } from './users.module';
import { PacksService } from 'src/core/services/packs.service';
import { PackEntity } from '../postgres/entities/pack.entity';

@Module({
  imports: [PostgresModule.forFeature([PackEntity]), PokemonsModule, UsersModule],
  providers: [PacksUseCase, PacksService],
  exports: [PacksUseCase, PacksService],
})
export class PacksModule {}
