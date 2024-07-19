import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1721385172460 implements MigrationInterface {
  name = 'Init1721385172460';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "discoveredSettlements" ("createdBy" character varying NOT NULL DEFAULT 'system', "updatedBy" character varying NOT NULL DEFAULT 'system', "deletedBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "discoveredByUserId" character varying NOT NULL, "userId" character varying NOT NULL, "settlementId" character varying NOT NULL, "type" character varying NOT NULL, "swordsman" integer, "archer" integer, "knight" integer, "luchador" integer, "archmage" integer, CONSTRAINT "UQ_f7338cba8afb05461ad145d25bf" UNIQUE ("settlementId", "discoveredByUserId"), CONSTRAINT "PK_02acb376d6f6b77f01bd910ec6b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_de66518a70c463d681d7a4de6d" ON "discoveredSettlements" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."settlements_type_enum" AS ENUM('MINING_TOWN', 'CASTLE_TOWN', 'FORTIFIED_SETTLEMENT', 'CAPITOL_SETTLEMENT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "settlements" ("createdBy" character varying NOT NULL DEFAULT 'system', "updatedBy" character varying NOT NULL DEFAULT 'system', "deletedBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" character varying NOT NULL, "name" character varying NOT NULL, "location" geometry(Point,4326) NOT NULL, "type" "public"."settlements_type_enum" NOT NULL DEFAULT 'MINING_TOWN', "isBesieged" boolean NOT NULL DEFAULT false, "gold" integer NOT NULL DEFAULT '0', "wood" integer NOT NULL DEFAULT '0', "resourcesMultiplicator" integer NOT NULL DEFAULT '1', "userId" character varying, CONSTRAINT "PK_5f523ce152b84e818bff9467aab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ab1315d31161f24564c230bb4d" ON "settlements" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "conversations" ("createdBy" character varying NOT NULL DEFAULT 'system', "updatedBy" character varying NOT NULL DEFAULT 'system', "deletedBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_ee34f4f7ced4ec8681f26bf04ef" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_682fd75da533261f7dac76da8a" ON "conversations" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "messages" ("createdBy" character varying NOT NULL DEFAULT 'system', "updatedBy" character varying NOT NULL DEFAULT 'system', "deletedBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "content" text NOT NULL, "userId" character varying, "conversationId" integer, CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6ce6acdb0801254590f8a78c08" ON "messages" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_messages_user" ON "messages" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_messages_conversation" ON "messages" ("conversationId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "groups" ("createdBy" character varying NOT NULL DEFAULT 'system', "updatedBy" character varying NOT NULL DEFAULT 'system', "deletedBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_382670d3cb57dca9ac949ff45b" ON "groups" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "groupsMembers" ("createdBy" character varying NOT NULL DEFAULT 'system', "updatedBy" character varying NOT NULL DEFAULT 'system', "deletedBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "userId" character varying, "groupId" integer, CONSTRAINT "PK_cbae70c210645ea04b9cb43a065" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_041f8041cb0c760acfb1e0bb6a" ON "groupsMembers" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("createdBy" character varying NOT NULL DEFAULT 'system', "updatedBy" character varying NOT NULL DEFAULT 'system', "deletedBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" character varying NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "gold" integer NOT NULL DEFAULT '0', "wood" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "CHK_365ec833984970fc9f20df6b11" CHECK ("wood" >= 0 AND "wood" <= 80000), CONSTRAINT "CHK_67916ee34ebc58f02b8a2393a6" CHECK ("gold" >= 0 AND "gold" <= 100000), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_204e9b624861ff4a5b26819210" ON "users" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "armies" ("createdBy" character varying NOT NULL DEFAULT 'system', "updatedBy" character varying NOT NULL DEFAULT 'system', "deletedBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" character varying NOT NULL, "swordsman" integer NOT NULL DEFAULT '0', "archer" integer NOT NULL DEFAULT '0', "knight" integer NOT NULL DEFAULT '0', "luchador" integer NOT NULL DEFAULT '0', "archmage" integer NOT NULL DEFAULT '0', "userId" character varying, "settlementId" character varying, CONSTRAINT "UQ_e1c4a2151663fce49e5fd3cdba5" UNIQUE ("userId"), CONSTRAINT "UQ_277c8bf25e72c283c3935f77234" UNIQUE ("settlementId"), CONSTRAINT "REL_e1c4a2151663fce49e5fd3cdba" UNIQUE ("userId"), CONSTRAINT "REL_277c8bf25e72c283c3935f7723" UNIQUE ("settlementId"), CONSTRAINT "PK_3453ee222784ace63ebc551fccf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_390ecb6e326efc504734da4c80" ON "armies" ("createdAt") `,
    );
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
      `CREATE TABLE "discoveredArea" ("createdBy" character varying NOT NULL DEFAULT 'system', "updatedBy" character varying NOT NULL DEFAULT 'system', "deletedBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" character varying NOT NULL, "userId" character varying NOT NULL, "area" geometry(MultiPolygon,4326) NOT NULL, CONSTRAINT "PK_0740051b89532a5c3ce224b0215" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e96028d819ca73e108680a505a" ON "discoveredArea" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "visibleArea" ("createdBy" character varying NOT NULL DEFAULT 'system', "updatedBy" character varying NOT NULL DEFAULT 'system', "deletedBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" character varying NOT NULL, "userId" character varying NOT NULL, "area" geometry(MultiPolygon,4326) NOT NULL, CONSTRAINT "PK_deca5cb468ee80da1ee2fb83942" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f91d1f5a41f277ab4f318c5f14" ON "visibleArea" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."habitableZones_type_enum" AS ENUM('GOLD', 'WOOD', 'IRON')`,
    );
    await queryRunner.query(
      `CREATE TABLE "habitableZones" ("createdBy" character varying NOT NULL DEFAULT 'system', "updatedBy" character varying NOT NULL DEFAULT 'system', "deletedBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" character varying NOT NULL, "area" geometry(Polygon,4326) NOT NULL, "type" "public"."habitableZones_type_enum", "resourcesMultiplicator" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_55ddaec45fb8fe0f3e50b2fc48b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c66d20931a1785573f04750b83" ON "habitableZones" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "discoveredHabitableZones" ("createdBy" character varying NOT NULL DEFAULT 'system', "updatedBy" character varying NOT NULL DEFAULT 'system', "deletedBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "habitableZoneId" character varying NOT NULL, "discoveredByUserId" character varying NOT NULL, "type" character varying, CONSTRAINT "UQ_1a0a0cd17db7662fe94ace5eca2" UNIQUE ("habitableZoneId", "discoveredByUserId"), CONSTRAINT "PK_ceb3498015af32d876531995f4f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_473500d28c7dcc1a7d90a4f94a" ON "discoveredHabitableZones" ("createdAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "discoveredSettlements" ADD CONSTRAINT "FK_3a3eb95dc8230c81dd0974d9770" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "discoveredSettlements" ADD CONSTRAINT "FK_20d1dc39165ec75f7bb16e1d30e" FOREIGN KEY ("settlementId") REFERENCES "settlements"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "settlements" ADD CONSTRAINT "FK_4ff643af81bd6ae92eaaabdd2f4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_4838cd4fc48a6ff2d4aa01aa646" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_e5663ce0c730b2de83445e2fd19" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "groupsMembers" ADD CONSTRAINT "FK_19ad31dada89bad9706cb18466e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "groupsMembers" ADD CONSTRAINT "FK_6e6fe8ecb1f8533141574869717" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "armies" ADD CONSTRAINT "FK_e1c4a2151663fce49e5fd3cdba5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "armies" ADD CONSTRAINT "FK_277c8bf25e72c283c3935f77234" FOREIGN KEY ("settlementId") REFERENCES "settlements"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "discoveredHabitableZones" ADD CONSTRAINT "FK_05f2d842aeeaef6c2add13aa518" FOREIGN KEY ("habitableZoneId") REFERENCES "habitableZones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "discoveredHabitableZones" DROP CONSTRAINT "FK_05f2d842aeeaef6c2add13aa518"`,
    );
    await queryRunner.query(
      `ALTER TABLE "armies" DROP CONSTRAINT "FK_277c8bf25e72c283c3935f77234"`,
    );
    await queryRunner.query(
      `ALTER TABLE "armies" DROP CONSTRAINT "FK_e1c4a2151663fce49e5fd3cdba5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "groupsMembers" DROP CONSTRAINT "FK_6e6fe8ecb1f8533141574869717"`,
    );
    await queryRunner.query(
      `ALTER TABLE "groupsMembers" DROP CONSTRAINT "FK_19ad31dada89bad9706cb18466e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_e5663ce0c730b2de83445e2fd19"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_4838cd4fc48a6ff2d4aa01aa646"`,
    );
    await queryRunner.query(
      `ALTER TABLE "settlements" DROP CONSTRAINT "FK_4ff643af81bd6ae92eaaabdd2f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "discoveredSettlements" DROP CONSTRAINT "FK_20d1dc39165ec75f7bb16e1d30e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "discoveredSettlements" DROP CONSTRAINT "FK_3a3eb95dc8230c81dd0974d9770"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_473500d28c7dcc1a7d90a4f94a"`,
    );
    await queryRunner.query(`DROP TABLE "discoveredHabitableZones"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c66d20931a1785573f04750b83"`,
    );
    await queryRunner.query(`DROP TABLE "habitableZones"`);
    await queryRunner.query(`DROP TYPE "public"."habitableZones_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f91d1f5a41f277ab4f318c5f14"`,
    );
    await queryRunner.query(`DROP TABLE "visibleArea"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e96028d819ca73e108680a505a"`,
    );
    await queryRunner.query(`DROP TABLE "discoveredArea"`);
    await queryRunner.query(`DROP INDEX "public"."idx_eventLog_actionType"`);
    await queryRunner.query(`DROP TABLE "eventLog"`);
    await queryRunner.query(`DROP TYPE "public"."eventLog_tablename_enum"`);
    await queryRunner.query(`DROP TYPE "public"."eventLog_actiontype_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_390ecb6e326efc504734da4c80"`,
    );
    await queryRunner.query(`DROP TABLE "armies"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_204e9b624861ff4a5b26819210"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_041f8041cb0c760acfb1e0bb6a"`,
    );
    await queryRunner.query(`DROP TABLE "groupsMembers"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_382670d3cb57dca9ac949ff45b"`,
    );
    await queryRunner.query(`DROP TABLE "groups"`);
    await queryRunner.query(`DROP INDEX "public"."idx_messages_conversation"`);
    await queryRunner.query(`DROP INDEX "public"."idx_messages_user"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6ce6acdb0801254590f8a78c08"`,
    );
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_682fd75da533261f7dac76da8a"`,
    );
    await queryRunner.query(`DROP TABLE "conversations"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ab1315d31161f24564c230bb4d"`,
    );
    await queryRunner.query(`DROP TABLE "settlements"`);
    await queryRunner.query(`DROP TYPE "public"."settlements_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_de66518a70c463d681d7a4de6d"`,
    );
    await queryRunner.query(`DROP TABLE "discoveredSettlements"`);
  }
}
