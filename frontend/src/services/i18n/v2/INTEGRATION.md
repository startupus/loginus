# Интеграция системы переводов v2

## 🔌 Интеграция с существующей системой i18n

Новая система v2 может быть интегрирована с существующей системой i18n через feature toggle.

### Вариант 1: Полная замена (рекомендуется для новых проектов)

Создайте новый файл `config-v2.ts`, который будет использовать v2 систему:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { loadModule, loadModules } from './v2/loader';
import { isDynamicI18nMode, getEffectiveI18nMode } from './v2/toggle';
import { CRITICAL_MODULES } from './v2/config';
import type { Locale, ModuleName } from './v2/types';

const initialLanguage = 'ru'; // Получить из store

// Инициализация i18n
i18n.use(initReactI18next).init({
  lng: initialLanguage,
  fallbackLng: 'ru',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// Загрузка критичных модулей при инициализации
if (isDynamicI18nMode()) {
  (async () => {
    try {
      const modules = await loadModules(
        initialLanguage as Locale,
        [...CRITICAL_MODULES] as ModuleName[],
      );
      
      // Добавляем модули в i18n
      Object.entries(modules).forEach(([module, data]) => {
        i18n.addResourceBundle(
          initialLanguage,
          'translation',
          data,
          true,
          true,
        );
      });
    } catch (error) {
      console.error('Failed to load initial modules:', error);
    }
  })();
}

// Обработчик missingKey для ленивой загрузки
i18n.on('missingKey', async (lngs, _ns, key) => {
  if (!isDynamicI18nMode()) {
    return; // Используем старую систему
  }

  const lng = Array.isArray(lngs) ? lngs[0] : lngs;
  if (!lng) return;

  // Определяем модуль по ключу
  const { getModuleByKey } = await import('./v2/config');
  const module = getModuleByKey(key);
  if (!module) return;

  try {
    const data = await loadModule(lng as Locale, module);
    if (Object.keys(data).length > 0) {
      i18n.addResourceBundle(lng, 'translation', data, true, true);
      await i18n.reloadResources(lng);
    }
  } catch (error) {
    console.warn(`Failed to load module ${module} for locale ${lng}:`, error);
  }
});

export default i18n;
```

### Вариант 2: Гибридный режим (рекомендуется для постепенной миграции)

Модифицируйте существующий `config.ts` для поддержки переключения:

```typescript
import { isDynamicI18nMode } from './v2/toggle';
import { loadModule as loadModuleV2 } from './v2/loader';

// В функции loadModule добавьте проверку режима:
const loadModule = async (locale: string, module: ModuleName) => {
  // Если включен динамический режим, используем v2 систему
  if (isDynamicI18nMode()) {
    try {
      return await loadModuleV2(locale as Locale, module);
    } catch (error) {
      // Fallback на старую систему
      console.warn('v2 load failed, using static files:', error);
    }
  }

  // Старая система (статическая загрузка)
  try {
    const data = await import(`./locales/${locale}/${module}.json`);
    return data.default || {};
  } catch (error) {
    return {};
  }
};
```

## 🧪 Тестирование

### Переключение режима в development

```typescript
import { setI18nMode } from '@/services/i18n/v2/toggle';

// Переключить на динамический режим
setI18nMode('dynamic');

// Переключить на гибридный режим
setI18nMode('hybrid');

// Вернуться к статическому режиму
setI18nMode('static');
```

### Проверка работы API

```typescript
import { translationsAPI } from '@/services/i18n/v2/api-client';

// Проверить доступность API
const isAvailable = await translationsAPI.isAvailable();
console.log('API v2 available:', isAvailable);

// Загрузить модуль
const module = await translationsAPI.getModule('ru', 'common');
console.log('Module loaded:', module);
```

### Проверка кэша

```typescript
import { translationCache } from '@/services/i18n/v2/cache';

// Получить из кэша
const cached = await translationCache.get('ru', 'common');
console.log('Cached:', cached);

// Очистить кэш
await translationCache.clear();
```

## 📊 Мониторинг

В development режиме система логирует все операции:

- `[i18n-v2] Loaded {locale}/{module} from cache` - загрузка из кэша
- `[i18n-v2] Loaded {locale}/{module} from API` - загрузка через API
- `[i18n-v2] Loaded {locale}/{module} from static files` - загрузка из статических файлов
- `[i18n-v2] Falling back to ru for module {module}` - fallback на русский

## ⚠️ Важные замечания

1. **Обратная совместимость**: Система полностью обратно совместима. При ошибках автоматически используется fallback на статические файлы.

2. **Производительность**: В гибридном режиме сначала проверяется кэш, затем API, затем статические файлы. Это обеспечивает оптимальную производительность.

3. **Версионирование**: Кэш автоматически инвалидируется при изменении версии переводов на сервере.

4. **Офлайн режим**: При отсутствии сети система автоматически использует кэш и статические файлы.

5. **Безопасность**: Все операции неблокирующие и асинхронные. Ошибки обрабатываются gracefully.

