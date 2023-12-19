import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PokemonsService } from "../services/pokemons.service";
import { PokemonModel } from "src/infra/postgres/entities/pokemon.entity";
import { randomChoice } from "src/common/helpers/random-choice.helper";

@Injectable()
export class PokemonsUseCase {
  public constructor(private readonly pokemonsService: PokemonsService) {}

  public async getRandom(): Promise<PokemonModel> {
    const pokemons = await this.pokemonsService.find();

    const pokemon = randomChoice(pokemons);

    if (!pokemon) {
      throw new HttpException(
        'There are no pokemons in the database. Please notify the developer about it :)',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return pokemon;
  }
}
