import { Injectable } from '@nestjs/common';
import { PackModel } from 'src/infra/postgres/entities/pack.entity';
import { PokemonModel } from 'src/infra/postgres/entities/pokemon.entity';
import { UserModel } from 'src/infra/postgres/entities/user.entity';
import { OpenedPacksService } from '../services/opened-packs.service';

@Injectable()
export class OpenedPacksUseCase {
  public constructor(
    private readonly openedPacksService: OpenedPacksService,
  ) {}

  public async openPack(user: UserModel, pack: PackModel, pokemon: PokemonModel) {
    return this.openedPacksService.createOne(user, pack, pokemon);
  }
}
