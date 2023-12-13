import { IsEnum, IsOptional, IsString, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { IsPortNumber } from 'src/common/decorators/is-port-number.decorator';

export enum NodeEnv {
  DEV = 'DEV',
  PROD = 'PROD',
}

export class EnvVariables {
  @IsOptional()
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.DEV;

  @IsOptional()
  @IsPortNumber()
  PORT: number = 3000;

  @IsOptional()
  @IsString()
  DATABASE_HOST?: string;

  @IsOptional()
  @IsPortNumber()
  DATABASE_PORT?: number;

  @IsOptional()
  @IsString()
  DATABASE_USER?: string;

  @IsOptional()
  @IsString()
  DATABASE_PASSWORD?: string;

  @IsOptional()
  @IsString()
  DATABASE_NAME?: string;

  @IsOptional()
  @IsString()
  JWT_SECRET?: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRES_IN?: string;
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
