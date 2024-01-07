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
import { classes } from '@automapper/classes';
import { UserProfile } from './profiles/user.profile';
import { PokemonProfile } from './profiles/pokemon.profile';
import { PackProfile } from './profiles/pack.profile';
import { UserInventoryEntriesModule } from 'src/infra/ioc/user-inventory-entries.module';
import { UserInventoryEntryProfile } from './profiles/user-inventory-entry.profile';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService<EnvVariables>],
      useFactory: (configService: ConfigService<EnvVariables>) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN', '24h') }
      }),
      global: true,
    }),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    PassportModule,

    AuthModule,
    PokemonsModule,
    UsersModule,
    UserInventoryEntriesModule,
    PacksModule,
  ],
  providers: [
    // strategies
    LocalAuthStrategy,
    JwtAuthStrategy,

    // profiles
    UserProfile,
    UserInventoryEntryProfile,
    PokemonProfile,
    PackProfile,
  ],
  controllers: [
    AuthController,
    UsersController,
    PacksController,
  ],
})
export class ApiModule {}
