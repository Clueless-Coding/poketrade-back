import { Module } from '@nestjs/common';
import { PostgresModule } from '../../postgres/postgres.module';
import { PokemonsModule } from './pokemons.module';
import { PacksService } from 'src/core/services/packs.service';
import { UsersModule } from './users.module';
import { PacksRepository } from 'src/core/repositories/packs.repository';
import { OpenedPacksRepository } from 'src/core/repositories/opened-packs.repository';
import { UserItemsModule } from './user-items.module';

@Module({
  imports: [
    PostgresModule,
    PokemonsModule,
    UsersModule,
    UserItemsModule,
  ],
  providers: [PacksService, PacksRepository, OpenedPacksRepository],
  exports: [PacksService, PacksRepository, OpenedPacksRepository],
})
export class PacksModule {}
