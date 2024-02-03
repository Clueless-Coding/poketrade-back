import { Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { UsersUseCase } from 'src/core/use-cases/users.use-case';
import { AccessTokenAuthGuard } from '../guards/access-token-auth.guard';
import { User } from '../decorators/user.decorator';
import { ApiOkResponse, ApiCreatedResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { UserOutputDTO } from '../dtos/users/user.output.dto';
import { mapPaginatedArray } from 'src/common/helpers/map-paginated-array.helper';
import { PaginationInputDTO } from '../dtos/pagination.input.dto';
import { ApiOkResponseWithPagination } from '../decorators/api-ok-response-with-pagination.decorator';
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { GetUsersInputDTO } from '../dtos/users/get-users.input.dto';
import { UserItemsUseCase } from 'src/core/use-cases/user-items.use-case';
import { UserItemOutputDTO } from '../dtos/user-items/user-item.output.dto';
import { QuickSoldUserItemOutputDTO } from '../dtos/user-items/quick-sold-user-item.output.dto';
import { QuickSoldUserItemEntity, UserEntity, UserItemEntity } from 'src/infra/postgres/tables';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  public constructor(
    @InjectMapper()
    private readonly mapper: Mapper,

    private readonly usersUseCase: UsersUseCase,
    private readonly userItemsUseCase: UserItemsUseCase,
  ) {}

  @ApiOkResponse({ type: UserOutputDTO })
  @ApiSecurity('AccessToken')
  @Get()
  @UseGuards(AccessTokenAuthGuard)
  public async getUsersWithPagination(
    @Query() dto: GetUsersInputDTO,
    @Query() paginationDTO: PaginationInputDTO,
  ): Promise<PaginatedArray<UserOutputDTO>> {
    const users = await this.usersUseCase.getUsersWithPagination(dto, paginationDTO);

    this.mapper.mapArray
    return mapPaginatedArray<UserEntity, UserOutputDTO>(
      this.mapper,
      users,
      'UserEntity',
      'UserOutputDTO',
    )
  }

  @ApiOkResponse({ type: UserOutputDTO })
  @ApiSecurity('AccessToken')
  @Get('me')
  @UseGuards(AccessTokenAuthGuard)
  public async getMe(@User() user: UserEntity): Promise<UserOutputDTO> {
    return this.mapper.map<UserEntity, UserOutputDTO>(
      user,
      'UserEntity',
      'UserOutputDTO',
    );
  }

  @ApiOkResponseWithPagination({ type: UserItemOutputDTO })
  @ApiSecurity('AccessToken')
  @Get('me/items')
  @UseGuards(AccessTokenAuthGuard)
  public async getMeItems(
    @User() user: UserEntity,
    @Query() paginationDto: PaginationInputDTO,
  ): Promise<PaginatedArray<UserItemOutputDTO>> {
    const userItemsWithPagination = await this.userItemsUseCase.getUserItemsWithPaginationByUser(user, paginationDto);

    return mapPaginatedArray<UserItemEntity, UserItemOutputDTO>(
      this.mapper,
      userItemsWithPagination,
      'UserItemEntity',
      'UserItemOutputDTO',
    );
  }

  @ApiCreatedResponse({ type: QuickSoldUserItemOutputDTO })
  @ApiSecurity('AccessToken')
  @Post('me/items/:id/quick-sell')
  @UseGuards(AccessTokenAuthGuard)
  public async quickSellUserItemById(
    @User() user: UserEntity,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: UUIDv4,
  ): Promise<QuickSoldUserItemOutputDTO> {
    const quickSoldUserItem = await this.userItemsUseCase.quickSellUserItemById(user, id);

    return this.mapper.map<QuickSoldUserItemEntity, QuickSoldUserItemOutputDTO>(
      quickSoldUserItem,
      'QuickSoldUserItemEntity',
      'QuickSoldUserItemOutputDTO',
    );
  }
}
