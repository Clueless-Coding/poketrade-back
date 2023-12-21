import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntity } from '../other/base.entity';
import { AutoMap } from '@automapper/classes';
import { PokemonEntity } from './pokemon.entity';

@Entity('packs')
export class PackEntity extends BaseEntity {
  @AutoMap()
  @Column({ type: 'text' })
  public readonly name: string;

  @AutoMap()
  @Column({ type: 'text' })
  public readonly description: string;

  @AutoMap()
  @Column({ type: 'integer' })
  public readonly price: number;

  // NOTE: URL
  @AutoMap()
  @Column({ type: 'text' })
  public readonly image: string;

  @AutoMap(() => PokemonEntity)
  @ManyToMany(() => PokemonEntity)
  @JoinTable({
    name: 'packs_pokemons',
    joinColumn: { name: 'pack_id' },
    inverseJoinColumn: { name: 'pokemon_id' },
  })
  public readonly pokemons?: PokemonEntity[];
}

export type PackEntityRelations = keyof Pick<PackEntity, 'pokemons'>;

export type PackModel<T extends PackEntityRelations = never> =
  & Omit<PackEntity, PackEntityRelations>
  & Required<Pick<PackEntity, T>>;
