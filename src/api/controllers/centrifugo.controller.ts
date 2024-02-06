import { Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { CentrifugoService } from 'src/infra/centrifugo/centrifugo.service';
import { User } from '../decorators/user.decorator';
import { UserEntity } from 'src/core/entities/user.entity';
import { AccessTokenAuthGuard } from '../guards/access-token-auth.guard';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { GenerateCentrifugoConnectionTokenOutputDTO } from '../dtos/centrifugo/generate-centrifugo-connection-token.output.dto';
import { GenerateCentrifugoSubscriptionTokenOutputDTO } from '../dtos/centrifugo/generate-centrifugo-subscription-token.output.dto';

@ApiTags('Centrifugo')
@Controller('centrifugo')
export class CentrifugoController {
  public constructor(
    private readonly centrifugoService: CentrifugoService,
  ) {}

  @ApiCreatedResponse({ type: GenerateCentrifugoConnectionTokenOutputDTO })
  @ApiBearerAuth('AccessToken')
  @Post('token/connection')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AccessTokenAuthGuard)
  public async generateCentrifugoConnectionToken(
    @User() user: UserEntity,
  ): Promise<GenerateCentrifugoConnectionTokenOutputDTO> {
    const connectionToken = await this.centrifugoService.generateCentrifugoConnectionToken(user);

    return { connectionToken };
  }

  @ApiCreatedResponse({ type: GenerateCentrifugoSubscriptionTokenOutputDTO })
  @ApiBearerAuth('AccessToken')
  @Post('token/subscription')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AccessTokenAuthGuard)
  public async generateCentrifugoSubscriptionToken(
    @User() user: UserEntity,
  ): Promise<GenerateCentrifugoSubscriptionTokenOutputDTO> {
    const subscriptionToken = await this.centrifugoService.generateCentrifugoSubscriptionToken(user);

    return { subscriptionToken };
  }
}
