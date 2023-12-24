import { MigrationInterface, QueryRunner } from "typeorm";

export class OpenedPacks1703395663580 implements MigrationInterface {
    name = 'OpenedPacks1703395663580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "opened_packs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "opened_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "pack_id" uuid NOT NULL, "pokemon_id" integer NOT NULL, CONSTRAINT "PK_97f5101e85f0c26cfb0fe95f5d1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "opened_packs" ADD CONSTRAINT "FK_ee98df0266a5a13c3d4207db309" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "opened_packs" ADD CONSTRAINT "FK_c6507fc72215afb5fab7791f00e" FOREIGN KEY ("pack_id") REFERENCES "packs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "opened_packs" ADD CONSTRAINT "FK_70fc301a6647b4eea93eddf4612" FOREIGN KEY ("pokemon_id") REFERENCES "pokemons"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "opened_packs" DROP CONSTRAINT "FK_70fc301a6647b4eea93eddf4612"`);
        await queryRunner.query(`ALTER TABLE "opened_packs" DROP CONSTRAINT "FK_c6507fc72215afb5fab7791f00e"`);
        await queryRunner.query(`ALTER TABLE "opened_packs" DROP CONSTRAINT "FK_ee98df0266a5a13c3d4207db309"`);
        await queryRunner.query(`DROP TABLE "opened_packs"`);
    }

}
