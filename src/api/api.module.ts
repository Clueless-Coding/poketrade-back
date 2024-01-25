import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EnvVariables } from 'src/infra/config/validation';
import { AuthModule } from 'src/infra/ioc/auth.module';
import { AuthController } from './controllers/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalAuthStrategy } from './strategies/local-auth.strategy';
import { UsersModule } from 'src/infra/ioc/users.module';
import { JwtAuthStrategy } from './strategies/jwt-auth.strategy';
import { UsersController } from './controllers/users.controller';
import { PacksController } from './controllers/packs.controller';
import { PacksModule } from 'src/infra/ioc/packs.module';
import { PokemonsModule } from 'src/infra/ioc/pokemons.module';
import { AutomapperModule } from '@automapper/nestjs';
import { UserProfile } from './profiles/user.profile';
import { PokemonProfile } from './profiles/pokemon.profile';
import { PackProfile } from './profiles/pack.profile';
import { UserItemsModule } from 'src/infra/ioc/user-items.module';
import { UserItemProfile } from './profiles/user-item.profile';
import { TradesController } from './controllers/trades.controller';
import { TradesModule } from 'src/infra/ioc/trades.module';
import { TradeProfile } from './profiles/trade.profile';
import { pojos } from '@automapper/pojos';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService<EnvVariables>],
      useFactory: (configService: ConfigService<EnvVariables>) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: { expiresIn: configService.getOrThrow('JWT_EXPIRES_IN') }
      }),
      global: true,
    }),
    AutomapperModule.forRoot({
      strategyInitializer: pojos(),
    }),
    PassportModule,

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
    JwtAuthStrategy,

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
  ],
})
export class ApiModule {}
