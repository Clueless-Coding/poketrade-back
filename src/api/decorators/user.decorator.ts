import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppAuthException } from 'src/core/exceptions';
import { Request as ExpressRequest } from 'express';

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<ExpressRequest>();
    const { user } = request;

    if (!user) {
      throw new AppAuthException('Unauthorized');
    }

    return user;
  },
);
