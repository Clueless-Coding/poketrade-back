import { ApiProperty } from '@nestjs/swagger';
import { Length, Matches } from 'class-validator';
import { IsNotEmptyString } from 'src/common/decorators/is-not-empty-string.decorator';

export class RegisterInputDTO {
  @ApiProperty()
  @IsNotEmptyString()
  @Length(3, 20)
  @Matches(/^[a-zA-Z0-9_]+$/)
  public readonly username: string;

  @ApiProperty()
  @IsNotEmptyString()
  public readonly password: string;

  @ApiProperty()
  @IsNotEmptyString()
  public readonly confirmPassword: string;
}
