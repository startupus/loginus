import { MigrationInterface, QueryRunner, TableColumn, Table } from 'typeorm';

export class AddMissingColumnsAndSystemSettings1732995000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Добавляем колонку githubemail в users (если её нет)
    const githubEmailExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'githubemail'
      )
    `);

    if (!githubEmailExists[0].exists) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'githubemail',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // 2. Добавляем колонку telegramphone в users (если её нет)
    const telegramPhoneExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'telegramphone'
      )
    `);

    if (!telegramPhoneExists[0].exists) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'telegramphone',
          type: 'varchar',
          length: '20',
          isNullable: true,
        }),
      );
    }

    // 3. Проверяем и создаем таблицу system_settings (если её нет)
    const systemSettingsExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'system_settings'
      )
    `);

    if (!systemSettingsExists[0].exists) {
      await queryRunner.createTable(
        new Table({
          name: 'system_settings',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              default: 'gen_random_uuid()',
            },
            {
              name: 'key',
              type: 'varchar',
              length: '100',
              isUnique: true,
              isNullable: false,
            },
            {
              name: 'value',
              type: 'text',
              isNullable: false,
            },
            {
              name: 'description',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'type',
              type: 'varchar',
              length: '50',
              default: "'string'",
              isNullable: false,
            },
            {
              name: 'isSystem',
              type: 'boolean',
              default: false,
              isNullable: false,
            },
            {
              name: 'isEditable',
              type: 'boolean',
              default: true,
              isNullable: false,
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'now()',
              isNullable: false,
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'now()',
              isNullable: false,
            },
          ],
        }),
        true,
      );

      // Создаем индексы
      await queryRunner.query(`CREATE INDEX idx_system_settings_key ON system_settings("key")`);
      await queryRunner.query(`CREATE INDEX idx_system_settings_type ON system_settings("type")`);
    }

    // 4. Проверяем и создаем запись auth_flow_config (если её нет)
    const authFlowConfigExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM system_settings 
        WHERE "key" = 'auth_flow_config'
      )
    `);

    if (!authFlowConfigExists[0].exists) {
      // Создаем дефолтную конфигурацию auth_flow
      const defaultConfig = {
        login: [
          {
            id: 'phone-email',
            type: 'phone-email',
            label: 'Телефон или почта',
            enabled: true,
            order: 1,
            required: true,
          },
          {
            id: 'password',
            type: 'password',
            label: 'Пароль',
            enabled: true,
            order: 2,
            required: true,
          },
        ],
        registration: [
          {
            id: 'phone-email',
            type: 'phone-email',
            label: 'Телефон или почта',
            enabled: true,
            order: 1,
            required: true,
          },
          {
            id: 'password',
            type: 'password',
            label: 'Пароль',
            enabled: true,
            order: 2,
            required: true,
          },
          {
            id: 'name',
            type: 'name',
            label: 'Имя',
            enabled: true,
            order: 3,
            required: true,
          },
        ],
        factors: [],
      };

      await queryRunner.query(`
        INSERT INTO system_settings ("key", "value", "description", "type", "isSystem", "isEditable")
        VALUES (
          'auth_flow_config',
          '${JSON.stringify(defaultConfig).replace(/'/g, "''")}',
          'Конфигурация потока авторизации и регистрации',
          'json',
          true,
          true
        )
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем колонки (если они были добавлены этой миграцией)
    const githubEmailExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'githubemail'
      )
    `);

    if (githubEmailExists[0].exists) {
      await queryRunner.dropColumn('users', 'githubemail');
    }

    const telegramPhoneExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'telegramphone'
      )
    `);

    if (telegramPhoneExists[0].exists) {
      await queryRunner.dropColumn('users', 'telegramphone');
    }

    // НЕ удаляем system_settings, так как она может использоваться другими частями системы
  }
}

