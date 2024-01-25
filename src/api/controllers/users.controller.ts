import { Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { UsersUseCase } from 'src/core/use-cases/users.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { ApiOkResponse, ApiCreatedResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { UserOutputDTO } from '../dtos/users/user.output.dto';
import { mapArrayWithPagination } from 'src/common/helpers/map-array-with-pagination.helper';
import { PaginationInputDTO } from '../dtos/pagination.input.dto';
import { ApiOkResponseWithPagination } from '../decorators/api-ok-response-with-pagination.decorator';
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { GetUsersInputDTO } from '../dtos/users/get-users.input.dto';
import { UserItemsUseCase } from 'src/core/use-cases/user-items.use-case';
import { Database } from 'src/infra/postgres/other/types';
import { UserItemOutputDTO } from '../dtos/user-items/user-item.output.dto';
import { QuickSoldUserItemOutputDTO } from '../dtos/user-items/quick-sold-user-item.output.dto';
import { QuickSoldUserItemEntity, UserEntity, UserItemEntity } from 'src/infra/postgres/tables';
import { InjectDatabase } from 'src/infra/decorators/inject-database.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  public constructor(
    @InjectMapper()
    private readonly mapper: Mapper,
    @InjectDatabase()
    private readonly db: Database,

    private readonly usersUseCase: UsersUseCase,
    private readonly userItemsUseCase: UserItemsUseCase,
  ) {}

  @ApiOkResponse({ type: UserOutputDTO })
  @ApiSecurity('AccessToken')
  @Get()
  @UseGuards(JwtAuthGuard)
  public async getUsers(
    @Query() dto: GetUsersInputDTO,
    @Query() paginationDTO: PaginationInputDTO,
  ): Promise<PaginatedArray<UserOutputDTO>> {
    const users = await this.usersUseCase.getUsersWithPagination(dto, paginationDTO);

    return mapArrayWithPagination<UserEntity, UserOutputDTO>(
      this.mapper,
      users,
      'UserEntity',
      'UserOutputDTO',
    )
  }

  @ApiOkResponse({ type: UserOutputDTO })
  @ApiSecurity('AccessToken')
  @Get('me')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  public async getMeItems(
    @User() user: UserEntity,
    @Query() paginationDto: PaginationInputDTO,
  ): Promise<PaginatedArray<UserItemOutputDTO>> {
    const userItemsWithPagination = await this.userItemsUseCase.getUserItemsWithPaginationByUser(user, paginationDto);

    return mapArrayWithPagination<UserItemEntity, UserItemOutputDTO>(
      this.mapper,
      userItemsWithPagination,
      'UserItemEntity',
      'UserItemOutputDTO',
    );
  }

  @ApiCreatedResponse({ type: QuickSoldUserItemOutputDTO })
  @ApiSecurity('AccessToken')
  @Post('me/items/:id/quick-sell')
  @UseGuards(JwtAuthGuard)
  public async quickSellUserItem(
    @User() user: UserEntity,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: UUIDv4,
  ): Promise<QuickSoldUserItemOutputDTO> {
    const quickSoldUserItem = await this.db.transaction(async (tx) => (
      this.userItemsUseCase.quickSellUserItemById(user, id, tx)
    ));

    return this.mapper.map<QuickSoldUserItemEntity, QuickSoldUserItemOutputDTO>(
      quickSoldUserItem,
      'QuickSoldUserItemEntity',
      'QuickSoldUserItemOutputDTO',
    );
  }
}
