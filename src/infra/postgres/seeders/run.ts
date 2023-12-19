import { seeder } from "nestjs-seeder";
import { PokemonsSeeder } from "./pokemons.seeder";
import { PokemonsModule } from "src/infra/ioc/pokemons.module";

seeder({
  imports: [PokemonsModule],
}).run([PokemonsSeeder]);
