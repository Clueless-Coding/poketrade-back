import { CreateOpenedPackEntityValues, OpenedPackEntity } from '../entities/opened-pack.entity';

export abstract class IOpenedPacksRepository {
  public abstract createOpenedPack(
    values: CreateOpenedPackEntityValues,
    tx?: unknown,
  ): Promise<OpenedPackEntity>;
}
