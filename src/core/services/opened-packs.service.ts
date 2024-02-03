import { Injectable } from '@nestjs/common';
import { Database, Transaction } from 'src/infra/postgres/types';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';
import { CreateOpenedPackEntityValues, OpenedPackEntity, openedPacksTable } from 'src/infra/postgres/tables';

@Injectable()
export class OpenedPacksService {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,
  ) {}

  public async createOpenedPack(
    values: CreateOpenedPackEntityValues,
    tx?: Transaction,
  ): Promise<OpenedPackEntity> {
    const { user, pack, pokemon } = values;

    return (tx ?? this.db)
      .insert(openedPacksTable)
      .values({
        ...values,
        userId: user.id,
        packId: pack.id,
        pokemonId: pokemon.id,
      })
      .returning()
      .then(([openedPack]) => ({
        ...openedPack!,
        user,
        pack,
        pokemon,
      }));
  }
}
