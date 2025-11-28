import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssignSuperAdminToSascha1768000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Назначаем роль super_admin пользователю saschkaproshka04@mail.ru
    await queryRunner.query(`
      INSERT INTO user_role_assignments ("userId", "roleId", "organizationId", "teamId", "assignedBy", "createdAt", "updatedAt")
      SELECT 
        u.id,
        r.id,
        null,
        null,
        u.id,
        NOW(),
        NOW()
      FROM users u, roles r 
      WHERE u.email = 'saschkaproshka04@mail.ru' 
      AND r.name = 'super_admin'
      AND NOT EXISTS (
        SELECT 1 FROM user_role_assignments ura 
        WHERE ura."userId" = u.id 
        AND ura."roleId" = r.id
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем роль суперадмина
    await queryRunner.query(`
      DELETE FROM user_role_assignments 
      WHERE "userId" = (SELECT id FROM users WHERE email = 'saschkaproshka04@mail.ru')
      AND "roleId" = (SELECT id FROM roles WHERE name = 'super_admin');
    `);
  }
}

