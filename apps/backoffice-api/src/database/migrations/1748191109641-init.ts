import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1748191109641 implements MigrationInterface {
  name = 'Init1748191109641';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "habitableZones" DROP CONSTRAINT "FK_552abf3384e9599f51abc44b22f"`,
    );
    await queryRunner.query(
      `CREATE TABLE "discoveredHabitableZones" ("createdBy" character varying NOT NULL DEFAULT 'system', "updatedBy" character varying NOT NULL DEFAULT 'system', "deletedBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "habitableZoneId" character varying NOT NULL, "discoveredByUserId" character varying NOT NULL, "type" character varying, CONSTRAINT "UQ_1a0a0cd17db7662fe94ace5eca2" UNIQUE ("habitableZoneId", "discoveredByUserId"), CONSTRAINT "PK_ceb3498015af32d876531995f4f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_473500d28c7dcc1a7d90a4f94a" ON "discoveredHabitableZones" ("createdAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "habitableZones" DROP COLUMN "worldConfigId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "habitableZones" ADD "worldConfigId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "discoveredHabitableZones" ADD CONSTRAINT "FK_05f2d842aeeaef6c2add13aa518" FOREIGN KEY ("habitableZoneId") REFERENCES "habitableZones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "habitableZones" ADD CONSTRAINT "FK_552abf3384e9599f51abc44b22f" FOREIGN KEY ("worldConfigId") REFERENCES "worldsConfig"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "habitableZones" DROP CONSTRAINT "FK_552abf3384e9599f51abc44b22f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "discoveredHabitableZones" DROP CONSTRAINT "FK_05f2d842aeeaef6c2add13aa518"`,
    );
    await queryRunner.query(
      `ALTER TABLE "habitableZones" DROP COLUMN "worldConfigId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "habitableZones" ADD "worldConfigId" integer NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_473500d28c7dcc1a7d90a4f94a"`,
    );
    await queryRunner.query(`DROP TABLE "discoveredHabitableZones"`);
    await queryRunner.query(
      `ALTER TABLE "habitableZones" ADD CONSTRAINT "FK_552abf3384e9599f51abc44b22f" FOREIGN KEY ("worldConfigId") REFERENCES "worldsConfig"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
