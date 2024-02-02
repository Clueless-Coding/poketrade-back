import { Inject } from '@nestjs/common';
import { DRIZZLE_DB_INJECTION_TOKEN } from '../injection-tokens';

export const InjectDatabase = () => Inject(DRIZZLE_DB_INJECTION_TOKEN);
