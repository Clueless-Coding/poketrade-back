import { AutoMap } from '@automapper/classes';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('pokemons')
export class PokemonEntity {
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
export type PokemonEntityRelations = keyof Pick<PokemonEntity, never>;

export type PokemonModel<T extends PokemonEntityRelations = never> =
  & Omit<PokemonEntity, PokemonEntityRelations>
  & Required<Pick<PokemonEntity, T>>;
