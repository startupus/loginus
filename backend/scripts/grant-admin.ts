import { DataSource } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Role } from '../src/rbac/entities/role.entity';
import { UserRoleAssignment } from '../src/users/entities/user-role-assignment.entity';

async function grantAdminRole(email: string) {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'loginus',
    password: process.env.DB_PASSWORD || 'loginus_secret',
    database: process.env.DB_DATABASE || 'loginus_dev',
    entities: ['src/**/*.entity.ts'],
    synchronize: false,
    logging: true,
  });

  try {
    console.log(`🔧 Connecting to database...`);
    await dataSource.initialize();
    console.log(`✅ Database connected`);

    // Находим пользователя
    const userRepo = dataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      await dataSource.destroy();
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);

    // Находим роль super_admin
    const roleRepo = dataSource.getRepository(Role);
    let superAdminRole = await roleRepo.findOne({
      where: { name: 'super_admin', isGlobal: true },
    });

    // Если роли нет, создаем её
    if (!superAdminRole) {
      console.log(`⚠️ Role 'super_admin' not found, creating it...`);
      superAdminRole = roleRepo.create({
        name: 'super_admin',
        description: 'Super Administrator with full access',
        isSystem: true,
        isGlobal: true,
      });
      superAdminRole = await roleRepo.save(superAdminRole);
      console.log(`✅ Created role 'super_admin' (ID: ${superAdminRole.id})`);
    } else {
      console.log(`✅ Found role 'super_admin' (ID: ${superAdminRole.id})`);
    }

    // Проверяем, есть ли уже назначение роли
    const assignmentRepo = dataSource.getRepository(UserRoleAssignment);
    let assignment = await assignmentRepo.findOne({
      where: {
        userId: user.id,
        roleId: superAdminRole.id,
        organizationId: null,
        teamId: null,
      },
    });

    if (assignment) {
      console.log(`✅ User already has super_admin role assigned`);
    } else {
      // Создаем новое назначение роли
      assignment = assignmentRepo.create({
        userId: user.id,
        roleId: superAdminRole.id,
        organizationId: null,
        teamId: null,
        assignedBy: user.id, // Назначаем самим пользователем
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      assignment = await assignmentRepo.save(assignment);
      console.log(`✅ Granted super_admin role to user ${email}`);
    }

    console.log(`\n🎉 Success! User ${email} now has super_admin role`);
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error:`, error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

// Получаем email из аргументов командной строки
const email = process.argv[2] || 'saschkaproshka04@mail.ru';
grantAdminRole(email);

