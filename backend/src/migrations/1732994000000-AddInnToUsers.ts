import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddInnToUsers1732994000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавляем поле inn
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'inn',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем поле inn
    await queryRunner.dropColumn('users', 'inn');
  }
}

