import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1703480142823 implements MigrationInterface {
    name = 'Initial1703480142823'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" text NOT NULL, "hashed_password" text NOT NULL, "balance" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_51b8b26ac168fbe7d6f5653e6cf" UNIQUE ("name"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pokemons" ("id" integer NOT NULL, "name" text NOT NULL, "worth" integer NOT NULL, "height" integer NOT NULL, "weight" integer NOT NULL, "image" text NOT NULL, CONSTRAINT "PK_a3172290413af616d9cfa1fdc9a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_pokemons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "received_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "pokemon_id" integer NOT NULL, CONSTRAINT "PK_054e7e2e4a01e3050b55111d3c7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "packs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" text NOT NULL, "description" text NOT NULL, "price" integer NOT NULL, "image" text NOT NULL, CONSTRAINT "PK_da3c6e998aaa9331767c51e7f91" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pack_pokemons" ("pack_id" uuid NOT NULL, "pokemon_id" integer NOT NULL, CONSTRAINT "PK_c416e0899115c396297f195dffa" PRIMARY KEY ("pack_id", "pokemon_id"))`);
        await queryRunner.query(`CREATE TABLE "opened_packs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "opened_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "pack_id" uuid NOT NULL, "pokemon_id" integer NOT NULL, CONSTRAINT "PK_97f5101e85f0c26cfb0fe95f5d1" PRIMARY KEY ("id"))`);

        await queryRunner.query(`CREATE INDEX "IDX_58a812ace3cc61f45cf7767069" ON "pack_pokemons" ("pack_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_663de8bf5f58ec8e3b7abbc201" ON "pack_pokemons" ("pokemon_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f88720bd43951183dffc5f01ef" ON "user_pokemons" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_d90708b1680aefe7f684e73f93" ON "user_pokemons" ("pokemon_id") `);

        await queryRunner.query(`ALTER TABLE "opened_packs" ADD CONSTRAINT "FK_ee98df0266a5a13c3d4207db309" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "opened_packs" ADD CONSTRAINT "FK_c6507fc72215afb5fab7791f00e" FOREIGN KEY ("pack_id") REFERENCES "packs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "opened_packs" ADD CONSTRAINT "FK_70fc301a6647b4eea93eddf4612" FOREIGN KEY ("pokemon_id") REFERENCES "pokemons"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_pokemons" ADD CONSTRAINT "FK_f88720bd43951183dffc5f01ef7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_pokemons" ADD CONSTRAINT "FK_d90708b1680aefe7f684e73f93f" FOREIGN KEY ("pokemon_id") REFERENCES "pokemons"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "pack_pokemons" ADD CONSTRAINT "FK_58a812ace3cc61f45cf77670695" FOREIGN KEY ("pack_id") REFERENCES "packs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "pack_pokemons" ADD CONSTRAINT "FK_663de8bf5f58ec8e3b7abbc2019" FOREIGN KEY ("pokemon_id") REFERENCES "pokemons"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pack_pokemons" DROP CONSTRAINT "FK_663de8bf5f58ec8e3b7abbc2019"`);
        await queryRunner.query(`ALTER TABLE "pack_pokemons" DROP CONSTRAINT "FK_58a812ace3cc61f45cf77670695"`);
        await queryRunner.query(`ALTER TABLE "user_pokemons" DROP CONSTRAINT "FK_d90708b1680aefe7f684e73f93f"`);
        await queryRunner.query(`ALTER TABLE "user_pokemons" DROP CONSTRAINT "FK_f88720bd43951183dffc5f01ef7"`);
        await queryRunner.query(`ALTER TABLE "opened_packs" DROP CONSTRAINT "FK_70fc301a6647b4eea93eddf4612"`);
        await queryRunner.query(`ALTER TABLE "opened_packs" DROP CONSTRAINT "FK_c6507fc72215afb5fab7791f00e"`);
        await queryRunner.query(`ALTER TABLE "opened_packs" DROP CONSTRAINT "FK_ee98df0266a5a13c3d4207db309"`);

        await queryRunner.query(`DROP INDEX "public"."IDX_d90708b1680aefe7f684e73f93"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f88720bd43951183dffc5f01ef"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_663de8bf5f58ec8e3b7abbc201"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_58a812ace3cc61f45cf7767069"`);

        await queryRunner.query(`DROP TABLE "opened_packs"`);
        await queryRunner.query(`DROP TABLE "pack_pokemons"`);
        await queryRunner.query(`DROP TABLE "packs"`);
        await queryRunner.query(`DROP TABLE "user_pokemons"`);
        await queryRunner.query(`DROP TABLE "pokemons"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
