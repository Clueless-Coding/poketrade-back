import { Module } from '@nestjs/common';
import { PostgresModule } from '../postgres/postgres.module';
import { PokemonsModule } from './pokemons.module';
import { PacksUseCase } from 'src/core/use-cases/packs.use-case';
import { UsersModule } from './users.module';
import { PacksService } from 'src/core/services/packs.service';
import { PackEntity } from '../postgres/entities/pack.entity';
import { OpenedPacksUseCase } from 'src/core/use-cases/opened-packs.use-case';
import { OpenedPacksService } from 'src/core/services/opened-packs.service';
import { OpenedPackEntity } from '../postgres/entities/opened-pack.entity';
import { UserInventoryEntriesModule } from './user-inventory-entries.module';

@Module({
  imports: [
    PostgresModule.forFeature([PackEntity, OpenedPackEntity]),
    PokemonsModule,
    UsersModule,
    UserInventoryEntriesModule,
  ],
  providers: [PacksUseCase, PacksService, OpenedPacksUseCase, OpenedPacksService],
  exports: [PacksUseCase, PacksService, OpenedPacksUseCase, OpenedPacksService],
})
export class PacksModule {}
