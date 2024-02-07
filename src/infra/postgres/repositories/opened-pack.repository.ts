import { Injectable } from '@nestjs/common';
import { Database, Transaction } from 'src/infra/postgres/types';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';
import { openedPacksTable } from 'src/infra/postgres/tables';
import { CreateOpenedPackEntityValues, OpenedPackEntity } from 'src/core/entities/opened-pack.entity';
import { IOpenedPacksRepository } from 'src/core/repositories/opened-packs.repository';

@Injectable()
export class OpenedPacksRepository implements IOpenedPacksRepository {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,
  ) {}

  public async createOpenedPack(
    values: CreateOpenedPackEntityValues,
    tx?: Transaction,
  ): Promise<OpenedPackEntity> {
    const { user, pack, item } = values;

    return (tx ?? this.db)
      .insert(openedPacksTable)
      .values({
        ...values,
        userId: user.id,
        packId: pack.id,
        itemId: item.id,
      })
      .returning()
      .then(([openedPack]) => ({
        ...openedPack!,
        user,
        pack,
        item,
      }));
  }
}
