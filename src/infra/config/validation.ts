import { IsEnum, IsOptional, IsString, IsUrl, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { IsPortNumber } from 'src/common/decorators/is-port-number.decorator';

export enum NodeEnv {
  DEV = 'dev',
  PROD = 'prod',
  TEST = 'test',
}

export class EnvVariables {
  @IsOptional()
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.DEV;

  @IsOptional()
  @IsString()
  HOST: string = '127.0.0.1';

  @IsOptional()
  @IsPortNumber()
  PORT: number = 3000;

  @IsString()
  POSTGRES_HOST: string;

  @IsPortNumber()
  POSTGRES_PORT: number;

  @IsString()
  POSTGRES_USER: string;

  @IsString()
  POSTGRES_PASSWORD: string;

  @IsString()
  POSTGRES_DB: string;

  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_ACCESS_EXPIRES_IN: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string;

  @IsString()
  CENTRIFUGO_API_URL: string;

  @IsString()
  CENTRIFUGO_API_KEY: string;

  @IsString()
  CENTRIFUGO_TOKEN_HMAC_SECRET_KEY: string;

  @IsString()
  CENTRIFUGO_CONNECTION_TOKEN_EXPIRES_IN: string;

  @IsString()
  CENTRIFUGO_SUBSCRIPTION_TOKEN_EXPIRES_IN: string;
}

export const validate = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(EnvVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig);

  if (errors.length) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
};
