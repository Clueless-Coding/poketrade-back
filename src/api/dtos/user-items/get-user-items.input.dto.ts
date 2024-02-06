import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyUUIDv4 } from 'src/api/decorators/api-property-uuid-v4.decorator';
import { IsPositiveInt } from 'src/common/decorators/is-positive-int.decorator';
import { UUIDv4 } from 'src/common/types';

export class GetUserItemsInputDTO {
  @ApiPropertyUUIDv4({ required: false })
  @IsUUID(4)
  @IsOptional()
  public readonly id?: UUIDv4;

  @ApiPropertyUUIDv4({ required: false })
  @IsUUID(4)
  @IsOptional()
  public readonly userId?: UUIDv4;

  @ApiPropertyOptional()
  @IsPositiveInt()
  @IsOptional()
  public readonly pokemonId?: number;
}
