-- Проверяем текущее состояние меню
SELECT 
    menuId, 
    name, 
    jsonb_array_length(items) as items_count
FROM navigation_menus 
WHERE menuId = 'sidebar-main';

-- Проверяем системные пункты
SELECT 
    jsonb_array_elements(items)->>'systemId' as systemId,
    jsonb_array_elements(items)->>'id' as id,
    jsonb_array_elements(items)->>'enabled' as enabled,
    jsonb_array_elements(items)->>'type' as type
FROM navigation_menus 
WHERE menuId = 'sidebar-main';

-- Восстанавливаем системные пункты меню, если их нет
DO $$
DECLARE
    v_menu_id UUID;
    v_items JSONB;
    v_profile_exists BOOLEAN := false;
    v_documents_exists BOOLEAN := false;
    v_new_items JSONB;
BEGIN
    -- Находим меню
    SELECT id, items INTO v_menu_id, v_items
    FROM navigation_menus
    WHERE "menuId" = 'sidebar-main';
    
    IF v_menu_id IS NULL THEN
        RAISE EXCEPTION 'Menu sidebar-main not found';
    END IF;
    
    -- Проверяем наличие Профиля
    SELECT EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(v_items) AS item
        WHERE item->>'systemId' = 'profile'
    ) INTO v_profile_exists;
    
    -- Проверяем наличие Документов
    SELECT EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(v_items) AS item
        WHERE item->>'systemId' = 'data-documents'
    ) INTO v_documents_exists;
    
    RAISE NOTICE 'Profile exists: %, Documents exists: %', v_profile_exists, v_documents_exists;
    
    -- Если Профиль отсутствует, добавляем его
    IF NOT v_profile_exists THEN
        v_items := v_items || jsonb_build_object(
            'id', 'dashboard',
            'type', 'default',
            'systemId', 'profile',
            'icon', 'home',
            'path', '/dashboard',
            'enabled', true,
            'order', 1
        );
        RAISE NOTICE 'Added profile menu item';
    END IF;
    
    -- Если Документы отсутствуют, добавляем их
    IF NOT v_documents_exists THEN
        v_items := v_items || jsonb_build_object(
            'id', 'data-documents',
            'type', 'default',
            'systemId', 'data-documents',
            'icon', 'document',
            'path', '/data/documents',
            'enabled', true,
            'order', 3
        );
        RAISE NOTICE 'Added documents menu item';
    END IF;
    
    -- Обновляем меню
    IF NOT v_profile_exists OR NOT v_documents_exists THEN
        UPDATE navigation_menus
        SET items = v_items,
            "updatedAt" = NOW()
        WHERE id = v_menu_id;
        RAISE NOTICE 'Menu updated successfully';
    ELSE
        RAISE NOTICE 'All required items already exist';
    END IF;
END $$;

