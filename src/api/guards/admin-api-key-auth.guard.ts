import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request as ExpressRequest } from 'express';
import { EnvVariables } from 'src/infra/config/env.config';

@Injectable()
export class AdminApiKeyAuthGuard implements CanActivate {
  public constructor(
    private readonly configService: ConfigService<EnvVariables>,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ExpressRequest>();
    const adminApiKeyHeader = request.headers['x-api-key'];

    if (!adminApiKeyHeader) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const adminApiKey = this.configService.getOrThrow('ADMIN_API_KEY');

    if (adminApiKeyHeader !== adminApiKey) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return true;
  }
}
