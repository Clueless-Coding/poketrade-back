import * as bcrypt from 'bcrypt';

export const hashUserPassword = async (password: string): Promise<string> => (
  bcrypt.hash(password, 10)
)
