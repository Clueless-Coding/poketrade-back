import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserModel } from 'src/infra/postgres/entities/user.entity';
import { PokemonsUseCase } from './pokemons.use-case';
import { UsersUseCase } from './users.use-case';

const PACK_PRICE = 10;

@Injectable()
export class PacksUseCase {
  public constructor(
    private readonly pokemonsUseCase: PokemonsUseCase,
    private readonly usersUseCase: UsersUseCase,
  ) {}

  public async openPack(user: UserModel) {
    const pokemon = await this.pokemonsUseCase.getRandom();

    if (user.balance < PACK_PRICE) {
      throw new HttpException('Insufficient funds', HttpStatus.CONFLICT);
    }

    // TODO: introduce transactions;
    user = await this.usersUseCase.updateUser(user, { balance: user.balance - 10 });

    let isDuplicate;
    ({ user, isDuplicate } = await this.usersUseCase.addPokemonToCollection(
      // TODO: Get rid of this preload, and try to update pokemons of the user
      // without needing `pokemons` field in `UserModel`
      await this.usersUseCase.preload(user, ['pokemons']),
      pokemon,
    ));

    return { user, pokemon, isDuplicate };
  }
}
