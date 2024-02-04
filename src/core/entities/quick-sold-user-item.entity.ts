import { AutoMap } from '@automapper/classes';
import { UserItemEntity } from './user-item.entity';

export class QuickSoldUserItemEntity extends UserItemEntity {
  @AutoMap()
  public readonly soldAt: Date;
}
