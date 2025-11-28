import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddHasEmailCodeToUsers1766000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Проверяем, существует ли колонка hasEmailCode
    const columnExists = await queryRunner.hasColumn('users', 'hasEmailCode');
    
    if (!columnExists) {
      await queryRunner.addColumn('users', new TableColumn({
        name: 'hasEmailCode',
        type: 'boolean',
        default: false,
        isNullable: false,
      }));
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const columnExists = await queryRunner.hasColumn('users', 'hasEmailCode');
    
    if (columnExists) {
      await queryRunner.dropColumn('users', 'hasEmailCode');
    }
  }
}

