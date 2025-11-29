import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExtensionSystemTables1732896000000
  implements MigrationInterface
{
  name = 'CreateExtensionSystemTables1732896000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create extensions table
    await queryRunner.query(`
      CREATE TABLE "extensions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "slug" character varying(255) NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "version" character varying(50) NOT NULL,
        "author" character varying(255),
        "authorEmail" character varying(255),
        "authorUrl" character varying(500),
        "extensionType" character varying(50) NOT NULL,
        "uiType" character varying(50),
        "icon" character varying(100),
        "pathOnDisk" character varying(500) NOT NULL,
        "manifest" jsonb,
        "config" jsonb,
        "subscribedEvents" jsonb,
        "enabled" boolean NOT NULL DEFAULT false,
        "installedAt" TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_extensions" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_extensions_slug" ON "extensions" ("slug")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_extensions_enabled" ON "extensions" ("enabled")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_extensions_type" ON "extensions" ("extensionType")
    `);

    // Create menu_item_plugins table
    await queryRunner.query(`
      CREATE TABLE "menu_item_plugins" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "menuItemId" character varying(255) NOT NULL,
        "pluginId" uuid NOT NULL,
        "config" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_menu_item_plugins" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_menu_item_plugins_menuItemId" ON "menu_item_plugins" ("menuItemId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_menu_item_plugins_pluginId" ON "menu_item_plugins" ("pluginId")
    `);

    await queryRunner.query(`
      ALTER TABLE "menu_item_plugins"
      ADD CONSTRAINT "FK_menu_item_plugins_plugin"
      FOREIGN KEY ("pluginId")
      REFERENCES "extensions"("id")
      ON DELETE CASCADE
    `);

    // Create profile_widgets table
    await queryRunner.query(`
      CREATE TABLE "profile_widgets" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "widgetId" uuid NOT NULL,
        "position" integer NOT NULL,
        "width" integer NOT NULL DEFAULT 1,
        "height" integer NOT NULL DEFAULT 1,
        "config" jsonb,
        "enabled" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_profile_widgets" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_profile_widgets_widgetId" ON "profile_widgets" ("widgetId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_profile_widgets_position" ON "profile_widgets" ("position")
    `);

    await queryRunner.query(`
      ALTER TABLE "profile_widgets"
      ADD CONSTRAINT "FK_profile_widgets_widget"
      FOREIGN KEY ("widgetId")
      REFERENCES "extensions"("id")
      ON DELETE CASCADE
    `);

    // Create event_logs table
    await queryRunner.query(`
      CREATE TABLE "event_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "eventName" character varying(255) NOT NULL,
        "payload" jsonb,
        "pluginId" uuid,
        "status" character varying(50) NOT NULL,
        "error" text,
        "executionTime" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_event_logs" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_event_logs_eventName" ON "event_logs" ("eventName")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_event_logs_pluginId" ON "event_logs" ("pluginId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_event_logs_createdAt" ON "event_logs" ("createdAt")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_event_logs_status" ON "event_logs" ("status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE "event_logs"`);
    await queryRunner.query(`DROP TABLE "profile_widgets"`);
    await queryRunner.query(`DROP TABLE "menu_item_plugins"`);
    await queryRunner.query(`DROP TABLE "extensions"`);
  }
}

