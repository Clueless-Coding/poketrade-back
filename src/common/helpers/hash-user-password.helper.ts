import * as bcrypt from 'bcrypt';

export const hashUserPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
}
