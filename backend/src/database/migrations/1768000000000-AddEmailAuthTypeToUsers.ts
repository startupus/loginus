import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailAuthTypeToUsers1768000000000
  implements MigrationInterface
{
  name = 'AddEmailAuthTypeToUsers1768000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "emailAuthType" varchar(20) DEFAULT 'password'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "emailAuthType"
    `);
  }
}


