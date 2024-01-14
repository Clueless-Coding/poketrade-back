import { Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { UsersUseCase } from 'src/core/use-cases/users.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserEntity, UserModel } from 'src/infra/postgres/entities/user.entity';
import { User } from '../decorators/user.decorator';
import { ApiOkResponse, ApiCreatedResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { UserOutputDTO } from '../dtos/users/user.output.dto';
import { UserInventoryEntryEntity } from 'src/infra/postgres/entities/user-inventory-entry.entity';
import { UserInventoryEntryOutputDTO } from '../dtos/user-inventory-entries/user-inventory-entry.output.dto';
import { mapArrayWithPagination } from 'src/common/helpers/map-array-with-pagination.helper';
import { PaginationInputDTO } from '../dtos/pagination.input.dto';
import { ApiOkResponseWithPagination } from '../decorators/api-ok-response-with-pagination.decorator';
import { UUIDv4 } from 'src/common/types';
import { DataSource } from 'typeorm';
import { Pagination } from 'nestjs-typeorm-paginate';
import { UserInventoryEntriesUseCase } from 'src/core/use-cases/user-inventory-entries.use-case';
import { QuickSoldUserInventoryEntryEntity } from 'src/infra/postgres/entities/quick-sold-user-inventory-entry.entity';
import { QuickSoldUserInventoryEntryOutputDTO } from '../dtos/user-inventory-entries/quick-sold-user-inventory-entry.output.dto';
import { GetUsersInputDTO } from '../dtos/users/get-users.input.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  public constructor(
    @InjectMapper()
    private readonly mapper: Mapper,

    private readonly usersUseCase: UsersUseCase,
    private readonly userInventoryEntriesUseCase: UserInventoryEntriesUseCase,
    private readonly dataSource: DataSource,
  ) {}

  @ApiOkResponse({ type: UserOutputDTO })
  @ApiSecurity('AccessToken')
  @Get()
  @UseGuards(JwtAuthGuard)
  public async getUsers(
    @Query() dto: GetUsersInputDTO,
    @Query() paginationDTO: PaginationInputDTO,
  ): Promise<Pagination<UserOutputDTO>> {
    const users = await this.usersUseCase.findUsers(dto, paginationDTO);

    return mapArrayWithPagination(
      this.mapper,
      users,
      UserEntity,
      UserOutputDTO,
    )
  }

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
  ): Promise<Pagination<UserInventoryEntryOutputDTO>> {
    const inventoryWithPagination = await this.userInventoryEntriesUseCase.findUserInventoryEntriesByUser(user, paginationDto);

    return mapArrayWithPagination(
      this.mapper,
      inventoryWithPagination,
      UserInventoryEntryEntity,
      UserInventoryEntryOutputDTO
    );
  }

  @ApiCreatedResponse({ type: QuickSoldUserInventoryEntryOutputDTO })
  @ApiSecurity('AccessToken')
  @Post('me/inventory/:id/quick-sell')
  @UseGuards(JwtAuthGuard)
  public async quickSellPokemonFromInventory(
    @User() user: UserModel,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: UUIDv4,
  ): Promise<QuickSoldUserInventoryEntryOutputDTO> {
    const quickSoldUserInventoryEntry = await this.userInventoryEntriesUseCase.quickSellUserInventoryEntryById(user, id, this.dataSource);

    return this.mapper.map(quickSoldUserInventoryEntry, QuickSoldUserInventoryEntryEntity, QuickSoldUserInventoryEntryOutputDTO);
  }
}
