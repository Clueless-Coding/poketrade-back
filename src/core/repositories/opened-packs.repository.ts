import { CreateOpenedPackEntityValues, OpenedPackEntity } from 'src/infra/postgres/tables';

export abstract class IOpenedPacksRepository {
  public abstract createOpenedPack(
    values: CreateOpenedPackEntityValues,
    tx?: unknown,
  ): Promise<OpenedPackEntity>;
}
