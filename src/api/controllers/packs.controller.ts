import { Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { UserEntity, UserModel } from 'src/infra/postgres/entities/user.entity';
import { PacksUseCase } from 'src/core/use-cases/packs.use-case';
import { ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UUIDv4 } from 'src/common/types';
import { Mapper } from '@automapper/core';
import { PackEntity } from 'src/infra/postgres/entities/pack.entity';
import { PackOutputDTO } from '../dtos/packs/pack.output.dto';
import { DataSource } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { OpenPackOutputDTO } from '../dtos/packs/open-pack.output.dto';
import { UserOutputDTO } from '../dtos/users/user.output.dto';
import { PokemonEntity } from 'src/infra/postgres/entities/pokemon.entity';
import { PokemonOutputDTO } from '../dtos/pokemons/pokemon.output.dto';
import { PackWithPokemonsOutputDTO } from '../dtos/packs/pack-with-pokemons.output.dto';

@ApiTags('Packs')
@Controller('packs')
export class PacksController {
  public constructor(
    @InjectMapper()
    private readonly mapper: Mapper,

    private readonly packsUseCase: PacksUseCase,
    private readonly dataSource: DataSource,
  ) {}

  @ApiOkResponse({ type: [PackOutputDTO] })
  @ApiBearerAuth()
  @Get()
  @UseGuards(JwtAuthGuard)
  public async getPacks(): Promise<Array<PackOutputDTO>> {
    const packs = await this.packsUseCase.getPacks();

    return this.mapper.mapArray(packs, PackEntity, PackOutputDTO);
  }

  @ApiOkResponse({ type: PackWithPokemonsOutputDTO })
  @ApiNotFoundResponse()
  @ApiBearerAuth()
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  public async getPack(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: UUIDv4,
  ): Promise<PackWithPokemonsOutputDTO> {
    const pack = await this.packsUseCase.getPack(id);

    return this.mapper.map(pack, PackEntity, PackWithPokemonsOutputDTO);
  }

  // TODO: Get rid of isDuplicate functionality.
  // TODO: openPack should return OpenedPackEntity ({ openedAt: Date, user: UserEntity, pack: PackEntity, pokemon: PokemonEntity })
  @ApiCreatedResponse({ type: OpenPackOutputDTO })
  @ApiNotFoundResponse()
  @ApiBearerAuth()
  @Post(':id/open')
  @UseGuards(JwtAuthGuard)
  public async openPack(
    @User() user: UserModel,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: UUIDv4,
  ) {
    // TODO: Find a nicer way of doing that.
    // Maybe return a class instance from openPack instead of object and then map it?
    const { user: updatedUser, pokemon, isDuplicate } = await this.packsUseCase.openPack(user, id, this.dataSource);

    return {
      user: this.mapper.map(updatedUser, UserEntity, UserOutputDTO),
      pokemon: this.mapper.map(pokemon, PokemonEntity, PokemonOutputDTO),
      isDuplicate,
    };
  }
}
