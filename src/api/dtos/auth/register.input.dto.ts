import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterInputDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public readonly username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public readonly password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public readonly confirmPassword: string;
}
