-- Проверяем пункты меню после восстановления
SELECT 
    jsonb_array_elements(items)->>'systemId' as systemId,
    jsonb_array_elements(items)->>'id' as id,
    jsonb_array_elements(items)->>'enabled' as enabled,
    jsonb_array_elements(items)->>'path' as path
FROM navigation_menus 
WHERE "menuId" = 'sidebar-main'
ORDER BY (jsonb_array_elements(items)->>'order')::int;

