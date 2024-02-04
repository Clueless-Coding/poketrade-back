import { Injectable } from "@nestjs/common";
import { IPokemonsRepository } from "../repositories/pokemons.repository";

@Injectable()
export class PokemonsService {
  public constructor(
    private readonly pokemonsRepository: IPokemonsRepository,
  ) {}
}
