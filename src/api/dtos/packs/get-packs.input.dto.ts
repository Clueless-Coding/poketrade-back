import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyUUIDv4 } from 'src/api/decorators/api-property-uuid-v4.decorator';
import { UUIDv4 } from 'src/common/types';

export class GetPacksInputDTO {
  @ApiPropertyUUIDv4({ required: false })
  @IsUUID(4)
  @IsOptional()
  public readonly id?: UUIDv4;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  public readonly name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  public readonly nameLike?: string;
}
