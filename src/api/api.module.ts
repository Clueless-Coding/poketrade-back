import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EnvVariables } from 'src/infra/config/validation';
import { AuthModule } from 'src/infra/ioc/auth.module';
import { AuthController } from './controllers/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalAuthStrategy } from './strategies/local-auth.strategy';
import { UsersModule } from 'src/infra/ioc/users.module';

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
    PassportModule,

    AuthModule,
    UsersModule,
  ],
  providers: [LocalAuthStrategy],
  controllers: [AuthController],
})
export class ApiModule {}
