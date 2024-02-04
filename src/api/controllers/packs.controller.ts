import { Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { AccessTokenAuthGuard } from '../guards/access-token-auth.guard';
import { User } from '../decorators/user.decorator';
import { PacksService } from 'src/core/services/packs.service';
import { ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { Mapper } from '@automapper/core';
import { PackOutputDTO } from '../dtos/packs/pack.output.dto';
import { InjectMapper } from '@automapper/nestjs';
import { PackWithPokemonsOutputDTO } from '../dtos/packs/pack-with-pokemons.output.dto';
import { OpenedPackOutputDTO } from '../dtos/packs/opened-pack.output.dto';
import { PaginationInputDTO } from '../dtos/pagination.input.dto';
import { mapPaginatedArray } from 'src/common/helpers/map-paginated-array.helper';
import { OpenedPackEntity } from 'src/core/entities/opened-pack.entity';
import { PackEntity} from 'src/core/entities/pack.entity';
import { UserEntity } from 'src/core/entities/user.entity';
import { GetPacksInputDTO } from '../dtos/packs/get-packs.input.dto';
import { ApiOkResponseWithPagination } from '../decorators/api-ok-response-with-pagination.decorator';

@ApiTags('Packs')
@Controller('packs')
export class PacksController {
  public constructor(
    @InjectMapper()
    private readonly mapper: Mapper,

    private readonly packsService: PacksService,
  ) {}

  @ApiOkResponseWithPagination({ type: PackOutputDTO })
  @ApiSecurity('AccessToken')
  @Get()
  @UseGuards(AccessTokenAuthGuard)
  public async getPacksWithPagination(
    @Query() dto: GetPacksInputDTO,
    @Query() paginationDTO: PaginationInputDTO,
  ): Promise<PaginatedArray<PackOutputDTO>> {
    const packs = await this.packsService.getPacksWithPagination(dto, paginationDTO);

    return mapPaginatedArray(
      this.mapper,
      packs,
      PackEntity,
      PackOutputDTO,
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
    const pack = await this.packsService.getPackById(id);

    return this.mapper.map(
      pack,
      PackEntity,
      PackWithPokemonsOutputDTO,
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
    const openedPack = await this.packsService.openPackById(user, id);

    return this.mapper.map(
      openedPack,
      OpenedPackEntity,
      OpenedPackOutputDTO,
    );
  }
}
