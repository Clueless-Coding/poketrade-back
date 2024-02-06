import { Module } from '@nestjs/common';
import { PostgresModule } from '../../postgres/postgres.module';
import { PokemonsModule } from './pokemons.module';
import { PacksService } from 'src/core/services/packs.service';
import { UsersModule } from './users.module';
import { IPacksRepository } from 'src/core/repositories/packs.repository';
import { IOpenedPacksRepository } from 'src/core/repositories/opened-packs.repository';
import { UserItemsModule } from './user-items.module';
import { OpenedPacksRepository } from 'src/infra/postgres/repositories/opened-pack.repository';
import { PacksRepository } from 'src/infra/postgres/repositories/packs.repository';
import { PacksToPokemonsService } from 'src/core/services/packs-to-pokemons.service';
import { IPacksToPokemonsRepository } from 'src/core/repositories/packs-to-pokemons.repository';
import { PacksToPokemonsRepository } from 'src/infra/postgres/repositories/packs-to-pokemons.repository';

@Module({
  imports: [
    PostgresModule,
    PokemonsModule,
    UsersModule,
    UserItemsModule,
  ],
  providers: [
    PacksService,
    PacksToPokemonsService,
    {
      provide: IPacksRepository,
      useClass: PacksRepository,
    },
    {
      provide: IOpenedPacksRepository,
      useClass: OpenedPacksRepository,
    },
    {
      provide: IPacksToPokemonsRepository,
      useClass: PacksToPokemonsRepository,
    },
  ],
  exports: [
    PacksService,
    PacksToPokemonsService,
    IPacksRepository,
    IOpenedPacksRepository,
    IPacksToPokemonsRepository,
  ],
})
export class PacksModule {}
