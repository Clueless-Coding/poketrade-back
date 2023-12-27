import { AutoMap } from '@automapper/classes';
import { CreateDateColumn, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../other/base.entity';
import { CreateEntityFields, CreateModel, FindEntityRelationsOptions } from '../other/types';
import { PokemonEntity } from './pokemon.entity';
import { UserEntity } from './user.entity';

@Entity('user_inventory_entries')
export class UserInventoryEntryEntity extends BaseEntity {
  @AutoMap()
  @CreateDateColumn({ type: 'timestamptz' })
  public readonly receivedAt: Date;

  @AutoMap(() => UserEntity)
  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  public readonly user: UserEntity;

  @AutoMap(() => PokemonEntity)
  @ManyToOne(() => PokemonEntity, { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  public readonly pokemon: PokemonEntity;
}

export type CreateUserInventoryEntryEntityFields = CreateEntityFields<
  UserInventoryEntryEntity,
  'user' | 'pokemon'
>;

export type UpdateUserInventoryEntryEntityFields = never;

export type UserInventoryEntryModel<
  T extends FindEntityRelationsOptions<UserInventoryEntryEntity> = {},
> = CreateModel<UserInventoryEntryEntity, T>;
