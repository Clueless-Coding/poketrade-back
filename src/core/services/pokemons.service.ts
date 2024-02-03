import { Injectable } from "@nestjs/common";
import { PokemonsRepository } from "../repositories/pokemons.repository";

@Injectable()
export class PokemonsService {
  public constructor(
    private readonly pokemonsRepository: PokemonsRepository,
  ) {}
}
