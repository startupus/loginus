import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class CreateFamilyGroups1769000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создаем таблицу family_groups
    await queryRunner.createTable(
      new Table({
        name: 'family_groups',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: false,
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

    // Создаем таблицу user_family_groups
    await queryRunner.createTable(
      new Table({
        name: 'user_family_groups',
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
            name: 'familyGroupId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['admin', 'member', 'child'],
            default: "'member'",
          },
          {
            name: 'invitedBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'joinedAt',
            type: 'timestamp',
            default: 'NOW()',
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

    // Добавляем внешние ключи для user_family_groups
    await queryRunner.createForeignKey(
      'user_family_groups',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_family_groups',
      new TableForeignKey({
        columnNames: ['familyGroupId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'family_groups',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_family_groups',
      new TableForeignKey({
        columnNames: ['invitedBy'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    // Добавляем внешний ключ для family_groups
    await queryRunner.createForeignKey(
      'family_groups',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Добавляем индексы
    await queryRunner.createIndex(
      'user_family_groups',
      new TableIndex({
        name: 'IDX_user_family_groups_userId',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'user_family_groups',
      new TableIndex({
        name: 'IDX_user_family_groups_familyGroupId',
        columnNames: ['familyGroupId'],
      }),
    );

    // Добавляем поле familyGroupId в таблицу invitations, если его еще нет
    const invitationsTable = await queryRunner.getTable('invitations');
    if (invitationsTable && !invitationsTable.findColumnByName('familyGroupId')) {
      await queryRunner.addColumn(
        'invitations',
        new TableColumn({
          name: 'familyGroupId',
          type: 'uuid',
          isNullable: true,
        }),
      );

      await queryRunner.createForeignKey(
        'invitations',
        new TableForeignKey({
          columnNames: ['familyGroupId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'family_groups',
          onDelete: 'CASCADE',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем внешние ключи и индексы
    const invitationsTable = await queryRunner.getTable('invitations');
    if (invitationsTable?.findColumnByName('familyGroupId')) {
      const foreignKey = invitationsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('familyGroupId') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('invitations', foreignKey);
      }
      await queryRunner.dropColumn('invitations', 'familyGroupId');
    }

    await queryRunner.dropTable('user_family_groups');
    await queryRunner.dropTable('family_groups');
  }
}

