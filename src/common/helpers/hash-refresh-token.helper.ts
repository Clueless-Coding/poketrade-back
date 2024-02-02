import { JWT } from '../types';
import * as crypto from 'node:crypto';

export const hashRefreshToken = (refreshToken: JWT) => {
  return crypto.createHash('sha256').update(refreshToken).digest('hex');
}
