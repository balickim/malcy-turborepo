import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIronResource1722340948908 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "settlements" ADD "iron" integer DEFAULT 0`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "iron" integer DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "settlements" DROP COLUMN "iron"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "iron"`);
  }
}
