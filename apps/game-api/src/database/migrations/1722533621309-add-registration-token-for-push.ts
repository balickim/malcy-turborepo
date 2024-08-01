import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRegistrationTokenForPush1722533621309
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "registrationToken" VARCHAR(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "registrationToken"`,
    );
  }
}
