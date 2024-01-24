import { Module } from '@nestjs/common';
import { PostgresModule } from '../postgres/postgres.module';
import { PokemonsModule } from './pokemons.module';
import { PacksUseCase } from 'src/core/use-cases/packs.use-case';
import { UsersModule } from './users.module';
import { PacksService } from 'src/core/services/packs.service';
import { OpenedPacksService } from 'src/core/services/opened-packs.service';
import { UserItemsModule } from './user-items.module';

@Module({
  imports: [
    PostgresModule,
    PokemonsModule,
    UsersModule,
    UserItemsModule,
  ],
  providers: [PacksUseCase, PacksService, OpenedPacksService],
  exports: [PacksUseCase, PacksService, OpenedPacksService],
})
export class PacksModule {}
