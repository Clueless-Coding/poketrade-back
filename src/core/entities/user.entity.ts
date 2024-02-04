import { AutoMap } from '@automapper/classes';
import { UUIDv4 } from 'src/common/types';

export class UserEntity {
  @AutoMap()
  public readonly id: UUIDv4;
  @AutoMap()
  public readonly createdAt: Date;
  @AutoMap()
  public readonly updatedAt: Date;
  @AutoMap()
  public readonly name: string;
  @AutoMap()
  public readonly hashedPassword: string;
  @AutoMap()
  public readonly balance: number;
}

export type CreateUserEntityValues = Omit<UserEntity,
  | 'id'
  | 'updatedAt'
  | 'createdAt'
  | 'balance'
  | 'hashedPassword'
>
& Required<{ password: string }>
& Partial<Pick<UserEntity, 'balance'>>;

export type UpdateUserEntityValues = Partial<CreateUserEntityValues>;
