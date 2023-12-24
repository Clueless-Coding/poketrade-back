import { PartialType } from '@nestjs/swagger';
import { CreateUserInputDTO } from './create-user.input.dto';
import { IsArray, IsInt, IsOptional, IsPositive } from 'class-validator';
import { PokemonEntity } from 'src/infra/postgres/entities/pokemon.entity';

export class UpdateUserInputDTO extends PartialType(CreateUserInputDTO) {
  @IsArray()
  @IsOptional()
  // TODO: change it to its own dto?
  public readonly pokemons?: PokemonEntity[];

  @IsInt()
  @IsPositive()
  @IsOptional()
  public readonly balance?: number;
}
