import { AutoMap } from '@automapper/classes';
import { UUIDv4 } from 'src/common/types';

export class PackEntity {
  @AutoMap()
  public readonly id: UUIDv4;
  @AutoMap()
  public readonly createdAt: Date;
  @AutoMap()
  public readonly updatedAt: Date;
  @AutoMap()
  public readonly name: string;
  @AutoMap()
  public readonly description: string;
  @AutoMap()
  public readonly price: number;
  @AutoMap()
  public readonly image: string;
}

export type CreatePackEntityValues = Omit<PackEntity,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
>;

export type UpdatePackEntityValues = Partial<CreatePackEntityValues>;
