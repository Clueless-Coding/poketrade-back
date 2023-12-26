import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UsersUseCase } from 'src/core/use-cases/users.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserEntity, UserModel } from 'src/infra/postgres/entities/user.entity';
import { User } from '../decorators/user.decorator';
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { UserOutputDTO } from '../dtos/users/user.output.dto';
import { UserInventoryEntryEntity } from 'src/infra/postgres/entities/user-inventory-entry.entity';
import { UserInventoryEntryOutputDTO } from '../dtos/users/user-inventory-entry.output.dto';
import { mapArrayWithPagination } from 'src/common/helpers/map-array-with-pagination.helper';
import { PaginationInputDTO } from '../dtos/pagination.input.dto';
import { ApiOkResponseWithPagination } from '../decorators/api-ok-response-with-pagination.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  public constructor(
    @InjectMapper()
    private readonly mapper: Mapper,

    private readonly usersUseCase: UsersUseCase
  ) {}

  @ApiOkResponse({ type: UserOutputDTO })
  @ApiSecurity('AccessToken')
  @Get('me')
  @UseGuards(JwtAuthGuard)
  public async getMe(@User() user: UserModel): Promise<UserOutputDTO> {
    return this.mapper.map(user, UserEntity, UserOutputDTO);
  }

  @ApiOkResponseWithPagination({ type: UserInventoryEntryOutputDTO })
  @ApiSecurity('AccessToken')
  @Get('me/inventory')
  @UseGuards(JwtAuthGuard)
  public async getMeInventory(
    @User() user: UserModel,
    @Query() paginationDto: PaginationInputDTO,
  ) {
    const inventoryWithPagination = await this.usersUseCase.getUserInventory(user, paginationDto);

    return mapArrayWithPagination(
      this.mapper,
      inventoryWithPagination,
      UserInventoryEntryEntity,
      UserInventoryEntryOutputDTO
    );
  }
}
