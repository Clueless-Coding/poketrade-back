import { MigrationInterface, QueryRunner } from "typeorm";

export class QuickSoldUserInventoryEntries1704640865163 implements MigrationInterface {
    name = 'QuickSoldUserInventoryEntries1704640865163'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "quick_sold_user_inventory_entries" ("id" uuid NOT NULL, "received_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "sold_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "pokemon_id" integer NOT NULL, CONSTRAINT "PK_8a445c7163a9ce39321a593c73c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "quick_sold_user_inventory_entries" ADD CONSTRAINT "FK_5824f936a8f191d4a9eda96160d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "quick_sold_user_inventory_entries" ADD CONSTRAINT "FK_182f7a7f9017682aeb6e48895b7" FOREIGN KEY ("pokemon_id") REFERENCES "pokemons"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quick_sold_user_inventory_entries" DROP CONSTRAINT "FK_182f7a7f9017682aeb6e48895b7"`);
        await queryRunner.query(`ALTER TABLE "quick_sold_user_inventory_entries" DROP CONSTRAINT "FK_5824f936a8f191d4a9eda96160d"`);
        await queryRunner.query(`DROP TABLE "quick_sold_user_inventory_entries"`);
    }

}
