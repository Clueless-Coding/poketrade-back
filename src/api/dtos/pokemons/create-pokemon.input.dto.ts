import { IsUrl } from 'class-validator';
import { IsNotEmptyString } from 'src/common/decorators/is-not-empty-string.decorator';
import { IsPositiveInt } from 'src/common/decorators/is-positive-int.decorator';

export class CreatePokemonInputDTO {
  @IsPositiveInt()
  public readonly id: number;

  @IsNotEmptyString()
  public readonly name: string;

  @IsPositiveInt()
  public readonly worth: number;

  @IsPositiveInt()
  public readonly height: number;

  @IsPositiveInt()
  public readonly weight: number;

  @IsUrl()
  public readonly image: string;
}
