import { MigrationInterface, QueryRunner } from 'typeorm';

export class DefaultConversation1721387768656 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if there is any conversation with id = 1
    const conversation = await queryRunner.query(
      `SELECT * FROM conversations WHERE id = 1`,
    );

    // If no conversation with id = 1 exists, insert the default row
    if (conversation.length === 0) {
      await queryRunner.query(
        `INSERT INTO conversations (id, name) VALUES (1, 'Default Global')`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM conversations WHERE id = 1 AND name = 'Default Global'`,
    );
  }
}
