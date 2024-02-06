import { ApiProperty, ApiPropertyOptions } from "@nestjs/swagger";

export const ApiPropertyUUIDv4 = (options?: ApiPropertyOptions) => ApiProperty({
  ...options,
  type: String,
  format: 'uuid',
});
