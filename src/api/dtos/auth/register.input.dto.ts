import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterInputDTO {
  @IsString()
  @IsNotEmpty()
  public readonly username: string;

  @IsString()
  @IsNotEmpty()
  public readonly password: string;

  @IsString()
  @IsNotEmpty()
  public readonly confirmPassword: string;
}
