import { AutoMap } from '@automapper/classes';

export class PokemonEntity {
  @AutoMap()
  public readonly id: number;
  @AutoMap()
  public readonly name: string;
  @AutoMap()
  public readonly worth: number;
  @AutoMap()
  public readonly height: number;
  @AutoMap()
  public readonly weight: number;
  @AutoMap()
  public readonly image: string;
}

export type CreatePokemonEntityValues = PokemonEntity;
