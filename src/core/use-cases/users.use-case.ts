import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UserEntity, UserModel } from 'src/infra/postgres/entities/user.entity';
import { CreateUserInputDTO } from 'src/api/dtos/users/create-user.input.dto';
import { UpdateUserInputDTO } from 'src/api/dtos/users/update-user.input.dto';
import { UUIDv4 } from 'src/common/types';
import { FindEntityRelationsOptions } from 'src/infra/postgres/other/types';

@Injectable()
export class UsersUseCase {
  public constructor(
    private readonly usersService: UsersService,
  ) {}

  public async findUserById(id: UUIDv4): Promise<UserModel> {
    const user = await this.usersService.findOne({ id });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  public async checkIfUserExistsByName(name: string) {
    return this.usersService.exist({ name });
  }

  public async preload<
    T extends FindEntityRelationsOptions<UserEntity>,
  >(
    user: UserModel,
    relations?: T,
  ): Promise<UserModel<T>> {
    return this.usersService.preload(user, relations);
  }

  public async createUser(dto: CreateUserInputDTO): Promise<UserModel> {
    return this.usersService.createOne(dto);
  }

  public async updateUser<
    T extends FindEntityRelationsOptions<UserEntity>,
  >(
    user: UserModel<T>,
    dto: UpdateUserInputDTO
  ): Promise<UserModel<T>> {
    return this.usersService.updateOne(user, dto);
  }

  public async replenishUserBalance<
    T extends FindEntityRelationsOptions<UserEntity>,
  >(
    user: UserModel<T>,
    amount: number,
  ) {
    return this.updateUser(user, { balance: user.balance + amount });
  }

  public async spendUserBalance<
    T extends FindEntityRelationsOptions<UserEntity>,
  >(
    user: UserModel<T>,
    amount: number,
  ) {
    return this.updateUser(user, { balance: user.balance - amount });
  }
}
