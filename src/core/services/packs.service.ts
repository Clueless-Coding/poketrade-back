import { Injectable } from '@nestjs/common';
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { IPacksRepository } from '../repositories/packs.repository';
import { Database, Transaction } from 'src/infra/postgres/types';
import { OpenedPackEntity, PackEntity, UserEntity } from 'src/infra/postgres/tables';
import { GetPacksInputDTO } from 'src/api/dtos/packs/get-packs.input.dto';
import { PaginationInputDTO } from 'src/api/dtos/pagination.input.dto';
import { IUsersRepository } from '../repositories/users.repository';
import { IUserItemsRepository } from '../repositories/user-items.repository';
import { AppConflictException } from '../exceptions';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';
import { IOpenedPacksRepository } from '../repositories/opened-packs.repository';

@Injectable()
export class PacksService {
  public constructor(
    private readonly packsRepository: IPacksRepository,
    private readonly openedPacksRepository: IOpenedPacksRepository,
    private readonly usersRepository: IUsersRepository,
    private readonly userItemsRepository: IUserItemsRepository,

    @InjectDatabase()
    private readonly db: Database,
  ) {}

  public async getPacksWithPagination(
    dto: GetPacksInputDTO,
    paginationDTO: PaginationInputDTO,
  ): Promise<PaginatedArray<PackEntity>> {
    return this.packsRepository.findPacksWithPagination({
      paginationOptions: paginationDTO,
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
}
