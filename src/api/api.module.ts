import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/infra/ioc/core-modules/auth.module';
import { AuthController } from './controllers/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalAuthStrategy } from './strategies/local-auth.strategy';
import { UsersModule } from 'src/infra/ioc/core-modules/users.module';
import { AccessTokenAuthStrategy } from './strategies/access-token-auth.strategy';
import { UsersController } from './controllers/users.controller';
import { PacksController } from './controllers/packs.controller';
import { PacksModule } from 'src/infra/ioc/core-modules/packs.module';
import { PokemonsModule } from 'src/infra/ioc/core-modules/pokemons.module';
import { AutomapperModule } from '@automapper/nestjs';
import { UserProfile } from './profiles/user.profile';
import { PokemonProfile } from './profiles/pokemon.profile';
import { PackProfile } from './profiles/pack.profile';
import { UserItemsModule } from 'src/infra/ioc/core-modules/user-items.module';
import { UserItemProfile } from './profiles/user-item.profile';
import { TradesController } from './controllers/trades.controller';
import { TradesModule } from 'src/infra/ioc/core-modules/trades.module';
import { TradeProfile } from './profiles/trade.profile';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CentrifugoModule } from 'src/infra/centrifugo/centrifugo.module';
import { CentrifugoController } from './controllers/centrifugo.controller';
import { RefreshTokenAuthStrategy } from './strategies/refresh-token-auth.strategy';
import { CronJobsModule } from 'src/infra/cron-jobs/cron-jobs.module';
import { classes } from '@automapper/classes';

@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    PassportModule,

    EventEmitterModule.forRoot(),
    CentrifugoModule,
    CronJobsModule,

    AuthModule,
    PokemonsModule,
    UsersModule,
    UserItemsModule,
    PacksModule,
    TradesModule,
  ],
  providers: [
    // strategies
    LocalAuthStrategy,
    AccessTokenAuthStrategy,
    RefreshTokenAuthStrategy,

    // profiles
    UserProfile,
    UserItemProfile,
    PokemonProfile,
    PackProfile,
    TradeProfile,
  ],
  controllers: [
    AuthController,
    UsersController,
    PacksController,
    TradesController,
    CentrifugoController,
  ],
})
export class ApiModule {}
