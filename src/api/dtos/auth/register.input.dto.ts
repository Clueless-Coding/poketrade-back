import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyString } from 'src/common/decorators/is-not-empty-string.decorator';

export class RegisterInputDTO {
  @ApiProperty()
  @IsNotEmptyString()
  public readonly username: string;

  @ApiProperty()
  @IsNotEmptyString()
  public readonly password: string;

  @ApiProperty()
  @IsNotEmptyString()
  public readonly confirmPassword: string;
}
