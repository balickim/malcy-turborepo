import { MigrationInterface, QueryRunner } from 'typeorm';

export class Fix1748204955641 implements MigrationInterface {
  name = 'Fix1748204955641';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "settlements" ALTER COLUMN "iron" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "iron" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "registrationToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "registrationToken" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "registrationToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "registrationToken" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "iron" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "settlements" ALTER COLUMN "iron" DROP NOT NULL`,
    );
  }
}
