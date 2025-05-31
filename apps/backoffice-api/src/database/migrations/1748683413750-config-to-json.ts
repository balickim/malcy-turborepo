import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConfigToJson1748683413750 implements MigrationInterface {
  name = 'ConfigToJson1748683413750';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "worldsConfig" DROP COLUMN "config"`);
    await queryRunner.query(
      `ALTER TABLE "worldsConfig" ADD "config" json NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "worldsConfig" DROP COLUMN "config"`);
    await queryRunner.query(
      `ALTER TABLE "worldsConfig" ADD "config" jsonb NOT NULL`,
    );
  }
}
