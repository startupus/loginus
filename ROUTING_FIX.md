# Исправление ошибки роутинга

## Проблема
Ошибка: `Cannot read properties of null (reading 'useState')` на странице `/ru/data`

## Причина
Компонент `PersonalToDataRedirect` использовал хук `useParams` вне контекста роутера при создании конфигурации роутера.

## Решение
Использован относительный путь в `Navigate` вместо компонента с хуками:
- `/:lang/personal` → `../data`
- `/:lang/personal/documents` → `../data/documents`
- `/:lang/personal/addresses` → `../data/addresses`

## Изменения
- Удален компонент `PersonalToDataRedirect`
- Использованы относительные пути в `Navigate`
- Упрощена логика редиректов

