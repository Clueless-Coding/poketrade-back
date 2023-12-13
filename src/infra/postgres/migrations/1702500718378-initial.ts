import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1702500718378 implements MigrationInterface {
    name = 'Initial1702500718378'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "pokemons" ("id" integer NOT NULL, "name" text NOT NULL, "worth" integer NOT NULL, "height" integer NOT NULL, "weight" integer NOT NULL, "image" text NOT NULL, CONSTRAINT "PK_a3172290413af616d9cfa1fdc9a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" text NOT NULL, "hashed_password" text NOT NULL, "balance" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_51b8b26ac168fbe7d6f5653e6cf" UNIQUE ("name"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users_pokemons" ("user_id" uuid NOT NULL, "pokemon_id" integer NOT NULL, CONSTRAINT "PK_bbe72b359e776584232a6fd07a7" PRIMARY KEY ("user_id", "pokemon_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1079235fcb432945395884e803" ON "users_pokemons" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_db47d1b67443501b3c5196a9ce" ON "users_pokemons" ("pokemon_id") `);
        await queryRunner.query(`ALTER TABLE "users_pokemons" ADD CONSTRAINT "FK_1079235fcb432945395884e8036" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_pokemons" ADD CONSTRAINT "FK_db47d1b67443501b3c5196a9cec" FOREIGN KEY ("pokemon_id") REFERENCES "pokemons"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_pokemons" DROP CONSTRAINT "FK_db47d1b67443501b3c5196a9cec"`);
        await queryRunner.query(`ALTER TABLE "users_pokemons" DROP CONSTRAINT "FK_1079235fcb432945395884e8036"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_db47d1b67443501b3c5196a9ce"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1079235fcb432945395884e803"`);
        await queryRunner.query(`DROP TABLE "users_pokemons"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "pokemons"`);
    }

}
