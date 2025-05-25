import { MigrationInterface, QueryRunner } from 'typeorm';

export class Fix1748196081384 implements MigrationInterface {
  name = 'Fix1748196081384';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "habitableZones" DROP CONSTRAINT "FK_552abf3384e9599f51abc44b22f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "habitableZones" ALTER COLUMN "worldConfigId" SET NOT NULL`,
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
      `ALTER TABLE "habitableZones" ALTER COLUMN "worldConfigId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "habitableZones" ADD CONSTRAINT "FK_552abf3384e9599f51abc44b22f" FOREIGN KEY ("worldConfigId") REFERENCES "worldsConfig"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
