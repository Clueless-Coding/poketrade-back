import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserModel } from 'src/infra/postgres/entities/user.entity';
import { PokemonsUseCase } from './pokemons.use-case';
import { UsersUseCase } from './users.use-case';
import { UUIDv4 } from 'src/common/types';
import { PacksService } from '../services/packs.service';
import { DataSource, FindOptionsWhere } from 'typeorm';
import { PackEntity, PackEntityRelations, PackModel } from 'src/infra/postgres/entities/pack.entity';
import { randomChoice } from 'src/common/helpers/random-choice.helper';
import { TransactionFor } from 'nest-transact';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class PacksUseCase extends TransactionFor<PacksUseCase> {
  public constructor(
    private readonly packsService: PacksService,
    private readonly pokemonsUseCase: PokemonsUseCase,
    private readonly usersUseCase: UsersUseCase,

    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  public async getPack(
    where: FindOptionsWhere<PackEntity>,
  ): Promise<PackModel<'pokemons'>> {
    const pack = await this.packsService.findOne(where, ['pokemons']);

    if (!pack) {
      throw new HttpException('Pack not found', HttpStatus.NOT_FOUND);
    }

    return pack;
  }

  private async getRandomPokemonFromPack(pack: PackModel<'pokemons'>) {
    const pokemon = randomChoice(pack.pokemons);

    if (!pokemon) {
      throw new HttpException(
        'There are no pokemons in the pack. Please notify the developer about it :)',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return pokemon;
  }

  private async _openPack(user: UserModel, id: UUIDv4) {
    const pack = await this.getPack({ id });
    const pokemon = await this.getRandomPokemonFromPack(pack);

    if (user.balance < pack.price) {
      throw new HttpException('Insufficient balance', HttpStatus.CONFLICT);
    }

    user = await this.usersUseCase.updateUser(user, { balance: user.balance - pack.price });

    let isDuplicate;
    ({ user, isDuplicate } = await this.usersUseCase.addPokemonToCollection(
      // TODO: Get rid of this preload, and try to update pokemons of the user
      // without needing `pokemons` field in `UserModel`
      await this.usersUseCase.preload(user, ['pokemons']),
      pokemon,
    ));

    return { user, pokemon, isDuplicate };
  }

  public async openPack(user: UserModel, id: UUIDv4, dataSource: DataSource) {
    return dataSource.transaction((manager) => {
      return this.withTransaction(manager)._openPack(user, id);
    })
  }
}
