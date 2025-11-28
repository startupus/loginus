import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePluginsTables1769100000000 implements MigrationInterface {
  name = 'CreatePluginsTables1769100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создаем enum-тип для типа плагина, если его еще нет
    const typeExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'plugin_type_enum'
      )
    `);

    if (!typeExists[0].exists) {
      await queryRunner.query(
        `CREATE TYPE "public"."plugin_type_enum" AS ENUM('external_link', 'iframe', 'web_app')`,
      );
    }

    // Основная таблица плагинов
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "plugins" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "slug" character varying(100) NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "icon" character varying(100),
        "type" "public"."plugin_type_enum" NOT NULL,
        "enabled" boolean NOT NULL DEFAULT true,
        "order" integer NOT NULL DEFAULT 0,
        "scope" character varying(20) NOT NULL DEFAULT 'global',
        "allowedRoles" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "requiredPermissions" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "config" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "menuId" character varying(100),
        "menuItemId" character varying(100),
        "menuParentItemId" character varying(100),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_plugins" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_plugins_slug" UNIQUE ("slug")
      )
    `);

    // Таблица версий плагинов
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "plugin_versions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "pluginId" uuid NOT NULL,
        "version" character varying(50) NOT NULL,
        "changelog" text,
        "staticPath" character varying(500),
        "manifest" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_plugin_versions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_plugin_versions_plugin" FOREIGN KEY ("pluginId") REFERENCES "plugins"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_plugin_versions_pluginId"
      ON "plugin_versions" ("pluginId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_plugin_versions_pluginId"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "plugin_versions"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "plugins"
    `);

    // Удаляем enum-тип только если нет зависящих от него столбцов
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_catalog.pg_attribute a ON a.atttypid = t.oid
          WHERE t.typname = 'plugin_type_enum'
            AND a.attnum > 0
        ) THEN
          DROP TYPE IF EXISTS "public"."plugin_type_enum";
        END IF;
      END
      $$;
    `);
  }
}


