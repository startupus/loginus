-- Восстанавливаем разделы Семья и Работа в меню
DO $$
DECLARE
    v_menu_id UUID;
    v_items JSONB;
    v_family_exists BOOLEAN := false;
    v_work_exists BOOLEAN := false;
BEGIN
    -- Находим меню
    SELECT id, items INTO v_menu_id, v_items
    FROM navigation_menus
    WHERE "menuId" = 'sidebar-main';
    
    IF v_menu_id IS NULL THEN
        RAISE EXCEPTION 'Menu sidebar-main not found';
    END IF;
    
    -- Проверяем наличие Семьи
    SELECT EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(v_items) AS item
        WHERE item->>'systemId' = 'family'
    ) INTO v_family_exists;
    
    -- Проверяем наличие Работы
    SELECT EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(v_items) AS item
        WHERE item->>'systemId' = 'work'
    ) INTO v_work_exists;
    
    RAISE NOTICE 'Family exists: %, Work exists: %', v_family_exists, v_work_exists;
    
    -- Если Семья отсутствует, добавляем её
    IF NOT v_family_exists THEN
        v_items := v_items || jsonb_build_array(
            jsonb_build_object(
                'id', 'family',
                'type', 'default',
                'systemId', 'family',
                'icon', 'users',
                'path', '/family',
                'enabled', true,
                'order', 6,
                'label', 'Семья',
                'labelRu', 'Семья',
                'labelEn', 'Family'
            )
        );
        RAISE NOTICE 'Added family menu item';
    END IF;
    
    -- Если Работа отсутствует, добавляем её
    IF NOT v_work_exists THEN
        v_items := v_items || jsonb_build_array(
            jsonb_build_object(
                'id', 'work',
                'type', 'default',
                'systemId', 'work',
                'icon', 'briefcase',
                'path', '/work',
                'enabled', true,
                'order', 7,
                'label', 'Работа',
                'labelRu', 'Работа',
                'labelEn', 'Work'
            )
        );
        RAISE NOTICE 'Added work menu item';
    END IF;
    
    -- Обновляем меню
    IF NOT v_family_exists OR NOT v_work_exists THEN
        UPDATE navigation_menus
        SET items = v_items,
            "updatedAt" = NOW()
        WHERE id = v_menu_id;
        RAISE NOTICE 'Menu updated successfully';
    ELSE
        RAISE NOTICE 'Both items already exist';
    END IF;
END $$;
