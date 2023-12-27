import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { PokemonEntity } from './pokemon.entity';
import { CreateModel, CreateEntityFields, FindEntityRelationsOptions } from '../other/types';
import { BaseWithDateEntity } from '../other/base-with-date.entity';

@Entity('packs')
export class PackEntity extends BaseWithDateEntity {
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

  @AutoMap(() => [PokemonEntity])
  @ManyToMany(() => PokemonEntity)
  @JoinTable({
    name: 'pack_pokemons',
    joinColumn: { name: 'pack_id' },
    inverseJoinColumn: { name: 'pokemon_id' },
  })
  public readonly pokemons: Array<PokemonEntity>;
}

export type CreatePackEntityFields = CreateEntityFields<
  PackEntity,
  'name' | 'description' | 'price' | 'image' | 'pokemons'
>;

export type UpdatePackEntityFields = Partial<CreatePackEntityFields>;

export type PackModel<
  T extends FindEntityRelationsOptions<PackEntity> = {},
> = CreateModel<PackEntity, T>;
