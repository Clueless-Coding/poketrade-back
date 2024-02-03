import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AcceptedTradeEntity, PendingTradeEntity, UserEntity } from '../postgres/tables';
import { CentClient } from 'cent.js';
import { PENDING_TRADE_ACCEPTED_EVENT, PENDING_TRADE_CREATED_EVENT } from 'src/core/events';
import { ConfigService } from '@nestjs/config';
import { EnvVariables } from '../config/env.config';
import { JWT } from 'src/common/types';
import { JwtService } from '@nestjs/jwt';

const CENTRIFUGO_PERSONAL_NAMESPACE = 'personal';
const logCentrifugoError = (channel: string, error: unknown) => {
  Logger.warn(`Publish to ${channel} failed. Error: ${error}`, 'Centrifugo');
};

@Injectable()
export class CentrifugoService {
  private readonly centrifugoClient: CentClient;

  public constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvVariables>,
  ) {
    this.centrifugoClient = new CentClient({
      url: configService.getOrThrow('CENTRIFUGO_API_URL'),
      token: configService.getOrThrow('CENTRIFUGO_API_KEY'),
    });
  }

  public generateCentrifugoConnectionToken(user: UserEntity): Promise<JWT> {
    return this.jwtService.signAsync({}, {
      secret: this.configService.getOrThrow('CENTRIFUGO_TOKEN_HMAC_SECRET_KEY'),
      subject: user.id,
      expiresIn: this.configService.getOrThrow('CENTRIFUGO_CONNECTION_TOKEN_EXPIRES_IN'),
    }) as Promise<JWT>;
  }

  public generateCentrifugoSubscriptionToken(user: UserEntity): Promise<JWT> {
    const channel = `${CENTRIFUGO_PERSONAL_NAMESPACE}:${user.id}`;

    return this.jwtService.signAsync({ channel }, {
      secret: this.configService.getOrThrow('CENTRIFUGO_TOKEN_HMAC_SECRET_KEY'),
      subject: user.id,
      expiresIn: this.configService.getOrThrow('CENTRIFUGO_SUBSCRIPTION_TOKEN_EXPIRES_IN'),
    }) as Promise<JWT>;
  }

  @OnEvent(PENDING_TRADE_CREATED_EVENT)
  public async handlePendingTradeCreatedEvent(
    pendingTrade: PendingTradeEntity,
  ): Promise<void> {
    const channel = `${CENTRIFUGO_PERSONAL_NAMESPACE}:${pendingTrade.receiver.id}`;

    try {
      await this.centrifugoClient.publish({
        channel,
        data: {
          topic: PENDING_TRADE_CREATED_EVENT,
          data: pendingTrade,
        },
      });
    } catch (error) {
      logCentrifugoError(channel, error);
    }
  }

  @OnEvent(PENDING_TRADE_ACCEPTED_EVENT)
  public async handlePendingTradeAcceptedEvent(
    acceptedTrade: AcceptedTradeEntity,
  ): Promise<void> {
    const channel = `${CENTRIFUGO_PERSONAL_NAMESPACE}:${acceptedTrade.sender.id}`;

    try {
      await this.centrifugoClient.publish({
        channel,
        data: {
          topic: PENDING_TRADE_ACCEPTED_EVENT,
          data: acceptedTrade,
        }
      });
    } catch (error) {
      logCentrifugoError(channel, error);
    }
  }
}
