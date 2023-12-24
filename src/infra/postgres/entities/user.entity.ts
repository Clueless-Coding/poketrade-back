import { Column, Entity, JoinTable, ManyToMany, OneToMany, FindOptionsRelations } from 'typeorm';
import { BaseEntity } from '../other/base.entity';
import { PokemonEntity } from './pokemon.entity';
import { AutoMap } from '@automapper/classes';
import { OpenedPackEntity } from './opened-pack.entity';
import { GetEntityRelations, CreateModel, From } from '../other/types';

@Entity('users')
export class UserEntity<
  T extends FindOptionsRelations<UserEntity<T>> = {},
> extends BaseEntity {
  @AutoMap()
  @Column({ type: 'text', unique: true })
  public readonly name: string;

  @Column({ type: 'text' })
  public readonly hashedPassword: string;

  // TODO: consider adding check constraint
  @AutoMap()
  @Column({ type: 'integer', default: 0 })
  public readonly balance: number;

  @AutoMap(() => PokemonEntity)
  @ManyToMany(() => PokemonEntity)
  @JoinTable({
    name: 'users_pokemons',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'pokemon_id' },
  })
  public readonly pokemons: Array<PokemonEntity<From<T['pokemons']>>>;

  @OneToMany(() => OpenedPackEntity, (openedPack) => openedPack.user)
  public readonly openedPacks: Array<OpenedPackEntity<From<T['openedPacks']>>>;
}

type UserEntityRelations = GetEntityRelations<UserEntity, 'pokemons' | 'openedPacks'>;

export type UserModel<
  T extends FindOptionsRelations<UserEntity<T>> = {},
> = CreateModel<UserEntity<T>, UserEntityRelations, T>;
