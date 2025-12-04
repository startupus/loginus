DO $$
DECLARE
    v_menu_id UUID;
    v_items JSONB;
    documents_exists BOOLEAN;
    addresses_exists BOOLEAN;
BEGIN
    -- Получаем ID меню 'sidebar-main'
    SELECT id INTO v_menu_id FROM navigation_menus WHERE "menuId" = 'sidebar-main';

    IF v_menu_id IS NULL THEN
        RAISE EXCEPTION 'Menu "sidebar-main" not found';
    END IF;

    -- Получаем текущие items
    SELECT items INTO v_items FROM navigation_menus WHERE "menuId" = 'sidebar-main';

    -- Проверяем наличие пункта "Документы"
    SELECT EXISTS (
        SELECT 1 FROM jsonb_array_elements(v_items) AS item
        WHERE item->>'systemId' = 'data-documents'
    ) INTO documents_exists;

    -- Проверяем наличие пункта "Адреса"
    SELECT EXISTS (
        SELECT 1 FROM jsonb_array_elements(v_items) AS item
        WHERE item->>'systemId' = 'data-addresses'
    ) INTO addresses_exists;

    RAISE NOTICE 'Documents exists: %, Addresses exists: %', documents_exists, addresses_exists;

    -- Если "Документы" отсутствуют, добавляем их
    IF NOT documents_exists THEN
        v_items := jsonb_insert(
            v_items,
            ARRAY[jsonb_array_length(v_items)::text],
            '{
                "id": "data-documents",
                "type": "default",
                "systemId": "data-documents",
                "icon": "document",
                "path": "/data/documents",
                "enabled": true,
                "order": 3,
                "label": "Документы",
                "labelRu": "Документы",
                "labelEn": "Documents"
            }'::jsonb,
            true
        );
        RAISE NOTICE 'Added documents menu item';
    END IF;

    -- Если "Адреса" отсутствуют, добавляем их
    IF NOT addresses_exists THEN
        v_items := jsonb_insert(
            v_items,
            ARRAY[jsonb_array_length(v_items)::text],
            '{
                "id": "data-addresses",
                "type": "default",
                "systemId": "data-addresses",
                "icon": "map-pin",
                "path": "/data/addresses",
                "enabled": true,
                "order": 4,
                "label": "Адреса",
                "labelRu": "Адреса",
                "labelEn": "Addresses"
            }'::jsonb,
            true
        );
        RAISE NOTICE 'Added addresses menu item';
    END IF;

    -- Обновляем меню
    UPDATE navigation_menus
    SET items = v_items
    WHERE "menuId" = 'sidebar-main';

    RAISE NOTICE 'Menu updated successfully';
END $$;

