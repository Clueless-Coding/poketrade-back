import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserInputDTO {
  @IsString()
  @IsNotEmpty()
  public readonly name: string;

  @IsString()
  @IsNotEmpty()
  public readonly hashedPassword: string;
}
