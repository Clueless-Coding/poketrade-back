import { Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { UserModel } from 'src/infra/postgres/entities/user.entity';
import { PacksUseCase } from 'src/core/use-cases/packs.use-case';
import { ApiTags } from '@nestjs/swagger';
import { UUIDv4 } from 'src/common/types';
import { Mapper } from '@automapper/core';
import { PackEntity } from 'src/infra/postgres/entities/pack.entity';
import { PackOutputDTO } from '../dtos/packs/pack.output.dto';
import { DataSource } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';

@ApiTags('Packs')
@Controller('packs')
export class PacksController {
  public constructor(
    @InjectMapper()
    private readonly mapper: Mapper,

    private readonly packsUseCase: PacksUseCase,
    private readonly dataSource: DataSource,
  ) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  public async getPack(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: UUIDv4,
  ) {
    const pack = await this.packsUseCase.getPack({ id });

    return this.mapper.map(pack, PackEntity, PackOutputDTO);
  }

  @Post(':id/open')
  @UseGuards(JwtAuthGuard)
  public async openPack(
    @User() user: UserModel,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: UUIDv4,
  ) {
    return this.packsUseCase.openPack(user, id, this.dataSource);
  }
}
