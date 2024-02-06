import { JWT } from '../types';
import * as crypto from 'node:crypto';

export const hashRefreshToken = (refreshToken: JWT) => (
  crypto.createHash('sha256').update(refreshToken).digest('hex')
)
