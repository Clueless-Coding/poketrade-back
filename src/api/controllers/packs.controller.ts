import { Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { AccessTokenAuthGuard } from '../guards/access-token-auth.guard';
import { User } from '../decorators/user.decorator';
import { PacksUseCase } from 'src/core/use-cases/packs.use-case';
import { ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { Mapper } from '@automapper/core';
import { PackOutputDTO } from '../dtos/packs/pack.output.dto';
import { InjectMapper } from '@automapper/nestjs';
import { PackWithPokemonsOutputDTO } from '../dtos/packs/pack-with-pokemons.output.dto';
import { OpenedPackOutputDTO } from '../dtos/packs/opened-pack.output.dto';
import { PaginationInputDTO } from '../dtos/pagination.input.dto';
import { mapPaginatedArray } from 'src/common/helpers/map-paginated-array.helper';
import { OpenedPackEntity, PackEntity, UserEntity } from 'src/infra/postgres/tables';
import { GetPacksInputDTO } from '../dtos/packs/get-packs.input.dto';
import { ApiOkResponseWithPagination } from '../decorators/api-ok-response-with-pagination.decorator';

@ApiTags('Packs')
@Controller('packs')
export class PacksController {
  public constructor(
    @InjectMapper()
    private readonly mapper: Mapper,

    private readonly packsUseCase: PacksUseCase,
  ) {}

  @ApiOkResponseWithPagination({ type: PackOutputDTO })
  @ApiSecurity('AccessToken')
  @Get()
  @UseGuards(AccessTokenAuthGuard)
  public async getPacksWithPagination(
    @Query() dto: GetPacksInputDTO,
    @Query() paginationDTO: PaginationInputDTO,
  ): Promise<PaginatedArray<PackOutputDTO>> {
    const packs = await this.packsUseCase.getPacksWithPagination(dto, paginationDTO);

    return mapPaginatedArray<PackEntity, PackOutputDTO>(
      this.mapper,
      packs,
      'PackEntity',
      'PackOutputDTO',
    )
  }

  @ApiOkResponse({ type: PackWithPokemonsOutputDTO })
  @ApiNotFoundResponse()
  @ApiSecurity('AccessToken')
  @Get(':id')
  @UseGuards(AccessTokenAuthGuard)
  public async getPackById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: UUIDv4,
  ): Promise<PackWithPokemonsOutputDTO> {
    const pack = await this.packsUseCase.getPackById(id);

    return this.mapper.map<PackEntity, PackWithPokemonsOutputDTO>(
      pack,
      'PackEntity',
      'PackOutputDTO',
    );
  }

  @ApiCreatedResponse({ type: OpenedPackOutputDTO })
  @ApiConflictResponse()
  @ApiNotFoundResponse()
  @ApiSecurity('AccessToken')
  @Post(':id/open')
  @UseGuards(AccessTokenAuthGuard)
  public async openPackById(
    @User() user: UserEntity,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: UUIDv4,
  ): Promise<OpenedPackOutputDTO> {
    const openedPack = await this.packsUseCase.openPackById(user, id);

    return this.mapper.map<OpenedPackEntity, OpenedPackOutputDTO>(
      openedPack,
      'OpenedPackEntity',
      'OpenedPackOutputDTO'
    );
  }
}
