import { Injectable } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserInputDTO } from 'src/api/dtos/users/create-user.input.dto';
import { UserEntity } from 'src/infra/postgres/entities/user.entity';

@Injectable()
export class UsersUseCase {
  public constructor(private readonly usersService: UsersService) {}

  public async createUser(dto: CreateUserInputDTO): Promise<UserEntity> {
    return this.usersService.createOne(dto);
  }
}
