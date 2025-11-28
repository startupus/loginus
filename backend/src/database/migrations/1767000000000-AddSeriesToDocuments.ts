import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSeriesToDocuments1767000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'documents',
      new TableColumn({
        name: 'series',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('documents', 'series');
  }
}

