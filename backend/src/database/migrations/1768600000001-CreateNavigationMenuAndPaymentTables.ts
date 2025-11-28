import { MigrationInterface, QueryRunner } from 'typeorm';

const sidebarMenuSeed = {
  menuId: 'sidebar-main',
  name: 'Sidebar Main',
  items: [
    {
      id: 'dashboard',
      type: 'default',
      systemId: 'profile',
      icon: 'home',
      path: '/dashboard',
      enabled: true,
      order: 1,
    },
    {
      id: 'data',
      type: 'default',
      systemId: 'data',
      icon: 'layers',
      path: '/data',
      enabled: true,
      order: 2,
    },
    {
      id: 'data-documents',
      type: 'default',
      systemId: 'data-documents',
      icon: 'file-text',
      path: '/data/documents',
      enabled: true,
      order: 3,
    },
    {
      id: 'data-addresses',
      type: 'default',
      systemId: 'data-addresses',
      icon: 'map',
      path: '/data/addresses',
      enabled: true,
      order: 4,
    },
    {
      id: 'security',
      type: 'default',
      systemId: 'security',
      icon: 'shield',
      path: '/security',
      enabled: true,
      order: 5,
    },
    {
      id: 'family',
      type: 'default',
      systemId: 'family',
      icon: 'users',
      path: '/family',
      enabled: true,
      order: 6,
    },
    {
      id: 'work',
      type: 'default',
      systemId: 'work',
      icon: 'briefcase',
      path: '/work',
      enabled: true,
      order: 7,
    },
    {
      id: 'payments',
      type: 'default',
      systemId: 'payments',
      icon: 'credit-card',
      path: '/pay',
      enabled: true,
      order: 8,
    },
    {
      id: 'support',
      type: 'default',
      systemId: 'support',
      icon: 'headset',
      path: '/support',
      enabled: true,
      order: 9,
    },
  ],
  conditions: {},
  priority: 100,
  isActive: true,
  metadata: {},
};

const defaultPaymentMethods = [
  {
    id: '8c4b41ed-6478-4dd0-8d0b-53f8b77c6f6b',
    type: 'card',
    bankName: 'Тинькофф Black',
    lastFour: '4821',
    expiryDate: '12/27',
    status: 'active',
    order: 1,
  },
  {
    id: '4ebdc815-3a28-44b7-8d2d-8a49a9f1059e',
    type: 'bank_account',
    bankName: 'Сбер Бизнес',
    accountNumber: '40702810500000012345',
    status: 'active',
    order: 2,
  },
];

export class CreateNavigationMenuAndPaymentTables1768600000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "navigation_menus" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "menuId" character varying(100) NOT NULL,
        "name" character varying(255) NOT NULL,
        "items" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "conditions" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "priority" integer NOT NULL DEFAULT 100,
        "isActive" boolean NOT NULL DEFAULT true,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_navigation_menus_menu_id" UNIQUE ("menuId"),
        CONSTRAINT "PK_navigation_menus" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `
        INSERT INTO "navigation_menus"
          ("menuId", "name", "items", "conditions", "priority", "isActive", "metadata")
        VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, $7::jsonb)
        ON CONFLICT ("menuId") DO NOTHING
      `,
      [
        sidebarMenuSeed.menuId,
        sidebarMenuSeed.name,
        JSON.stringify(sidebarMenuSeed.items),
        JSON.stringify(sidebarMenuSeed.conditions),
        sidebarMenuSeed.priority,
        sidebarMenuSeed.isActive,
        JSON.stringify(sidebarMenuSeed.metadata),
      ],
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payment_methods" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "type" character varying(30) NOT NULL,
        "bankName" character varying(255) NOT NULL,
        "lastFour" character varying(4),
        "accountNumber" character varying(34),
        "expiryDate" character varying(5),
        "status" character varying(20) NOT NULL DEFAULT 'active',
        "order" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_methods" PRIMARY KEY ("id")
      )
    `);

    for (const method of defaultPaymentMethods) {
      await queryRunner.query(
        `
          INSERT INTO "payment_methods"
            ("id", "type", "bankName", "lastFour", "accountNumber", "expiryDate", "status", "order")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT ("id") DO NOTHING
        `,
        [
          method.id,
          method.type,
          method.bankName,
          method.lastFour ?? null,
          method.accountNumber ?? null,
          method.expiryDate ?? null,
          method.status,
          method.order,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "payment_methods"');
    await queryRunner.query('DROP TABLE IF EXISTS "navigation_menus"');
  }
}

