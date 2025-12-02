import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeInvitationsEmailNullable1769200000000 implements MigrationInterface {
  name = 'MakeInvitationsEmailNullable1769200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Изменяем колонку email на nullable для поддержки приглашений в семейные группы без email
    await queryRunner.query(`
      ALTER TABLE invitations 
      ALTER COLUMN email DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Возвращаем NOT NULL (но это может вызвать ошибки, если есть записи с null)
    await queryRunner.query(`
      ALTER TABLE invitations 
      ALTER COLUMN email SET NOT NULL
    `);
  }
}





