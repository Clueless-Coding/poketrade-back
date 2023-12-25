import { AutoMap } from '@automapper/classes';
import { CreateModel, GetEntityRelations, From } from '../other/types';
import { CreateDateColumn, Entity, FindOptionsRelations, ManyToOne } from 'typeorm';
import { BaseEntity } from '../other/base.entity';
import { PackEntity } from './pack.entity';
import { PokemonEntity } from './pokemon.entity';
import { UserEntity } from './user.entity';

@Entity('opened_packs')
export class OpenedPackEntity<
  T extends FindOptionsRelations<OpenedPackEntity<T>> = {},
> extends BaseEntity {
  @AutoMap()
  @CreateDateColumn({ type: 'timestamptz' })
  public readonly openedAt: Date;

  @AutoMap()
  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  public readonly user: UserEntity<From<T['user']>>;

  @AutoMap()
  @ManyToOne(() => PackEntity, { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  public readonly pack: PackEntity<From<T['pack']>>;

  @AutoMap()
  @ManyToOne(() => PokemonEntity, { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  public readonly pokemon: PokemonEntity<From<T['pokemon']>>;
}

type OpenedPackEntityRelations = GetEntityRelations<OpenedPackEntity, 'user' | 'pack' | 'pokemon'>;

export type OpenedPackModel<
  T extends FindOptionsRelations<OpenedPackEntity<T>> = {},
> = CreateModel<OpenedPackEntity<T>, OpenedPackEntityRelations, T>;