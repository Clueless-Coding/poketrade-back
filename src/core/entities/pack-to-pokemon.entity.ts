import { AutoMap } from "@automapper/classes";
import { PackEntity } from "./pack.entity";
import { PokemonEntity } from "./pokemon.entity";

export class PackToPokemonEntity {
  @AutoMap(() => PackEntity)
  public readonly pack: PackEntity;
  @AutoMap(() => PokemonEntity)
  public readonly pokemon: PokemonEntity;
}
