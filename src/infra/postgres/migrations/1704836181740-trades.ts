import { MigrationInterface, QueryRunner } from "typeorm";

export class Trades1704836181740 implements MigrationInterface {
    name = 'Trades1704836181740'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."trades_status_enum" AS ENUM('PENDING', 'CANCELLED', 'ACCEPTED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "trades" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "status" "public"."trades_status_enum" NOT NULL, "accepted_at" TIMESTAMP WITH TIME ZONE, "cancelled_at" TIMESTAMP WITH TIME ZONE, "rejected_at" TIMESTAMP WITH TIME ZONE, "sender_id" uuid NOT NULL, "receiver_id" uuid NOT NULL, CONSTRAINT "PK_c6d7c36a837411ba5194dc58595" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_358b36d15b38834d8879b74fd0" ON "trades" ("status") `);
        await queryRunner.query(`ALTER TABLE "trades" ADD CONSTRAINT "FK_490f4df080a3862cdb4236505a9" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "trades" ADD CONSTRAINT "FK_d5bd2471ea5175f4bfdb0df0cde" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);

        await queryRunner.query(`CREATE TABLE "trade_sender_inventory_entries" ("trade_id" uuid NOT NULL, "user_inventory_entry_id" uuid NOT NULL, CONSTRAINT "PK_15ec1aa76702e2d6035d9ec8dc1" PRIMARY KEY ("trade_id", "user_inventory_entry_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_366016177a6c2b1cbce45c4bed" ON "trade_sender_inventory_entries" ("trade_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_e0a105937dbd3783f206aa8a37" ON "trade_sender_inventory_entries" ("user_inventory_entry_id") `);
        await queryRunner.query(`ALTER TABLE "trade_sender_inventory_entries" ADD CONSTRAINT "FK_366016177a6c2b1cbce45c4bedd" FOREIGN KEY ("trade_id") REFERENCES "trades"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "trade_sender_inventory_entries" ADD CONSTRAINT "FK_e0a105937dbd3783f206aa8a37a" FOREIGN KEY ("user_inventory_entry_id") REFERENCES "user_inventory_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE`);

        await queryRunner.query(`CREATE TABLE "trade_receiver_inventory_entries" ("trade_id" uuid NOT NULL, "user_inventory_entry_id" uuid NOT NULL, CONSTRAINT "PK_39eda8b0cd21e2b787317c132a1" PRIMARY KEY ("trade_id", "user_inventory_entry_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_74729de60b6f469b7deda99d42" ON "trade_receiver_inventory_entries" ("trade_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_3882b6f9ded8eb8ea156a695e4" ON "trade_receiver_inventory_entries" ("user_inventory_entry_id") `);
        await queryRunner.query(`ALTER TABLE "trade_receiver_inventory_entries" ADD CONSTRAINT "FK_74729de60b6f469b7deda99d42c" FOREIGN KEY ("trade_id") REFERENCES "trades"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "trade_receiver_inventory_entries" ADD CONSTRAINT "FK_3882b6f9ded8eb8ea156a695e43" FOREIGN KEY ("user_inventory_entry_id") REFERENCES "user_inventory_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trade_receiver_inventory_entries" DROP CONSTRAINT "FK_3882b6f9ded8eb8ea156a695e43"`);
        await queryRunner.query(`ALTER TABLE "trade_receiver_inventory_entries" DROP CONSTRAINT "FK_74729de60b6f469b7deda99d42c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3882b6f9ded8eb8ea156a695e4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_74729de60b6f469b7deda99d42"`);
        await queryRunner.query(`DROP TABLE "trade_receiver_inventory_entries"`);

        await queryRunner.query(`ALTER TABLE "trade_sender_inventory_entries" DROP CONSTRAINT "FK_e0a105937dbd3783f206aa8a37a"`);
        await queryRunner.query(`ALTER TABLE "trade_sender_inventory_entries" DROP CONSTRAINT "FK_366016177a6c2b1cbce45c4bedd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e0a105937dbd3783f206aa8a37"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_366016177a6c2b1cbce45c4bed"`);
        await queryRunner.query(`DROP TABLE "trade_sender_inventory_entries"`);

        await queryRunner.query(`ALTER TABLE "trades" DROP CONSTRAINT "FK_d5bd2471ea5175f4bfdb0df0cde"`);
        await queryRunner.query(`ALTER TABLE "trades" DROP CONSTRAINT "FK_490f4df080a3862cdb4236505a9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_358b36d15b38834d8879b74fd0"`);
        await queryRunner.query(`DROP TABLE "trades"`);
        await queryRunner.query(`DROP TYPE "public"."trades_status_enum"`);
    }

}
