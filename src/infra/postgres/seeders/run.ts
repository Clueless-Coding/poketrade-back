import { seeder } from "nestjs-seeder";
import { PokemonsSeeder } from "./pokemons.seeder";
import { PostgresModule } from "../postgres.module";
import { PokemonEntity } from "../entities/pokemon.entity";

seeder({
  imports: [
    PostgresModule.forFeature([PokemonEntity]),
  ],
}).run([PokemonsSeeder]);
