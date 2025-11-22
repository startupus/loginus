# План действий для достижения оценки 100/100

## Текущая оценка: 98/100
**Вычитано 2 балла:** Multi-tenant Support - ClientContext не используется в Help страницах

---

## Задачи для достижения 100/100

### ✅ Задача 1: Добавить поддержку клиентского логотипа в Logo компонент
**Файл:** `frontend/src/design-system/primitives/Logo/Logo.tsx`

**Действия:**
1. Добавить опциональный prop `customLogo?: string` для URL кастомного логотипа
2. Добавить опциональный prop `customLogoAlt?: string` для alt текста
3. Если `customLogo` передан, показывать `<img>` вместо стандартного логотипа
4. Если `customLogo` не передан, использовать стандартный логотип

**Критерии:**
- ✅ Поддержка клиентского брендинга
- ✅ Fallback на стандартный логотип

---

### ✅ Задача 2: Интегрировать useClient в LandingHeader
**Файл:** `frontend/src/design-system/layouts/LandingHeader/LandingHeader.tsx`

**Действия:**
1. Импортировать `useClient` из `../../contexts`
2. Использовать `useClient()` с fallback (try-catch или проверка на null)
3. Передать `customLogo` из `client.branding?.logo` в компонент `Logo`
4. Использовать `hasFeature()` для условного отображения навигационных элементов

**Критерии:**
- ✅ Клиентский брендинг работает
- ✅ Условная функциональность через `hasFeature()`
- ✅ Fallback на дефолтные значения если клиент не установлен

---

### ✅ Задача 3: Интегрировать useClient в LandingFooter
**Файл:** `frontend/src/design-system/layouts/LandingFooter/LandingFooter.tsx`

**Действия:**
1. Импортировать `useClient` из `../../contexts`
2. Использовать `useClient()` с fallback
3. Использовать `client.branding?.logo` для кастомного логотипа в footer
4. Использовать `hasFeature()` для условного отображения ссылок

**Критерии:**
- ✅ Клиентский брендинг работает
- ✅ Условная функциональность через `hasFeature()`
- ✅ Fallback на дефолтные значения

---

### ✅ Задача 4: Использовать useClient в HelpPage
**Файл:** `frontend/src/pages/HelpPage.tsx`

**Действия:**
1. Импортировать `useClient` из `../design-system/contexts`
2. Использовать `useClient()` с fallback
3. Использовать `hasFeature('help-custom-sections')` для условного отображения разделов
4. Использовать `client.branding` для кастомизации (если нужно)

**Критерии:**
- ✅ Условная функциональность через `hasFeature()`
- ✅ Поддержка клиентской персонализации
- ✅ Fallback на дефолтные значения

---

### ✅ Задача 5: Использовать useClient в AuthorizationHelpPage
**Файл:** `frontend/src/pages/help/AuthorizationHelpPage.tsx`

**Действия:**
1. Импортировать `useClient` из `../../design-system/contexts`
2. Использовать `useClient()` с fallback
3. Использовать `hasFeature()` для условного отображения секций статьи
4. Пример: `hasFeature('help-authorization-advanced')` для показа дополнительных разделов

**Критерии:**
- ✅ Условная функциональность через `hasFeature()`
- ✅ Поддержка клиентской персонализации
- ✅ Fallback на дефолтные значения

---

### ✅ Задача 6: Создать безопасный хук useClientSafe
**Файл:** `frontend/src/design-system/contexts/ClientContext.tsx`

**Действия:**
1. Создать `useClientSafe()` хук, который возвращает дефолтные значения если ClientProvider не найден
2. Использовать этот хук в публичных страницах (Help, Landing)
3. Это позволит использовать ClientContext без ошибок, даже если клиент не установлен

**Критерии:**
- ✅ Безопасное использование в публичных страницах
- ✅ Fallback на дефолтные значения
- ✅ Нет ошибок при отсутствии клиента

---

### ✅ Задача 7: Добавить пример использования ClientContext в документации
**Файл:** `frontend/src/design-system/README.md` или новый файл

**Действия:**
1. Добавить раздел о Multi-tenant Support
2. Показать примеры использования `useClient()` и `hasFeature()`
3. Показать примеры клиентского брендинга

**Критерии:**
- ✅ Документация обновлена
- ✅ Примеры использования добавлены

---

## Приоритет выполнения

1. **Высокий приоритет:**
   - Задача 6: Создать `useClientSafe()` хук (безопасность)
   - Задача 1: Добавить поддержку клиентского логотипа в Logo
   - Задача 2: Интегрировать useClient в LandingHeader
   - Задача 3: Интегрировать useClient в LandingFooter

2. **Средний приоритет:**
   - Задача 4: Использовать useClient в HelpPage
   - Задача 5: Использовать useClient в AuthorizationHelpPage

3. **Низкий приоритет:**
   - Задача 7: Документация

---

## Ожидаемый результат

После выполнения всех задач:
- ✅ **Multi-tenant Support: 10/10** (вместо 8/10)
- ✅ **Итоговая оценка: 100/100**

Все принципы дизайн-системы будут полностью соблюдены:
- ✅ Глобальная тема: 10/10
- ✅ Atomic Design: 10/10
- ✅ Single Source of Truth: 10/10
- ✅ Composition over Inheritance: 10/10
- ✅ Theme-driven Design: 10/10
- ✅ **Multi-tenant Support: 10/10** ← исправлено
- ✅ API через NestJS: 10/10
- ✅ Мультиязычность: 10/10
- ✅ Темная/светлая тема: 10/10
- ✅ Переиспользование компонентов: 10/10

---

## Технические детали

### useClientSafe() хук
```typescript
export const useClientSafe = (): ClientContextType => {
  try {
    return useClient();
  } catch {
    // Fallback для публичных страниц без клиента
    return {
      client: null,
      setClient: () => {},
      applyClientTheme: () => {},
      hasFeature: () => false,
    };
  }
};
```

### Пример использования в LandingHeader
```typescript
const { client, hasFeature } = useClientSafe();
const customLogo = client?.branding?.logo;
const showAdvancedNav = hasFeature('advanced-navigation');

<Logo customLogo={customLogo} />
```

### Пример использования в HelpPage
```typescript
const { hasFeature } = useClientSafe();
const showCustomSections = hasFeature('help-custom-sections');

{showCustomSections && <CustomHelpSection />}
```

