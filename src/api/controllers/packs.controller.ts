import { Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { PacksUseCase } from 'src/core/use-cases/packs.use-case';
import { ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { Mapper } from '@automapper/core';
import { PackOutputDTO } from '../dtos/packs/pack.output.dto';
import { InjectMapper } from '@automapper/nestjs';
import { PackWithPokemonsOutputDTO } from '../dtos/packs/pack-with-pokemons.output.dto';
import { OpenedPackOutputDTO } from '../dtos/packs/opened-pack.output.dto';
import { Database } from 'src/infra/postgres/other/types';
import { PaginationInputDTO } from '../dtos/pagination.input.dto';
import { mapArrayWithPagination } from 'src/common/helpers/map-array-with-pagination.helper';
import { OpenedPackEntity, PackEntity, UserEntity } from 'src/infra/postgres/tables';
import { InjectDatabase } from 'src/infra/decorators/inject-database.decorator';
import { GetPacksInputDTO } from '../dtos/packs/get-packs.input.dto';

@ApiTags('Packs')
@Controller('packs')
export class PacksController {
  public constructor(
    @InjectMapper()
    private readonly mapper: Mapper,
    @InjectDatabase()
    private readonly db: Database,

    private readonly packsUseCase: PacksUseCase,
  ) {}

  @ApiOkResponse({ type: [PackOutputDTO] })
  @ApiSecurity('AccessToken')
  @Get()
  @UseGuards(JwtAuthGuard)
  public async getPacks(
    @Query() dto: GetPacksInputDTO,
    @Query() paginationDTO: PaginationInputDTO,
  ): Promise<PaginatedArray<PackOutputDTO>> {
    const packs = await this.packsUseCase.getPacksWithPagination(dto, paginationDTO);

    return mapArrayWithPagination<PackEntity, PackOutputDTO>(
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
  @UseGuards(JwtAuthGuard)
  public async getPack(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: UUIDv4,
  ): Promise<PackWithPokemonsOutputDTO> {
    const pack = await this.packsUseCase.getPack(id);

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
  @UseGuards(JwtAuthGuard)
  public async openPack(
    @User() user: UserEntity,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: UUIDv4,
  ): Promise<OpenedPackOutputDTO> {
    const openedPack = await this.db.transaction(async (tx) => (
      this.packsUseCase.openPackById(user, id, tx)
    ));

    return this.mapper.map<OpenedPackEntity, OpenedPackOutputDTO>(
      openedPack,
      'OpenedPackEntity',
      'OpenedPackOutputDTO'
    );
  }
}
