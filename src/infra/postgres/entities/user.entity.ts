import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntity } from '../other/base.entity';
import { PokemonEntity } from './pokemon.entity';
import { AutoMap } from '@automapper/classes';

@Entity('users')
export class UserEntity extends BaseEntity {
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
  public readonly pokemons?: PokemonEntity[];
}

export type UserEntityRelations = keyof Pick<UserEntity, 'pokemons'>;

export type UserModel<T extends UserEntityRelations = never> =
  & Omit<UserEntity, UserEntityRelations>
  & Required<Pick<UserEntity, T>>;
