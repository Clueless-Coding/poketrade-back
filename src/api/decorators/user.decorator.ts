import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppAuthException } from 'src/core/exceptions';

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const { user } = req;

    if (!user) {
      throw new AppAuthException('Unauthorized');
    }

    return user;
  },
);
