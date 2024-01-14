import { AutoMap } from '@automapper/classes';
import { CreateDateColumn, Entity, ManyToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from '../other/base.entity';
import { CreateEntityFields, CreateModel, FindEntityRelationsOptions } from '../other/types';
import { PokemonEntity } from './pokemon.entity';
// import { TradeEntity } from './trade.entity';
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

  // @AutoMap(() => [TradeEntity])
  // @ManyToMany(() => TradeEntity, (trade) => trade.senderInventoryEntries)
  // public readonly sendingTrades: Array<TradeEntity>;
  //
  // @AutoMap(() => [TradeEntity])
  // @ManyToMany(() => TradeEntity, (trade) => trade.receiverInventoryEntries)
  // public readonly receivingTrades: Array<TradeEntity>;
}

export type CreateUserInventoryEntryEntityFields = CreateEntityFields<
  UserInventoryEntryEntity,
  'user' | 'pokemon'
>;

export type UpdateUserInventoryEntryEntityFields = Pick<
  Partial<CreateUserInventoryEntryEntityFields>,
  'user'
>;

export type UserInventoryEntryModel<
  T extends FindEntityRelationsOptions<UserInventoryEntryEntity> = {},
> = CreateModel<UserInventoryEntryEntity, T>;
