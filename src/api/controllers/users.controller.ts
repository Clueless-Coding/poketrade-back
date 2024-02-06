import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/core/services/users.service';
import { AccessTokenAuthGuard } from '../guards/access-token-auth.guard';
import { User } from '../decorators/user.decorator';
import { ApiOkResponse, ApiCreatedResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { UserOutputDTO } from '../dtos/users/user.output.dto';
import { mapPaginatedArray } from 'src/common/helpers/map-paginated-array.helper';
import { PaginationOptionsInputDTO } from '../dtos/pagination.input.dto';
import { ApiOkResponseWithPagination } from '../decorators/api-ok-response-with-pagination.decorator';
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { GetUsersInputDTO } from '../dtos/users/get-users.input.dto';
import { UserItemsService } from 'src/core/services/user-items.service';
import { UserItemOutputDTO } from '../dtos/user-items/user-item.output.dto';
import { QuickSoldUserItemOutputDTO } from '../dtos/user-items/quick-sold-user-item.output.dto';
import { QuickSoldUserItemEntity } from 'src/core/entities/quick-sold-user-item.entity';
import { UserEntity } from 'src/core/entities/user.entity';
import { UserItemEntity } from 'src/core/entities/user-item.entity';
import { UUIDv4Param } from '../decorators/uuidv4-param.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  public constructor(
    @InjectMapper()
    private readonly mapper: Mapper,

    private readonly usersService: UsersService,
    private readonly userItemsService: UserItemsService,
  ) {}

  @ApiOkResponseWithPagination({ type: UserOutputDTO })
  @ApiBearerAuth('AccessToken')
  @Get()
  @UseGuards(AccessTokenAuthGuard)
  public async getUsersWithPagination(
    @Query() dto: GetUsersInputDTO,
    @Query() paginationOptionsDTO: PaginationOptionsInputDTO,
  ): Promise<PaginatedArray<UserOutputDTO>> {
    const users = await this.usersService.getUsersWithPagination(dto, paginationOptionsDTO);

    return mapPaginatedArray(this.mapper, users, UserEntity, UserOutputDTO);
  }

  @ApiOkResponse({ type: UserOutputDTO })
  @ApiBearerAuth('AccessToken')
  @Get('@me')
  @UseGuards(AccessTokenAuthGuard)
  public async getMe(@User() user: UserEntity): Promise<UserOutputDTO> {
    return this.mapper.map(user, UserEntity, UserOutputDTO);
  }

  @ApiOkResponseWithPagination({ type: UserItemOutputDTO })
  @ApiBearerAuth('AccessToken')
  @Get('@me/items')
  @UseGuards(AccessTokenAuthGuard)
  public async getMeItems(
    @User() user: UserEntity,
    @Query() paginationOptionsDTO: PaginationOptionsInputDTO,
  ): Promise<PaginatedArray<UserItemOutputDTO>> {
    const userItemsWithPagination = await this.userItemsService.getUserItemsWithPaginationByUser(user, paginationOptionsDTO);

    return mapPaginatedArray(
      this.mapper,
      userItemsWithPagination,
      UserItemEntity,
      UserItemOutputDTO,
    );
  }

  @ApiCreatedResponse({ type: QuickSoldUserItemOutputDTO })
  @ApiBearerAuth('AccessToken')
  @Post('@me/items/:id/quick-sell')
  @UseGuards(AccessTokenAuthGuard)
  public async quickSellMeItemById(
    @User() user: UserEntity,
    @UUIDv4Param('id') id: UUIDv4,
  ): Promise<QuickSoldUserItemOutputDTO> {
    const quickSoldUserItem = await this.userItemsService.quickSellUserItemById(user, id);

    return this.mapper.map(
      quickSoldUserItem,
      QuickSoldUserItemEntity,
      QuickSoldUserItemOutputDTO,
    );
  }

  @ApiOkResponse({ type: UserOutputDTO })
  @ApiBearerAuth('AccessToken')
  @Get(':id')
  @UseGuards(AccessTokenAuthGuard)
  public async getUserById(
    @UUIDv4Param('id') id: UUIDv4,
  ): Promise<UserOutputDTO> {
    const user = await this.usersService.getUserById(id);

    return this.mapper.map(user, UserEntity, UserOutputDTO);
  }

  @ApiOkResponseWithPagination({ type: UserItemOutputDTO })
  @ApiBearerAuth('AccessToken')
  @Get(':id/items')
  @UseGuards(AccessTokenAuthGuard)
  public async getUserItemsByUserId(
    @UUIDv4Param('id') userId: UUIDv4,
    @Query() paginationOptionsDTO: PaginationOptionsInputDTO,
  ): Promise<PaginatedArray<UserItemOutputDTO>> {
    const userItemsWithPagination = await this.userItemsService.getUserItemsWithPaginationByUserId(userId, paginationOptionsDTO);

    return mapPaginatedArray(
      this.mapper,
      userItemsWithPagination,
      UserItemEntity,
      UserItemOutputDTO,
    );
  }
}
