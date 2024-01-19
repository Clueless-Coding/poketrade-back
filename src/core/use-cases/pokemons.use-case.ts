import { Injectable } from "@nestjs/common";
import { PokemonsService } from "../services/pokemons.service";

@Injectable()
export class PokemonsUseCase {
  public constructor(
    private readonly pokemonsService: PokemonsService,
  ) {}
}
