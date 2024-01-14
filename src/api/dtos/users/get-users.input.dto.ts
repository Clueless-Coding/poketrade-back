import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetUsersInputDTO {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  public readonly nameLike?: string;
}
