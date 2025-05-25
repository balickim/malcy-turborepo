import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1748193474576 implements MigrationInterface {
  name = 'Init1748193474576';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."eventLog_actiontype_enum" AS ENUM('SECURITY_INCIDENT', 'USER_REGISTERED', 'SETTLEMENT_CREATED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."eventLog_tablename_enum" AS ENUM('users', 'settlements', 'armies')`,
    );
    await queryRunner.query(
      `CREATE TABLE "eventLog" ("id" SERIAL NOT NULL, "actionType" "public"."eventLog_actiontype_enum" NOT NULL, "tableName" "public"."eventLog_tablename_enum", "recordId" character varying, "changedData" json, "previousData" json, "actionDate" TIMESTAMP NOT NULL DEFAULT now(), "actionByUserId" character varying, "userIp" character varying(39), "description" text, CONSTRAINT "PK_39dece0468acfe1346fa3cb3638" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_eventLog_actionType" ON "eventLog" ("actionType") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."habitableZones_type_enum" AS ENUM('GOLD', 'WOOD', 'IRON')`,
    );
    await queryRunner.query(
      `CREATE TABLE "habitableZones" ("createdBy" character varying NOT NULL DEFAULT 'system', "updatedBy" character varying NOT NULL DEFAULT 'system', "deletedBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" character varying NOT NULL, "area" geometry(Polygon,4326) NOT NULL, "type" "public"."habitableZones_type_enum", "resourcesMultiplicator" integer NOT NULL DEFAULT '1', "worldConfigId" integer, CONSTRAINT "PK_55ddaec45fb8fe0f3e50b2fc48b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c66d20931a1785573f04750b83" ON "habitableZones" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "worldsConfig" ("createdBy" character varying NOT NULL DEFAULT 'system', "updatedBy" character varying NOT NULL DEFAULT 'system', "deletedBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "name" character varying NOT NULL, "baseUrl" character varying NOT NULL, "config" jsonb NOT NULL, CONSTRAINT "UQ_033a51086013de4d221147bdb6e" UNIQUE ("name"), CONSTRAINT "UQ_2026a01b8953d87814c2b34b174" UNIQUE ("baseUrl"), CONSTRAINT "PK_62a6fcb4f3c95c47387ba497813" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f4cc2d45a3514543a520c6f55c" ON "worldsConfig" ("createdAt") `,
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
      `DROP INDEX "public"."IDX_f4cc2d45a3514543a520c6f55c"`,
    );
    await queryRunner.query(`DROP TABLE "worldsConfig"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c66d20931a1785573f04750b83"`,
    );
    await queryRunner.query(`DROP TABLE "habitableZones"`);
    await queryRunner.query(`DROP TYPE "public"."habitableZones_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."idx_eventLog_actionType"`);
    await queryRunner.query(`DROP TABLE "eventLog"`);
    await queryRunner.query(`DROP TYPE "public"."eventLog_tablename_enum"`);
    await queryRunner.query(`DROP TYPE "public"."eventLog_actiontype_enum"`);
  }
}
