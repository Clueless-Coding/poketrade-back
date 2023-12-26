import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { IsPositiveInt } from 'src/common/decorators/is-positive-int.decorator';

export class PaginationInputDTO {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsPositiveInt()
  @IsOptional()
  public readonly page: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @Type(() => Number)
  @IsPositiveInt()
  @IsOptional()
  public readonly limit: number = 10;
}
