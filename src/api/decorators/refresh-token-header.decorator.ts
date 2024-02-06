import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';

export const RefreshTokenHeader = createParamDecorator(
  (_data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<ExpressRequest>();

    return request.headers['x-refresh-token'];
  },
);
