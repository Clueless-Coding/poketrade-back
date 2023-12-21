import { MigrationInterface, QueryRunner } from "typeorm";

export class Packs1703031550685 implements MigrationInterface {
    name = 'Packs1703031550685'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "packs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" text NOT NULL, "description" text NOT NULL, "price" integer NOT NULL, "image" text NOT NULL, CONSTRAINT "PK_da3c6e998aaa9331767c51e7f91" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "packs_pokemons" ("pack_id" uuid NOT NULL, "pokemon_id" integer NOT NULL, CONSTRAINT "PK_fd5fe7d92d488e6661b5f726dc1" PRIMARY KEY ("pack_id", "pokemon_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cb620189456eab3d161fcd9ab7" ON "packs_pokemons" ("pack_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f976685831a08d9550fc1ff4c5" ON "packs_pokemons" ("pokemon_id") `);
        await queryRunner.query(`ALTER TABLE "packs_pokemons" ADD CONSTRAINT "FK_cb620189456eab3d161fcd9ab75" FOREIGN KEY ("pack_id") REFERENCES "packs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "packs_pokemons" ADD CONSTRAINT "FK_f976685831a08d9550fc1ff4c54" FOREIGN KEY ("pokemon_id") REFERENCES "pokemons"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "packs_pokemons" DROP CONSTRAINT "FK_f976685831a08d9550fc1ff4c54"`);
        await queryRunner.query(`ALTER TABLE "packs_pokemons" DROP CONSTRAINT "FK_cb620189456eab3d161fcd9ab75"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f976685831a08d9550fc1ff4c5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cb620189456eab3d161fcd9ab7"`);
        await queryRunner.query(`DROP TABLE "packs_pokemons"`);
        await queryRunner.query(`DROP TABLE "packs"`);
    }

}
