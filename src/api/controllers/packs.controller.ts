import { Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { UserModel } from 'src/infra/postgres/entities/user.entity';
import { PacksUseCase } from 'src/core/use-cases/packs.use-case';
import { ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UUIDv4 } from 'src/common/types';
import { Mapper } from '@automapper/core';
import { PackEntity } from 'src/infra/postgres/entities/pack.entity';
import { PackOutputDTO } from '../dtos/packs/pack.output.dto';
import { DataSource } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { PackWithPokemonsOutputDTO } from '../dtos/packs/pack-with-pokemons.output.dto';
import { OpenedPackEntity } from 'src/infra/postgres/entities/opened-pack.entity';
import { OpenedPackOutputDTO } from '../dtos/packs/opened-pack.output.dto';

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
  @ApiSecurity('AccessToken')
  @Get()
  @UseGuards(JwtAuthGuard)
  public async getPacks(): Promise<Array<PackOutputDTO>> {
    const packs = await this.packsUseCase.getPacks();

    return this.mapper.mapArray(packs, PackEntity, PackOutputDTO);
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

    return this.mapper.map(pack, PackEntity, PackWithPokemonsOutputDTO);
  }

  @ApiCreatedResponse({ type: OpenedPackOutputDTO })
  @ApiConflictResponse()
  @ApiNotFoundResponse()
  @ApiSecurity('AccessToken')
  @Post(':id/open')
  @UseGuards(JwtAuthGuard)
  public async openPack(
    @User() user: UserModel,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: UUIDv4,
  ) {
    const openedPack = await this.packsUseCase.openPack(user, id, this.dataSource);

    return this.mapper.map(openedPack, OpenedPackEntity, OpenedPackOutputDTO);
  }
}
