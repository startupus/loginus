import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenamePrimaryRecoveryMethod1732993000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Проверяем, существует ли колонка primaryrecoverymethod
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'primaryrecoverymethod'
      )
    `);

    if (columnExists[0].exists) {
      // Переименовываем колонку в camelCase
      await queryRunner.query(`
        ALTER TABLE users 
        RENAME COLUMN "primaryrecoverymethod" TO "primaryRecoveryMethod"
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Откат: переименовываем обратно в lowercase
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'primaryRecoveryMethod'
      )
    `);

    if (columnExists[0].exists) {
      await queryRunner.query(`
        ALTER TABLE users 
        RENAME COLUMN "primaryRecoveryMethod" TO "primaryrecoverymethod"
      `);
    }
  }
}

