import { Body, Controller, Delete, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AccessTokenAuthGuard } from '../guards/access-token-auth.guard';
import { User } from '../decorators/user.decorator';
import { PacksService } from 'src/core/services/packs.service';
import { ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { Mapper } from '@automapper/core';
import { PackOutputDTO } from '../dtos/packs/pack.output.dto';
import { InjectMapper } from '@automapper/nestjs';
import { OpenedPackOutputDTO } from '../dtos/packs/opened-pack.output.dto';
import { PaginationOptionsInputDTO } from '../dtos/pagination.input.dto';
import { mapPaginatedArray } from 'src/common/helpers/map-paginated-array.helper';
import { OpenedPackEntity } from 'src/core/entities/opened-pack.entity';
import { PackEntity} from 'src/core/entities/pack.entity';
import { UserEntity } from 'src/core/entities/user.entity';
import { GetPacksInputDTO } from '../dtos/packs/get-packs.input.dto';
import { ApiOkResponseWithPagination } from '../decorators/api-ok-response-with-pagination.decorator';
import { UUIDv4Param } from '../decorators/uuidv4-param.decorator';
import { PacksToPokemonsService } from 'src/core/services/packs-to-pokemons.service';
import { PackToPokemonEntity } from 'src/core/entities/pack-to-pokemon.entity';
import { PokemonOutputDTO } from '../dtos/pokemons/pokemon.output.dto';
import { AdminApiKeyAuthGuard } from '../guards/admin-api-key-auth.guard';
import { CreatePackInputDTO } from '../dtos/packs/create-pack.input.dto';
import { CreatePackOutputDTO } from '../dtos/packs/create-pack.output.dto';
import { DeletePackByIdOutputDTO } from '../dtos/packs/delete-pack-by-id.output.dto';
import { UpdatePackByIdInputDTO } from '../dtos/packs/update-pack-by-id.input.dto';
import { UpdatePackByIdOutputDTO } from '../dtos/packs/update-pack-by-id.output.dto';

@ApiTags('Packs')
@Controller('packs')
export class PacksController {
  public constructor(
    @InjectMapper()
    private readonly mapper: Mapper,

    private readonly packsService: PacksService,
    private readonly packsToPokemonsService: PacksToPokemonsService,
  ) {}

  @ApiOkResponseWithPagination({ type: PackOutputDTO })
  @ApiBearerAuth('AccessToken')
  @Get()
  @UseGuards(AccessTokenAuthGuard)
  public async getPacksWithPagination(
    @Query() dto: GetPacksInputDTO,
    @Query() paginationOptionsDTO: PaginationOptionsInputDTO,
  ): Promise<PaginatedArray<PackOutputDTO>> {
    const packs = await this.packsService.getPacksWithPagination(dto, paginationOptionsDTO);

    return mapPaginatedArray(
      this.mapper,
      packs,
      PackEntity,
      PackOutputDTO,
    )
  }

  @ApiOkResponse({ type: PackOutputDTO })
  @ApiNotFoundResponse()
  @ApiBearerAuth('AccessToken')
  @Get(':id')
  @UseGuards(AccessTokenAuthGuard)
  public async getPackById(
    @UUIDv4Param('id') id: UUIDv4,
  ): Promise<PackOutputDTO> {
    const pack = await this.packsService.getPackById(id);

    return this.mapper.map(
      pack,
      PackEntity,
      PackOutputDTO,
    );
  }

  @ApiCreatedResponse({ type: PackOutputDTO })
  @ApiSecurity('AdminApiKey')
  @Post()
  @UseGuards(AdminApiKeyAuthGuard)
  public async createPack(
    @Body() dto: CreatePackInputDTO,
  ): Promise<CreatePackOutputDTO> {
    const { pack, packsToPokemons } = await this.packsService.createPack(dto);

    return {
      pack: this.mapper.map(pack, PackEntity, PackOutputDTO),
      pokemons: this.mapper.mapArray(packsToPokemons, PackToPokemonEntity, PokemonOutputDTO),
    }
  }

  @ApiOkResponseWithPagination({ type: PokemonOutputDTO })
  @ApiBearerAuth('AccessToken')
  @Get(':id/pokemons')
  @UseGuards(AccessTokenAuthGuard)
  public async getPackPokemonsWithPaginationByPackId(
    @UUIDv4Param('id') id: UUIDv4,
    @Query() paginationOptionsDTO: PaginationOptionsInputDTO,
  ): Promise<PaginatedArray<PokemonOutputDTO>> {
    const packsToPokemons = await this.packsToPokemonsService.getPacksToPokemonsWithPaginationByPackId(id, paginationOptionsDTO);

    return mapPaginatedArray(
      this.mapper,
      packsToPokemons,
      PackToPokemonEntity,
      PokemonOutputDTO,
    );
  }

  @ApiCreatedResponse({ type: OpenedPackOutputDTO })
  @ApiConflictResponse()
  @ApiNotFoundResponse()
  @ApiBearerAuth('AccessToken')
  @Post(':id/open')
  @UseGuards(AccessTokenAuthGuard)
  public async openPackById(
    @User() user: UserEntity,
    @UUIDv4Param('id') id: UUIDv4,
  ): Promise<OpenedPackOutputDTO> {
    const openedPack = await this.packsService.openPackById(user, id);

    return this.mapper.map(
      openedPack,
      OpenedPackEntity,
      OpenedPackOutputDTO,
    );
  }

  @ApiOkResponse({ type: UpdatePackByIdOutputDTO })
  @ApiSecurity('AdminApiKey')
  @Patch(':id')
  public async updatePackById(
    @UUIDv4Param('id') id: UUIDv4,
    @Body() dto: UpdatePackByIdInputDTO,
  ): Promise<UpdatePackByIdOutputDTO> {
    const { pack, packsToPokemons } = await this.packsService.updatePackById(id, dto);

    return {
      pack: this.mapper.map(pack, PackEntity, PackOutputDTO),
      ...(packsToPokemons && { pokemons: this.mapper.mapArray(packsToPokemons, PackToPokemonEntity, PokemonOutputDTO) }),
    }
  }

  @ApiOkResponse({ type: DeletePackByIdOutputDTO })
  @ApiSecurity('AdminApiKey')
  @Delete(':id')
  @UseGuards(AdminApiKeyAuthGuard)
  public async deletePackById(
    @UUIDv4Param('id') id: UUIDv4,
  ): Promise<DeletePackByIdOutputDTO> {
    const { pack, packsToPokemons } = await this.packsService.deletePackById(id);

    return {
      pack: this.mapper.map(pack, PackEntity, PackOutputDTO),
      pokemons: this.mapper.mapArray(packsToPokemons, PackToPokemonEntity, PokemonOutputDTO),
    }
  }
}
