import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';
import { IsNotEmptyString } from 'src/common/decorators/is-not-empty-string.decorator';
import { IsPositiveInt } from 'src/common/decorators/is-positive-int.decorator';

export class CreatePackInputDTO {
  @ApiProperty()
  @IsNotEmptyString()
  public readonly name: string;

  @ApiProperty()
  @IsNotEmptyString()
  public readonly description: string;

  @ApiProperty()
  @IsPositiveInt()
  public readonly price: number;

  @ApiProperty({ format: 'uri' })
  @IsUrl()
  public readonly image: string;

  @ApiProperty({ type: Number, isArray: true })
  @IsPositiveInt({ each: true })
  public readonly pokemonIds: Array<number>;
}
