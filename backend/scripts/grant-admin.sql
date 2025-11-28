-- Находим пользователя
DO $$
DECLARE
    v_user_id UUID;
    v_role_id UUID;
    v_assignment_id UUID;
BEGIN
    -- Находим пользователя
    SELECT id INTO v_user_id FROM users WHERE email = 'saschkaproshka04@mail.ru';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email saschkaproshka04@mail.ru not found';
    END IF;
    
    RAISE NOTICE 'Found user: %', v_user_id;
    
    -- Находим или создаем роль super_admin
    SELECT id INTO v_role_id FROM roles WHERE name = 'super_admin' AND "isGlobal" = true;
    
    IF v_role_id IS NULL THEN
        INSERT INTO roles (id, name, description, "isSystem", "isGlobal", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'super_admin', 'Super Administrator with full access', true, true, NOW(), NOW())
        RETURNING id INTO v_role_id;
        RAISE NOTICE 'Created role super_admin: %', v_role_id;
    ELSE
        RAISE NOTICE 'Found role super_admin: %', v_role_id;
    END IF;
    
    -- Проверяем, есть ли уже назначение
    SELECT id INTO v_assignment_id FROM user_role_assignments 
    WHERE "userId" = v_user_id 
    AND "roleId" = v_role_id 
    AND "organizationId" IS NULL 
    AND "teamId" IS NULL;
    
    IF v_assignment_id IS NULL THEN
        -- Создаем новое назначение
        INSERT INTO user_role_assignments (id, "userId", "roleId", "organizationId", "teamId", "assignedBy", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), v_user_id, v_role_id, NULL, NULL, v_user_id, NOW(), NOW());
        RAISE NOTICE 'Granted super_admin role to user saschkaproshka04@mail.ru';
    ELSE
        RAISE NOTICE 'User already has super_admin role assigned';
    END IF;
    
    RAISE NOTICE 'Success! User saschkaproshka04@mail.ru now has super_admin role';
END $$;

