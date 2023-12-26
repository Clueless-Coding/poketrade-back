import { AutoMap } from '@automapper/classes';
import { CreateDateColumn, Entity, FindOptionsRelations, ManyToOne } from 'typeorm';
import { BaseEntity } from '../other/base.entity';
import { CreateModel, From, GetEntityRelations } from '../other/types';
import { PokemonEntity } from './pokemon.entity';
import { UserEntity } from './user.entity';

@Entity('user_pokemons')
export class UserPokemonEntity<
  T extends FindOptionsRelations<UserPokemonEntity<T>> = {},
> extends BaseEntity {
  @AutoMap()
  @CreateDateColumn({ type: 'timestamptz' })
  public readonly receivedAt: Date;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  public readonly user: UserEntity<From<T['user']>>;

  @ManyToOne(() => PokemonEntity, { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  public readonly pokemon: PokemonEntity<From<T['pokemon']>>;
}

type UserPokemonEntityRelations = GetEntityRelations<UserPokemonEntity, 'user' | 'pokemon'>;

export type UserPokemonModel<
  T extends FindOptionsRelations<UserPokemonEntity<T>> = {},
> = CreateModel<UserPokemonEntity<T>, UserPokemonEntityRelations, T>;
