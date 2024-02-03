import { Injectable } from '@nestjs/common';
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { PacksService } from '../services/packs.service';
import { Database, Transaction } from 'src/infra/postgres/types';
import { OpenedPackEntity, PackEntity, UserEntity } from 'src/infra/postgres/tables';
import { GetPacksInputDTO } from 'src/api/dtos/packs/get-packs.input.dto';
import { PaginationInputDTO } from 'src/api/dtos/pagination.input.dto';
import { OpenedPacksService } from '../services/opened-packs.service';
import { UsersService } from '../services/users.service';
import { UserItemsService } from '../services/user-items.service';
import { AppConflictException } from '../exceptions';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';

@Injectable()
export class PacksUseCase {
  public constructor(
    private readonly packsService: PacksService,
    private readonly openedPacksService: OpenedPacksService,
    private readonly usersService: UsersService,
    private readonly userItemsService: UserItemsService,

    @InjectDatabase()
    private readonly db: Database,
  ) {}

  public async getPacksWithPagination(
    dto: GetPacksInputDTO,
    paginationDTO: PaginationInputDTO,
  ): Promise<PaginatedArray<PackEntity>> {
    return this.packsService.findPacksWithPagination({
      paginationOptions: paginationDTO,
      where: dto,
    });
  }

  public async getPackById(id: UUIDv4): Promise<PackEntity> {
    return this.packsService.findPackById({ id });
  }

  private async _openPackById(
    user: UserEntity,
    id: UUIDv4,
    tx: Transaction,
  ): Promise<OpenedPackEntity> {
    const pack = await this.packsService.findPackById({ id });

    if (user.balance < pack.price) {
      throw new AppConflictException('Insufficient balance');
    }

    const awaitedPromises = await Promise.all([
      this.packsService.findRandomPokemonFromPack(pack),
      this.usersService.spendUserBalance(user, pack.price, tx),
    ])

    const pokemon = awaitedPromises[0];
    user = awaitedPromises[1];

    const userItem = await this.userItemsService.createUserItem({ user, pokemon });

    return this.openedPacksService.createOpenedPack({
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
