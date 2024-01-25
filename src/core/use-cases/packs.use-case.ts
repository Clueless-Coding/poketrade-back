import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersUseCase } from './users.use-case';
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { PacksService } from '../services/packs.service';
import { UserItemsUseCase } from './user-items.use-case';
import { Transaction } from 'src/infra/postgres/other/types';
import { OpenedPackEntity, PackEntity, PokemonEntity, UserEntity } from 'src/infra/postgres/tables';
import { GetPacksInputDTO } from 'src/api/dtos/packs/get-packs.input.dto';
import { PaginationInputDTO } from 'src/api/dtos/pagination.input.dto';
import { OpenedPacksService } from '../services/opened-packs.service';

@Injectable()
export class PacksUseCase {
  public constructor(
    private readonly packsService: PacksService,
    private readonly openedPacksService: OpenedPacksService,

    private readonly usersUseCase: UsersUseCase,
    private readonly userItemsUseCase: UserItemsUseCase,
  ) {}

  public async getPacksWithPagination(
    dto: GetPacksInputDTO,
    paginationDTO: PaginationInputDTO,
  ): Promise<PaginatedArray<PackEntity>> {
    return this.packsService.findManyWithPagination({
      paginationOptions: paginationDTO,
      where: dto,
    });
  }

  public async getPack(
    where: Partial<{ id: UUIDv4, name: string }> = {},
    options: Partial<{
      errorMessage: string,
      errorStatus: HttpStatus,
    }> = {},
  ): Promise<PackEntity> {
    const {
      errorMessage = 'Pack not found',
      errorStatus= HttpStatus.NOT_FOUND,
    } = options;

    const pack = await this.packsService.findOne({
      where,
    });

    if (!pack) {
      throw new HttpException(errorMessage, errorStatus);
    }

    return pack;
  }

  public async getRandomPokemonFromPack(pack: PackEntity): Promise<PokemonEntity> {
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
  ): Promise<OpenedPackEntity> {
    if (user.balance < pack.price) {
      throw new HttpException('Insufficient balance', HttpStatus.CONFLICT);
    }

    const awaitedPromises = await Promise.all([
      this.getRandomPokemonFromPack(pack),
      this.usersUseCase.spendUserBalance(user, pack.price, tx),
    ])

    const pokemon = awaitedPromises[0];
    user = awaitedPromises[1];

    const userItem = await this.userItemsUseCase.createUserItem(
      user,
      pokemon,
      tx,
    );

    return this.openedPacksService.createOne({
      user: userItem.user,
      pack,
      pokemon: userItem.pokemon,
    }, tx);
  }

  public async openPackById(
    user: UserEntity,
    id: UUIDv4,
    tx?: Transaction,
  ): Promise<OpenedPackEntity> {
    const pack = await this.getPack({ id });

    return this.openPack(user, pack, tx);
  }
}
