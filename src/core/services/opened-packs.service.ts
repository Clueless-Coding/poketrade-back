import { Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { InjectDrizzle } from 'src/infra/postgres/postgres.module';
import { BaseService } from './base.service';
import * as tables from 'src/infra/postgres/tables';

@Injectable()
export class OpenedPacksService extends BaseService<'openedPacks'> {
  public constructor(
    @InjectDrizzle()
    drizzle: NodePgDatabase<typeof tables>,
  ) {
    super('openedPacks', drizzle);
  }
}
