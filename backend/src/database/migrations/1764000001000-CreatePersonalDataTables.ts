import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePersonalDataTables1764000001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Таблица для документов
    await queryRunner.createTable(
      new Table({
        name: 'documents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'number',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'issueDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'expiryDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'issuer',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'fileUrl',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'NOW()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'NOW()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'documents',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Таблица для адресов
    await queryRunner.createTable(
      new Table({
        name: 'addresses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'street',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'region',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'postalCode',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'country',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'isDefault',
            type: 'boolean',
            default: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'NOW()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'NOW()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'addresses',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Таблица для транспортных средств
    await queryRunner.createTable(
      new Table({
        name: 'vehicles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'brand',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'model',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'year',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'licensePlate',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'vin',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'NOW()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'NOW()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'vehicles',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Таблица для питомцев
    await queryRunner.createTable(
      new Table({
        name: 'pets',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'breed',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'birthDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'photoUrl',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'NOW()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'NOW()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'pets',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pets');
    await queryRunner.dropTable('vehicles');
    await queryRunner.dropTable('addresses');
    await queryRunner.dropTable('documents');
  }
}

