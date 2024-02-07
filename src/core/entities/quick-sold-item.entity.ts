import { AutoMap } from '@automapper/classes';
import { UUIDv4 } from 'src/common/types';

export class QuickSoldItemEntity {
  @AutoMap()
  public readonly soldAt: Date;

  @AutoMap()
  public readonly userId: UUIDv4;

  @AutoMap()
  public readonly itemId: UUIDv4;
}
