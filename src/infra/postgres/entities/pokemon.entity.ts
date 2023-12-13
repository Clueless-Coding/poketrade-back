import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('pokemons')
export class PokemonEntity {
  @PrimaryColumn({ type: 'integer' })
  public readonly id: number;

  @Column({ type: 'text' })
  public readonly name: string;

  @Column({ type: 'integer' })
  public readonly worth: number;

  @Column({ type: 'integer' })
  public readonly height: number;

  @Column({ type: 'integer' })
  public readonly weight: number;

  // NOTE: URL
  @Column({ type: 'text' })
  public readonly image: string;
}
