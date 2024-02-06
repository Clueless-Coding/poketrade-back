import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';

export const ApiPropertyJWT = (options?: ApiPropertyOptions) => ApiProperty({
  ...options,
  type: String,
  pattern: '^[A-Za-z0-9-_]{15}\\.[A-Za-z0-9-_]{20}\\.[A-Za-z0-9-_]{20}$',
});

