import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPrimaryRecoveryMethod1732996000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Проверяем, существует ли колонка primaryrecoverymethod
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'primaryrecoverymethod'
      )
    `);

    if (!columnExists[0].exists) {
      // Добавляем колонку, если её нет
      await queryRunner.query(`
        ALTER TABLE users 
        ADD COLUMN primaryrecoverymethod VARCHAR(20) DEFAULT 'email'
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Откат: удаляем колонку
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'primaryrecoverymethod'
      )
    `);

    if (columnExists[0].exists) {
      await queryRunner.query(`
        ALTER TABLE users 
        DROP COLUMN primaryrecoverymethod
      `);
    }
  }
}

