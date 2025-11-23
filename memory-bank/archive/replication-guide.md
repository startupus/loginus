# Руководство по тиражированию эталонного метода i18n на другие страницы

## Обзор

Эталонный метод для `/dashboard` готов к тиражированию на остальные страницы проекта. Этот документ описывает пошаговый процесс применения метода.

## Шаги тиражирования

### Шаг 1: Подготовка

1. Выберите целевую страницу (например, `/data`, `/security`, `/family`)
2. Создайте `README.md` в директории компонентов страницы (например, `frontend/src/components/Data/README.md`)
3. Скопируйте чеклист из `frontend/src/components/Dashboard/README.md`

### Шаг 2: Аудит компонентов

1. Найдите все компоненты страницы:
   ```bash
   ls frontend/src/components/[PageName]/
   ```

2. Для каждого компонента проверьте:
   - [ ] Использует ли `t()` из `useTranslation()` для всех текстовых строк
   - [ ] Есть ли сырые пути типа `Link to="/..."` или `navigate('/...')`
   - [ ] Есть ли хардкодные локали типа `'ru-RU'` или `'en-US'`
   - [ ] Подписан ли компонент на изменения языка

### Шаг 3: Применение изменений

#### 3.1. Навигация

Замените все сырые пути на `buildPathWithLang()`:

```typescript
// ❌ Было
import { Link } from 'react-router-dom';
<Link to="/some-page">Link</Link>

// ✅ Стало
import { Link } from 'react-router-dom';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';

const currentLang = useCurrentLanguage();
<Link to={buildPathWithLang('/some-page', currentLang)}>Link</Link>
```

```typescript
// ❌ Было
const navigate = useNavigate();
navigate('/some-page');

// ✅ Стало
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';
const navigate = useNavigate();
const currentLang = useCurrentLanguage();
navigate(buildPathWithLang('/some-page', currentLang));
```

#### 3.2. Форматирование чисел

```typescript
// ❌ Было
{value.toLocaleString('ru-RU')}

// ✅ Стало
import { formatNumber } from '../../utils/intl/formatters';
import { useCurrentLanguage } from '../../utils/routing';

const currentLang = useCurrentLanguage();
{formatNumber(value, currentLang)}
```

#### 3.3. Форматирование валют

```typescript
// ❌ Было
{`${amount.toLocaleString('ru-RU')} ₽`}

// ✅ Стало
import { formatCurrency } from '../../utils/intl/formatters';
import { useCurrentLanguage } from '../../utils/routing';

const currentLang = useCurrentLanguage();
{formatCurrency(amount, 'RUB', currentLang)}
```

#### 3.4. Форматирование дат

```typescript
// ❌ Было
{date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}

// ✅ Стало
import { formatDate } from '../../utils/intl/formatters';
import { useCurrentLanguage } from '../../utils/routing';

const currentLang = useCurrentLanguage();
{formatDate(date, currentLang, { day: 'numeric', month: 'short' })}
```

#### 3.5. Относительное время

```typescript
// ❌ Было
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Сегодня';
  if (days === 1) return 'Вчера';
  return `${days} дн. назад`;
};

// ✅ Стало
import { formatRelativeTimeWithT } from '../../utils/intl/formatters';
import { useCurrentLanguage } from '../../utils/routing';
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
const currentLang = useCurrentLanguage();
{formatRelativeTimeWithT(date, t, currentLang)}
```

#### 3.6. Реактивность компонентов

Убедитесь, что компоненты перерисовываются при смене языка:

```typescript
// ✅ Правильно
const { t, i18n } = useTranslation();
const currentLang = useCurrentLanguage();

const items = useMemo(() => [
  { label: t('menu.item1'), path: buildPathWithLang('/path1', currentLang) },
  { label: t('menu.item2'), path: buildPathWithLang('/path2', currentLang) },
], [t, i18n.language, currentLang]);
```

### Шаг 4: Тестирование

1. Запустите приложение: `npm run dev`
2. Откройте страницу на русском языке (например, `/ru/data`)
3. Проверьте, что все тексты на русском
4. Переключите язык на английский через `LanguageSwitcher`
5. Проверьте, что:
   - URL изменился на `/en/data`
   - Все тексты переведены на английский
   - Числа и даты отформатированы в английском стиле
   - Навигационные ссылки ведут на английские версии страниц
   - Нет мигания текста при загрузке

### Шаг 5: Документация

1. Обновите `README.md` страницы с результатами аудита
2. Отметьте выполненные пункты чеклиста
3. Задокументируйте найденные проблемы и их решения

## Чеклист для каждой страницы

- [ ] Все текстовые строки используют `t()` из `useTranslation()`
- [ ] Все навигационные ссылки используют `buildPathWithLang()`
- [ ] Все числа форматируются через `formatNumber()`
- [ ] Все валюты форматируются через `formatCurrency()`
- [ ] Все даты форматируются через `formatDate()` или `formatRelativeTimeWithT()`
- [ ] Компоненты подписаны на изменения языка
- [ ] `useMemo` имеет зависимости `[t, i18n.language, currentLang]` где необходимо
- [ ] Протестировано переключение языка
- [ ] Нет мигания текста при загрузке страницы
- [ ] Документация обновлена

## Примеры проблем и решений

### Проблема: Компонент не перерисовывается при смене языка

**Решение:** Добавьте зависимости в `useMemo`:
```typescript
const items = useMemo(() => [...], [t, i18n.language, currentLang]);
```

### Проблема: Мигание текста при загрузке

**Решение:** Убедитесь, что язык определяется из URL при инициализации (уже реализовано в `config.ts`)

### Проблема: Числа не форматируются правильно

**Решение:** Используйте `formatNumber()` вместо `toLocaleString('ru-RU')`

## Приоритет страниц для тиражирования

1. `/data` - страница с документами и адресами
2. `/security` - страница безопасности
3. `/family` - страница семьи
4. `/pay` - страница платежей
5. `/work` - страница работы
6. `/support` - страница поддержки
7. Админские страницы (`/admin/*`)

## Контакты

При возникновении вопросов обращайтесь к:
- `frontend/src/components/Dashboard/README.md` - эталонный пример
- `research/I18N_V2_CONSOLIDATION.md` - архитектурные решения
- `I18N_V2_USAGE.md` - руководство по использованию

