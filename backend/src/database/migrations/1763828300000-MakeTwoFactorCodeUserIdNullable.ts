import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeTwoFactorCodeUserIdNullable1763828300000 implements MigrationInterface {
  name = 'MakeTwoFactorCodeUserIdNullable1763828300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Делаем userId nullable для поддержки кодов для новых пользователей
    await queryRunner.query(`
      ALTER TABLE "two_factor_codes"
      ALTER COLUMN "userId" DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Возвращаем NOT NULL (но это может вызвать проблемы, если есть записи с null)
    await queryRunner.query(`
      ALTER TABLE "two_factor_codes"
      ALTER COLUMN "userId" SET NOT NULL;
    `);
  }
}

