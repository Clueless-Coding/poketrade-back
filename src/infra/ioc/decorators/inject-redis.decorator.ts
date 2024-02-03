import { Inject } from '@nestjs/common';
import { REDIS_CLIENT_INJECTION_TOKEN } from '../../ioc/injection-tokens';

export const InjectRedis = () => Inject(REDIS_CLIENT_INJECTION_TOKEN);
