-- Восстанавливаем раздел Адреса в меню
DO $$
DECLARE
    v_menu_id UUID;
    v_items JSONB;
    v_addresses_exists BOOLEAN := false;
BEGIN
    -- Находим меню
    SELECT id, items INTO v_menu_id, v_items
    FROM navigation_menus
    WHERE "menuId" = 'sidebar-main';
    
    IF v_menu_id IS NULL THEN
        RAISE EXCEPTION 'Menu sidebar-main not found';
    END IF;
    
    -- Проверяем наличие Адресов
    SELECT EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(v_items) AS item
        WHERE item->>'systemId' = 'data-addresses'
    ) INTO v_addresses_exists;
    
    RAISE NOTICE 'Addresses exists: %', v_addresses_exists;
    
    -- Если Адреса отсутствуют, добавляем их
    IF NOT v_addresses_exists THEN
        v_items := v_items || jsonb_build_object(
            'id', 'data-addresses',
            'type', 'default',
            'systemId', 'data-addresses',
            'icon', 'map-pin',
            'path', '/data/addresses',
            'enabled', true,
            'order', 4
        );
        RAISE NOTICE 'Added addresses menu item';
        
        -- Обновляем меню
        UPDATE navigation_menus
        SET items = v_items,
            "updatedAt" = NOW()
        WHERE id = v_menu_id;
        RAISE NOTICE 'Menu updated successfully';
    ELSE
        RAISE NOTICE 'Addresses already exist';
    END IF;
END $$;

