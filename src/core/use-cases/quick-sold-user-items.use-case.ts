import { Injectable } from '@nestjs/common';
import {
  PokemonEntity,
  QuickSoldUserItemEntity,
  UserEntity,
  UserItemEntity,
} from 'src/infra/postgres/other/types';
import { QuickSoldUserItemsService } from '../services/quick-sold-user-items.service';

@Injectable()
export class QuickSoldUserItemsUseCase {
  public constructor(
    private readonly quickSoldUserItemsService: QuickSoldUserItemsService,
  ) {}

  public async createQuickSoldUserItem(
    userItem: UserItemEntity,
    user: UserEntity,
    pokemon: PokemonEntity,
  ): Promise<QuickSoldUserItemEntity<{ user: true, pokemon: true }>> {
    return this.quickSoldUserItemsService
      .createOne({
        id: userItem.id,
        userId: user.id,
        pokemonId: pokemon.id,
      })
      .then((quickSoldUserItem) => ({
        ...quickSoldUserItem,
        user,
        pokemon,
      }));
  }
}
