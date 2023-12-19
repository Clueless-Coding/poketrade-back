import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { UserModel } from 'src/infra/postgres/entities/user.entity';
import { PacksUseCase } from 'src/core/use-cases/packs.use-case';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Packs')
@Controller('packs')
export class PacksController {
  public constructor(
    private readonly packsUseCase: PacksUseCase,
  ) {}

  @Post('open')
  @UseGuards(JwtAuthGuard)
  public async openPack(@User() user: UserModel) {
    return await this.packsUseCase.openPack(user);
  }
}
