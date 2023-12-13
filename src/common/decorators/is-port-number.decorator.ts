import { applyDecorators } from '@nestjs/common';
import { IsNumber, Max, Min } from 'class-validator';

export const IsPortNumber = () => {
  return applyDecorators(IsNumber(), Min(0), Max(65535));
};

