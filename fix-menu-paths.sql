-- Обновление путей для системных элементов меню
-- Обновляем пути для data-documents и data-addresses на правильные

UPDATE navigation_menu_items 
SET path = '/data/documents'
WHERE "systemId" = 'data-documents';

UPDATE navigation_menu_items 
SET path = '/data/addresses'
WHERE "systemId" = 'data-addresses';

UPDATE navigation_menu_items 
SET path = '/data'
WHERE "systemId" = 'data' AND path = '/dannye';

-- Проверяем результат
SELECT id, label, path, "systemId" 
FROM navigation_menu_items 
WHERE "systemId" IN ('data-documents', 'data-addresses', 'data')
ORDER BY "systemId";

