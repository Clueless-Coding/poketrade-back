import { AutoMap } from '@automapper/classes';
import { CreateEntityFields, CreateModel, GetEntityRelations } from '../other/types';
import { Column, Entity, FindOptionsRelations, PrimaryColumn } from 'typeorm';

@Entity('pokemons')
export class PokemonEntity<
  T extends FindOptionsRelations<PokemonEntity<T>> = {},
> {
  @AutoMap()
  @PrimaryColumn({ type: 'integer' })
  public readonly id: number;

  @AutoMap()
  @Column({ type: 'text' })
  public readonly name: string;

  @AutoMap()
  @Column({ type: 'integer' })
  public readonly worth: number;

  @AutoMap()
  @Column({ type: 'integer' })
  public readonly height: number;

  @AutoMap()
  @Column({ type: 'integer' })
  public readonly weight: number;

  // NOTE: URL
  @AutoMap()
  @Column({ type: 'text' })
  public readonly image: string;
}

// NOTE: If PokemonEntity will have relations add it here
type PokemonEntityRelations = GetEntityRelations<PokemonEntity, never>;

export type CreatePokemonEntityFields = CreateEntityFields<
  PokemonEntity,
  PokemonEntityRelations,
  keyof PokemonEntity
>;

// NOTE: There is no need to ever update PokemonEntity
// since it's loaded from the api
export type UpdatePokemonEntityFields = never;

export type PokemonModel<
  T extends FindOptionsRelations<PokemonEntity<T>> = {}
> = CreateModel<PokemonEntity<T>, PokemonEntityRelations, T>;

