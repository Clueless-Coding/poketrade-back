import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PokemonEntity } from "../entities/pokemon.entity";
import { Seeder } from "nestjs-seeder";

@Injectable()
export class PokemonsSeeder implements Seeder {
  constructor(
    @InjectRepository(PokemonEntity) private readonly pokemonsRepository: Repository<PokemonEntity>,
  ) {}

  async seed() {
    // TODO: Maybe i can do that with a single request? Research on that
    const requests = [...Array(152).keys()]
      .map((i) => fetch(`https://pokeapi.co/api/v2/pokemon/${i + 1}`));

    const apiPokemons = await Promise.all(
      requests.map(request => request.then(response => response.json())),
    );

    const pokemons = []
    for (const apiPokemon of apiPokemons) {
      const pokemon = this.pokemonsRepository.create({
        id: apiPokemon['id'],
        name: apiPokemon['name'],
        worth: apiPokemon['base_experience'],
        height: apiPokemon['height'],
        weight: apiPokemon['weight'],
        image: apiPokemon['sprites']['other']['official-artwork']['front_default'],
      });

      pokemons.push(pokemon);
    }

    return this.pokemonsRepository.save(pokemons);
  }

  async drop() {
    return this.pokemonsRepository.delete({});
  }
}
