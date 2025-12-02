import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateInvitationsTypeCheck1769200000001 implements MigrationInterface {
  name = 'UpdateInvitationsTypeCheck1769200000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Обновляем CHECK constraint для типа приглашения, чтобы включить 'family_group'
    await queryRunner.query(`
      ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_type_check
    `);
    await queryRunner.query(`
      ALTER TABLE invitations ADD CONSTRAINT invitations_type_check 
      CHECK (type IN ('organization', 'team', 'family_group'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Возвращаем старый CHECK constraint (без 'family_group')
    await queryRunner.query(`
      ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_type_check
    `);
    await queryRunner.query(`
      ALTER TABLE invitations ADD CONSTRAINT invitations_type_check 
      CHECK (type IN ('organization', 'team'))
    `);
  }
}





