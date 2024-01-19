import { Injectable } from '@nestjs/common';
import { UserEntity, PackEntity, PokemonEntity, OpenedPackEntity, Transaction } from 'src/infra/postgres/other/types';
import { OpenedPacksService } from '../services/opened-packs.service';

@Injectable()
export class OpenedPacksUseCase {
  public constructor(
    private readonly openedPacksService: OpenedPacksService,
  ) {}

  public async createOpenedPack(
    user: UserEntity,
    pack: PackEntity,
    pokemon: PokemonEntity,
    tx?: Transaction,
  ): Promise<OpenedPackEntity<{
    user: true,
    pack: true,
    pokemon: true,
  }>> {
    return this.openedPacksService
      .createOne({
        userId: user.id,
        packId: pack.id,
        pokemonId: pokemon.id,
      }, tx)
      .then((openedPack) => ({
        ...openedPack,
        user,
        pack,
        pokemon,
      }))
  }
}
