import { Injectable } from '@nestjs/common';
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { IPacksRepository } from '../repositories/packs.repository';
import { Database, Transaction } from 'src/infra/postgres/types';
import { OpenedPackEntity } from '../entities/opened-pack.entity';
import { PackEntity } from '../entities/pack.entity';
import { UserEntity } from '../entities/user.entity';
import { GetPacksInputDTO } from 'src/api/dtos/packs/get-packs.input.dto';
import { PaginationOptionsInputDTO } from 'src/api/dtos/pagination.input.dto';
import { IUsersRepository } from '../repositories/users.repository';
import { IUserItemsRepository } from '../repositories/user-items.repository';
import { AppConflictException } from '../exceptions';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';
import { IOpenedPacksRepository } from '../repositories/opened-packs.repository';
import { CreatePackInputDTO } from 'src/api/dtos/packs/create-pack.input.dto';
import { PackToPokemonEntity } from '../entities/pack-to-pokemon.entity';
import { IPokemonsRepository } from '../repositories/pokemons.repository';
import { UpdatePackByIdInputDTO } from 'src/api/dtos/packs/update-pack-by-id.input.dto';

@Injectable()
export class PacksService {
  public constructor(
    private readonly packsRepository: IPacksRepository,
    private readonly openedPacksRepository: IOpenedPacksRepository,
    private readonly pokemonsRepository: IPokemonsRepository,
    private readonly usersRepository: IUsersRepository,
    private readonly userItemsRepository: IUserItemsRepository,

    @InjectDatabase()
    private readonly db: Database,
  ) {}

  public async getPacksWithPagination(
    dto: GetPacksInputDTO,
    paginationOptionsDTO: PaginationOptionsInputDTO,
  ): Promise<PaginatedArray<PackEntity>> {
    return this.packsRepository.findPacksWithPagination({
      paginationOptions: paginationOptionsDTO,
      where: dto,
    });
  }

  public async getPackById(id: UUIDv4): Promise<PackEntity> {
    return this.packsRepository.findPackById({ id });
  }

  private async _openPackById(
    user: UserEntity,
    id: UUIDv4,
    tx: Transaction,
  ): Promise<OpenedPackEntity> {
    const pack = await this.packsRepository.findPackById({ id });

    if (user.balance < pack.price) {
      throw new AppConflictException('Insufficient balance');
    }

    const awaitedPromises = await Promise.all([
      this.packsRepository.findRandomPokemonFromPack(pack),
      this.usersRepository.spendUserBalance(user, pack.price, tx),
    ])

    const pokemon = awaitedPromises[0];
    user = awaitedPromises[1];

    const userItem = await this.userItemsRepository.createUserItem({ user, pokemon });

    return this.openedPacksRepository.createOpenedPack({
      user: userItem.user,
      pack,
      pokemon: userItem.pokemon,
    }, tx);
  }

  public async openPackById(
    user: UserEntity,
    id: UUIDv4,
  ): Promise<OpenedPackEntity> {
    return this.db.transaction(async (tx) => (
      this._openPackById(user, id, tx)
    ));
  }

  private async _createPack(
    dto: CreatePackInputDTO,
    tx?: Transaction,
  ): Promise<{
    pack: PackEntity,
    packsToPokemons: Array<PackToPokemonEntity>,
  }> {
    const { pokemonIds } = dto;

    const pokemons = await this.pokemonsRepository.findPokemonsByIds({
      ids: pokemonIds,
    });

    return this.packsRepository.createPack({
      ...dto,
      pokemons,
    }, tx);
  }

  public async createPack(dto: CreatePackInputDTO): Promise<{
    pack: PackEntity,
    packsToPokemons: Array<PackToPokemonEntity>,
  }> {
    return this.db.transaction(async (tx) => (
      this._createPack(dto, tx)
    ));
  }

  private async _updatePackById(
    id: UUIDv4,
    dto: UpdatePackByIdInputDTO,
    tx?: Transaction,
  ): Promise<{
    pack: PackEntity,
    packsToPokemons?: Array<PackToPokemonEntity>,
  }> {
    const pack = await this.packsRepository.findPackById({ id });

    const { pokemonIds } = dto;
    const pokemons = pokemonIds && await this.pokemonsRepository.findPokemonsByIds({ ids: pokemonIds });

    return this.packsRepository.updatePack(pack, {
      ...dto,
      pokemons,
    }, tx);
  }

  public async updatePackById(
    id: UUIDv4,
    dto: UpdatePackByIdInputDTO,
  ): Promise<{
    pack: PackEntity,
    packsToPokemons?: Array<PackToPokemonEntity>,
  }> {
    return this.db.transaction(async (tx) => (
      this._updatePackById(id, dto, tx)
    ));
  }

  private async _deletePackById(
    id: UUIDv4,
    tx?: Transaction,
  ): Promise<{
    pack: PackEntity,
    packsToPokemons: Array<PackToPokemonEntity>,
  }> {
    const pack = await this.packsRepository.findPackById({ id });

    return this.packsRepository.deletePack(pack, tx);
  }

  public async deletePackById(id: UUIDv4): Promise<{
    pack: PackEntity,
    packsToPokemons: Array<PackToPokemonEntity>,
  }> {
    return this.db.transaction(async (tx) => (
      this._deletePackById(id, tx)
    ));
  }
}
