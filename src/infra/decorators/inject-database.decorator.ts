import { Inject } from '@nestjs/common';
import { DRIZZLE_DB_TAG } from '../consts';

export const InjectDatabase = () => Inject(DRIZZLE_DB_TAG);
