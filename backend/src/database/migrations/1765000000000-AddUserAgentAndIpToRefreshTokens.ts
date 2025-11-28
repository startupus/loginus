import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserAgentAndIpToRefreshTokens1765000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавляем поле userAgent
    await queryRunner.addColumn(
      'refresh_tokens',
      new TableColumn({
        name: 'userAgent',
        type: 'varchar',
        length: '500',
        isNullable: true,
      }),
    );

    // Добавляем поле ipAddress
    await queryRunner.addColumn(
      'refresh_tokens',
      new TableColumn({
        name: 'ipAddress',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('refresh_tokens', 'ipAddress');
    await queryRunner.dropColumn('refresh_tokens', 'userAgent');
  }
}

