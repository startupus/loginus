const { Client } = require('pg');

async function grantSuperAdmin(email) {
  const client = new Client({
    host: process.env.DB_HOST || 'loginus-db',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || 'loginus',
    password: process.env.DB_PASSWORD || 'loginus_secret',
    database: process.env.DB_DATABASE || 'loginus_dev',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Находим пользователя
    const userResult = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }
    const userId = userResult.rows[0].id;
    console.log(`✅ Found user: ${email} (ID: ${userId})`);

    // Находим роль super_admin
    const roleResult = await client.query('SELECT id FROM roles WHERE name = $1 AND "isGlobal" = true', ['super_admin']);
    if (roleResult.rows.length === 0) {
      console.error(`❌ Role 'super_admin' not found`);
      process.exit(1);
    }
    const roleId = roleResult.rows[0].id;
    console.log(`✅ Found role 'super_admin' (ID: ${roleId})`);

    // Проверяем, есть ли уже назначение роли
    const existingResult = await client.query(
      'SELECT id FROM user_role_assignments WHERE "userId" = $1 AND "roleId" = $2',
      [userId, roleId]
    );

    if (existingResult.rows.length > 0) {
      console.log(`✅ User already has super_admin role assigned`);
    } else {
      // Создаем новое назначение роли
      await client.query(
        `INSERT INTO user_role_assignments ("userId", "roleId", "organizationId", "teamId", "assignedBy", "createdAt", "updatedAt")
         VALUES ($1, $2, null, null, $1, NOW(), NOW())`,
        [userId, roleId]
      );
      console.log(`✅ Granted super_admin role to user ${email}`);
    }

    console.log(`\n🎉 Success! User ${email} now has super_admin role`);
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error:`, error);
    await client.end();
    process.exit(1);
  }
}

const email = process.argv[2] || 'saschkaproshka04@mail.ru';
grantSuperAdmin(email);

