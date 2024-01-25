import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { IsPositiveInt } from 'src/common/decorators/is-positive-int.decorator';
import { UUIDv4 } from 'src/common/types';

export class GetUserItemsInputDTO {
  @ApiPropertyOptional()
  @IsUUID(4)
  @IsOptional()
  public readonly id?: UUIDv4;

  @ApiPropertyOptional()
  @IsUUID(4)
  @IsOptional()
  public readonly userId?: UUIDv4;

  @ApiPropertyOptional()
  @IsPositiveInt()
  @IsOptional()
  public readonly pokemonId?: number;
}
