import { AutoMap } from '@automapper/classes';
import { CreateModel, CreateEntityFields, FindEntityRelationsOptions } from '../other/types';
import { CreateDateColumn, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../other/base.entity';
import { PackEntity } from './pack.entity';
import { PokemonEntity } from './pokemon.entity';
import { UserEntity } from './user.entity';

@Entity('opened_packs')
export class OpenedPackEntity extends BaseEntity {
  @AutoMap()
  @CreateDateColumn({ type: 'timestamptz' })
  public readonly openedAt: Date;

  @AutoMap(() => UserEntity)
  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  public readonly user: UserEntity;

  @AutoMap(() => PackEntity)
  @ManyToOne(() => PackEntity, { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  public readonly pack: PackEntity;

  @AutoMap(() => PokemonEntity)
  @ManyToOne(() => PokemonEntity, { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  public readonly pokemon: PokemonEntity;
}

export type CreateOpenedPackEntityFields = CreateEntityFields<
  OpenedPackEntity,
  'user' | 'pack' | 'pokemon'
>;

export type UpdateOpenedPackEntityFields = never;

export type OpenedPackModel<
  T extends FindEntityRelationsOptions<OpenedPackEntity> = {},
> = CreateModel<OpenedPackEntity, T>;
