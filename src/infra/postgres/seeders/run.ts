import { seeder } from "nestjs-seeder";
import { PokemonsSeeder } from "./pokemons.seeder";
import { PokemonsModule } from "src/infra/ioc/core-modules/pokemons.module";

seeder({
  imports: [PokemonsModule],
}).run([PokemonsSeeder]);
