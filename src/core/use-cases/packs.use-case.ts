import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserModel } from 'src/infra/postgres/entities/user.entity';
import { UsersUseCase } from './users.use-case';
import { UUIDv4 } from 'src/common/types';
import { PacksService } from '../services/packs.service';
import { DataSource } from 'typeorm';
import { PackModel } from 'src/infra/postgres/entities/pack.entity';
import { randomChoice } from 'src/common/helpers/random-choice.helper';
import { TransactionFor } from 'nest-transact';
import { ModuleRef } from '@nestjs/core';
import { OpenedPacksUseCase } from './opened-packs.use-case';

@Injectable()
export class PacksUseCase extends TransactionFor<PacksUseCase> {
  public constructor(
    private readonly packsService: PacksService,
    private readonly usersUseCase: UsersUseCase,
    private readonly openedPacksUseCase: OpenedPacksUseCase,

    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  public async getPacks(): Promise<Array<PackModel>> {
    return this.packsService.find();
  }

  public async getPack(id: UUIDv4): Promise<PackModel<{ pokemons: true }>> {
    const pack = await this.packsService.findOne({ id }, { pokemons: true });

    if (!pack) {
      throw new HttpException('Pack not found', HttpStatus.NOT_FOUND);
    }

    return pack;
  }

  private getRandomPokemonFromPack(pack: PackModel<{ pokemons: true }>) {
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
    const pack = await this.getPack(id);

    if (user.balance < pack.price) {
      throw new HttpException('Insufficient balance', HttpStatus.CONFLICT);
    }

    const pokemon = this.getRandomPokemonFromPack(pack);

    user = await this.usersUseCase.spendUserBalance(user, pack.price);

    const userPokemon = await this.usersUseCase.addPokemonToInventory(
      user,
      pokemon,
    );

    const openedPack = await this.openedPacksUseCase.openPack(userPokemon.user, pack, pokemon);

    return openedPack;
  }

  public async openPack(user: UserModel, id: UUIDv4, dataSource: DataSource) {
    return dataSource.transaction((manager) => {
      return this.withTransaction(manager)._openPack(user, id);
    })
  }
}
