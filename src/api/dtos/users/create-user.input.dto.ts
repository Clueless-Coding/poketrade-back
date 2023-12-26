import { IsNotEmptyString } from 'src/common/decorators/is-not-empty-string.decorator';

export class CreateUserInputDTO {
  @IsNotEmptyString()
  public readonly name: string;

  @IsNotEmptyString()
  public readonly hashedPassword: string;
}
