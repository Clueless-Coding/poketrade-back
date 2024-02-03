import { Injectable } from "@nestjs/common";
import { PokemonsRepository } from "../repositories/pokemons.repository";

@Injectable()
export class PokemonsUseCase {
  public constructor(
    private readonly pokemonsRepository: PokemonsRepository,
  ) {}
}
