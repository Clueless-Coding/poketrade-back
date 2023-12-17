import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PokemonsService } from "../services/pokemons.service";
import { PokemonEntity } from "src/infra/postgres/entities/pokemon.entity";

@Injectable()
export class PokemonsUseCase {
  public constructor(private readonly pokemonsService: PokemonsService) {}

  public async getRandom(): Promise<PokemonEntity> {
    const pokemons = await this.pokemonsService.find();

    if (!pokemons.length) {
      throw new HttpException(
        'There are no pokemons in the database. Please notify the developer about it :)',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return pokemons[Math.floor(pokemons.length * Math.random())];
  }
}
