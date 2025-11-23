# Dashboard Components

Компоненты для главной страницы дашборда пользователя (`/dashboard`).

## Чеклист i18n/UX для компонентов Dashboard

При создании или обновлении компонентов Dashboard убедитесь, что:

### ✅ i18n (Интернационализация)

- [ ] Все текстовые строки используют `t()` из `useTranslation()`
- [ ] Ключи переводов соответствуют структуре модулей (`dashboard.*`, `common.*`, `profile.*`)
- [ ] Все навигационные ссылки используют `buildPathWithLang()` вместо сырых путей
- [ ] Форматирование чисел и дат использует утилиты из `utils/intl/formatters.ts`
- [ ] Компонент подписан на изменения языка через зависимости в `useMemo`/`useEffect`

### ✅ Навигация

- [ ] Все `Link to="/..."` заменены на `buildPathWithLang(path, currentLang)`
- [ ] Все `navigate('/...')` заменены на `navigate(buildPathWithLang(path, currentLang))`
- [ ] Query параметры и hash сохраняются при переключении языка

### ✅ Форматирование

- [ ] Числа форматируются через `formatNumber(value, locale)`
- [ ] Валюты форматируются через `formatCurrency(value, currency, locale)`
- [ ] Даты форматируются через `formatDate(date, locale, options)`
- [ ] Относительное время форматируется через `formatRelativeTimeWithT(date, t, locale)`
- [ ] Нет хардкодных локалей типа `'ru-RU'` или `'en-US'`

### ✅ Реактивность

- [ ] Компонент перерисовывается при смене языка
- [ ] `useMemo` имеет зависимости `[t, i18n.language, currentLang]` где необходимо
- [ ] Используется `useCurrentLanguage()` для получения текущего языка из URL

## Компоненты

### ProfileCard
Карточка профиля пользователя с балансом и игровыми баллами.

**Использует:**
- `formatCurrency()` для баланса
- `formatNumber()` для игровых баллов
- `buildPathWithLang()` для ссылки "Объединить аккаунты"

### DocumentsGrid
Сетка типов документов с возможностью добавления.

**Использует:**
- `t('personalData.documents.*')` для переводов
- `buildPathWithLang()` для ссылки "Все документы"
- Проверяется E2E сценарием `should render English resources on direct /en/dashboard load`, который гарантирует отсутствие сырых ключей в интерфейсе

### AddressesGrid
Сетка адресов с возможностью добавления.

**Использует:**
- `t('personalData.addresses.*')` для переводов
- `buildPathWithLang()` для ссылки "Все адреса"

### Widgets (CoursesWidget, EventsWidget, MailWidget, PlusWidget, PayWidget, RoadmapWidget)
Виджеты для отображения различных данных на дашборде.

**Используют:**
- `formatNumber()` для чисел
- `formatCurrency()` для валют
- `formatDate()` для дат
- `formatRelativeTimeWithT()` для относительного времени
- `buildPathWithLang()` для всех навигационных ссылок

## Пример эталонного компонента

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';
import { formatNumber, formatCurrency } from '../../utils/intl/formatters';

export const MyWidget: React.FC<MyWidgetProps> = ({ value, amount }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = useCurrentLanguage();

  const handleClick = () => {
    navigate(buildPathWithLang('/some-page', currentLang));
  };

  return (
    <div>
      <h2>{t('dashboard.myWidget.title', 'Заголовок')}</h2>
      <p>{formatNumber(value, currentLang)}</p>
      <p>{formatCurrency(amount, 'RUB', currentLang)}</p>
      <button onClick={handleClick}>
        {t('dashboard.myWidget.viewAll', 'Смотреть все')}
      </button>
    </div>
  );
};
```

## Метод тиражирования на другие страницы

1. Создать аналогичный README.md в директории компонентов страницы
2. Пройтись по всем компонентам и применить чеклист
3. Заменить все сырые пути на `buildPathWithLang()`
4. Применить форматтеры для чисел/дат
5. Убедиться в реактивности компонентов при смене языка
6. Протестировать переключение языка на странице

