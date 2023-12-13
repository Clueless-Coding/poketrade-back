import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntity } from '../other/base.entity';
import { PokemonEntity } from './pokemon.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ type: 'text', unique: true })
  public readonly name: string;

  @Column({ type: 'text' })
  public readonly hashedPassword: string;

  // TODO: consider adding check constraint
  @Column({ type: 'integer', default: 0 })
  public readonly balance: number;

  @ManyToMany(() => PokemonEntity)
  @JoinTable({
    name: 'users_pokemons',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'pokemon_id' },
  })
  public pokemons: PokemonEntity[];
}
