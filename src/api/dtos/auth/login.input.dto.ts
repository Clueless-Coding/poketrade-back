import { IsNotEmpty, IsString } from 'class-validator';

export class LoginInputDTO {
  @IsString()
  @IsNotEmpty()
  public readonly username: string;

  @IsString()
  @IsNotEmpty()
  public readonly password: string;
}
