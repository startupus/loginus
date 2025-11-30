import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddGitHubEmailAndTelegramPhone1732992000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавляем поле githubEmail
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'githubEmail',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    // Добавляем поле telegramPhone
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'telegramPhone',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем поле telegramPhone
    await queryRunner.dropColumn('users', 'telegramPhone');

    // Удаляем поле githubEmail
    await queryRunner.dropColumn('users', 'githubEmail');
  }
}

