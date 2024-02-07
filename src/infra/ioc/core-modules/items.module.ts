import { Module } from "@nestjs/common";
import { IItemsRepository } from "src/core/repositories/items.repository";
import { PostgresModule } from "src/infra/postgres/postgres.module";
import { ItemsRepository } from "src/infra/postgres/repositories/items.repository";
import { UserItemsModule } from "./user-items.module";

@Module({
  imports: [PostgresModule, UserItemsModule],
  providers: [{
    provide: IItemsRepository,
    useClass: ItemsRepository,
  }],
  exports: [IItemsRepository],
})
export class ItemsModule {}
