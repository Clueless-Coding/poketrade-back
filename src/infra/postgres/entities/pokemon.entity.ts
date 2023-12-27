import { AutoMap } from '@automapper/classes';
import { CreateEntityFields, CreateModel, FindEntityRelationsOptions } from '../other/types';
import { BaseEntity as TypeormBaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('pokemons')
export class PokemonEntity extends TypeormBaseEntity {
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

export type CreatePokemonEntityFields = CreateEntityFields<
  PokemonEntity,
  'id' | 'name' | 'worth' | 'height' | 'weight' | 'image'
>;

// NOTE: There is no need to ever update PokemonEntity
// since it's loaded from the api
export type UpdatePokemonEntityFields = never;

export type PokemonModel<
  T extends FindEntityRelationsOptions<PokemonEntity> = {}
  > = CreateModel<PokemonEntity, T>;

