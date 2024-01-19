import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersUseCase } from './users.use-case';
import { UUIDv4 } from 'src/common/types';
import { PacksService } from '../services/packs.service';
import { OpenedPacksUseCase } from './opened-packs.use-case';
import { UserItemsUseCase } from './user-items.use-case';
import { and, eq } from 'drizzle-orm';
import { PackEntity, Transaction, UserEntity } from 'src/infra/postgres/other/types';

@Injectable()
export class PacksUseCase {
  public constructor(
    private readonly packsService: PacksService,

    private readonly usersUseCase: UsersUseCase,
    private readonly userItemsUseCase: UserItemsUseCase,
    private readonly openedPacksUseCase: OpenedPacksUseCase,
  ) {}

  public async getPacksWithPagination(
    paginationOptions: { page: number, limit: number }
  ) {
    return this.packsService.findManyWithPagination(paginationOptions);
  }

  public async getPack(
    where: Partial<{ id: UUIDv4, name: string }> = {},
    errorMessage: string = 'Pack not found',
    errorStatus: HttpStatus = HttpStatus.NOT_FOUND,
  ) {
    const pack = await this.packsService.findOne({
      where: (table) => and(
        // TODO: Maybe there is a better way to do that
        ...(where.id ? [eq(table.id, where.id)] : []),
        ...(where.name ? [eq(table.name, where.name)] : []),
      ),
    });

    if (!pack) {
      throw new HttpException(errorMessage, errorStatus);
    }

    return pack;
  }

  public async getRandomPokemonFromPack(pack: PackEntity) {
    const pokemon = await this.packsService.findRandomPokemonFromPack(pack);

    if (!pokemon) {
      throw new HttpException(
        'There are no pokemons in the pack. Please notify the developer about it :)',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return pokemon;
  }

  public async openPack(
    user: UserEntity,
    pack: PackEntity,
    tx?: Transaction,
  ) {
    if (user.balance < pack.price) {
      throw new HttpException('Insufficient balance', HttpStatus.CONFLICT);
    }

    const awaitedPromises = await Promise.all([
      this.getRandomPokemonFromPack(pack),
      this.usersUseCase.spendUserBalance(user, pack.price, tx),
    ])

    const pokemon = awaitedPromises[0];
    user = awaitedPromises[1];

    const userPokemon = await this.userItemsUseCase.createUserItem(
      user,
      pokemon,
      tx,
    );

    // TODO: Have to assert that userPokemon.user is not nullable
    // Figure it out how to not do that
    return this.openedPacksUseCase.createOpenedPack(userPokemon.user!, pack, pokemon, tx);
  }

  public async openPackById(
    user: UserEntity,
    id: UUIDv4,
    tx?: Transaction,
  ) {
    const pack = await this.getPack({ id });

    return this.openPack(user, pack, tx);
  }
}
