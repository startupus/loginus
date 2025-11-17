# План распределения компонентов TailGrids (БЕЗ ДУБЛЕЙ)

## Обнаруженные дубли

### ❌ Дубли которые нужно решить:

1. **Footer** - ДУБЛЬ!
   - `layouts/Footer/` (кастомный, минималистичный) 
   - `tailgrids-bank/application/Footer/` (7 полноценных вариантов)
   - **Решение:** Удалить кастомный Footer, заменить на TailGrids варианты

2. **Modal** - частичный дубль
   - `composites/Modal/` (уже адаптирован из TailGrids Modal1)
   - `tailgrids-bank/application/Modal/` (еще 10 вариантов)
   - **Решение:** Оставить адаптированный Modal, остальные варианты в Modal/variants/

3. **Switch** - ДУБЛЬ!
   - `composites/Switch/` (кастомный)
   - `tailgrids-bank/core/Switch/` (5 вариантов)
   - **Решение:** Заменить на TailGrids варианты

4. **Tabs** - ДУБЛЬ!
   - `composites/Tabs/` (кастомный)
   - `tailgrids-bank/core/Tab/` (11 вариантов)  
   - **Решение:** Заменить на TailGrids варианты

5. **Navbar vs Header** - похожие но разные
   - `layouts/Header/` (кастомный для проекта)
   - `tailgrids-bank/application/Navbar/` (8 вариантов)
   - **Решение:** Оставить Header (специфичный), Navbar добавить для справки

6. **Sidebar vs VerticalNav** - похожие но разные
   - `layouts/Sidebar/` (кастомный)
   - `tailgrids-bank/dashboard/VerticalNavbar/` (7 вариантов)
   - **Решение:** Оставить Sidebar (специфичный), VerticalNav добавить для справки

7. **WidgetCard vs Card** - частичный дубль
   - `composites/WidgetCard/` (адаптирован из TailGrids Card1)
   - `tailgrids-bank/application/Card/` (16 вариантов)
   - **Решение:** Оставить WidgetCard, остальные Card в composites/Card/variants/

---

## ИСПРАВЛЕННЫЙ план распределения

### Этап 1: Удалить дубли

**Удалить кастомные компоненты которые заменяем на TailGrids:**
```bash
rm -rf design-system/layouts/Footer
rm -rf design-system/composites/Switch  
rm -rf design-system/composites/Tabs
```

---

### Этап 2: Создать структуру директорий

**Primitives (новые):**
```bash
mkdir -p design-system/primitives/Alert
mkdir -p design-system/primitives/Checkbox
mkdir -p design-system/primitives/Progress
mkdir -p design-system/primitives/Spinner
mkdir -p design-system/primitives/Tooltip
mkdir -p design-system/primitives/Tag
mkdir -p design-system/primitives/Rating
mkdir -p design-system/primitives/Button/variants
mkdir -p design-system/primitives/Avatar/variants
mkdir -p design-system/primitives/Badge/variants
```

**Composites (новые):**
```bash
mkdir -p design-system/composites/Card
mkdir -p design-system/composites/Table
mkdir -p design-system/composites/Form
mkdir -p design-system/composites/Dropdown
mkdir -p design-system/composites/Breadcrumb
mkdir -p design-system/composites/Pagination
mkdir -p design-system/composites/Tab
mkdir -p design-system/composites/Switch
mkdir -p design-system/composites/ButtonGroup
mkdir -p design-system/composites/MegaMenu
mkdir -p design-system/composites/Modal/variants
mkdir -p design-system/composites/WidgetCard/variants
```

**Layouts (новые):**
```bash
mkdir -p design-system/layouts/Footer
mkdir -p design-system/layouts/Navbar
mkdir -p design-system/layouts/VerticalNav
mkdir -p design-system/layouts/HorizontalMenu
```

**Business (новая категория):**
```bash
mkdir -p design-system/business/Dashboard/DataStats
mkdir -p design-system/business/Dashboard/Chart
mkdir -p design-system/business/Profile
mkdir -p design-system/business/Settings
mkdir -p design-system/business/Calendar
mkdir -p design-system/business/Auth
mkdir -p design-system/business/Contact
mkdir -p design-system/business/Blog
mkdir -p design-system/business/Errors
mkdir -p design-system/business/Chat
mkdir -p design-system/business/Cart
```

**Utilities (новая категория):**
```bash
mkdir -p design-system/utilities/Clipboard
mkdir -p design-system/utilities/DatePicker
mkdir -p design-system/utilities/FileUpload
mkdir -p design-system/utilities/InputRange
mkdir -p design-system/utilities/Select
mkdir -p design-system/utilities/Toast
mkdir -p design-system/utilities/Cookies
mkdir -p design-system/utilities/Drawer
mkdir -p design-system/utilities/Popover
mkdir -p design-system/utilities/Stepper
mkdir -p design-system/utilities/List
mkdir -p design-system/utilities/Gallery
mkdir -p design-system/utilities/Skeleton
```

---

### Этап 3: Скопировать Primitives

**Alert:**
```bash
cp tailgrids-bank/core/Alerts/* design-system/primitives/Alert/
```

**Checkbox:**
```bash
cp tailgrids-bank/core/Checkboxes/* design-system/primitives/Checkbox/
```

**Progress:**
```bash
cp tailgrids-bank/core/Progress/* design-system/primitives/Progress/
```

**Spinner:**
```bash
cp tailgrids-bank/core/Spinners/* design-system/primitives/Spinner/
```

**Tooltip:**
```bash
cp tailgrids-bank/core/Tooltip/* design-system/primitives/Tooltip/
```

**Tag:**
```bash
cp tailgrids-bank/core/Tags/* design-system/primitives/Tag/
```

**Rating:**
```bash
cp tailgrids-bank/core/Ratings/* design-system/primitives/Rating/
```

**Button variants (для справки):**
```bash
cp tailgrids-bank/core/Buttons/* design-system/primitives/Button/variants/
```

**Avatar variants (для справки):**
```bash
cp tailgrids-bank/core/Avatar/* design-system/primitives/Avatar/variants/
```

**Badge variants (для справки):**
```bash
cp tailgrids-bank/core/Badges/* design-system/primitives/Badge/variants/
```

---

### Этап 4: Скопировать Composites

**Card (16 вариантов):**
```bash
cp tailgrids-bank/application/Card/* design-system/composites/Card/
```

**Table (12 вариантов):**
```bash
cp tailgrids-bank/application/Table/* design-system/composites/Table/
```

**Form (5 вариантов):**
```bash
cp tailgrids-bank/core/FormElement/* design-system/composites/Form/
```

**Breadcrumb (12 вариантов):**
```bash
cp tailgrids-bank/core/Breadcrumb/* design-system/composites/Breadcrumb/
```

**Pagination (6 вариантов):**
```bash
cp tailgrids-bank/core/Paginations/* design-system/composites/Pagination/
```

**Tab (11 вариантов) - ЗАМЕНЯЕМ Tabs:**
```bash
cp tailgrids-bank/core/Tab/* design-system/composites/Tab/
```

**Switch (5 вариантов) - ЗАМЕНЯЕМ Switch:**
```bash
cp tailgrids-bank/core/Switch/* design-system/composites/Switch/
```

**Dropdown (4 варианта):**
```bash
cp tailgrids-bank/dashboard/Dropdown/* design-system/composites/Dropdown/
```

**ButtonGroup (3 варианта):**
```bash
cp tailgrids-bank/core/ButtonGroups/* design-system/composites/ButtonGroup/
```

**MegaMenu (3 варианта):**
```bash
cp tailgrids-bank/core/MegaMenus/* design-system/composites/MegaMenu/
```

**Modal variants (остальные 10):**
```bash
cp tailgrids-bank/application/Modal/Modal2.jsx design-system/composites/Modal/variants/
cp tailgrids-bank/application/Modal/Modal3.jsx design-system/composites/Modal/variants/
# ... и так далее
```

**WidgetCard variants (остальные Card):**
```bash
cp tailgrids-bank/application/Card/Card2.jsx design-system/composites/WidgetCard/variants/
cp tailgrids-bank/application/Card/Card3.jsx design-system/composites/WidgetCard/variants/
# ... и так далее
```

---

### Этап 5: Скопировать Layouts

**Footer (7 вариантов) - ЗАМЕНЯЕМ:**
```bash
cp tailgrids-bank/application/Footer/* design-system/layouts/Footer/
```

**Navbar (8 вариантов):**
```bash
cp tailgrids-bank/application/Navbar/* design-system/layouts/Navbar/
```

**VerticalNav (7 вариантов):**
```bash
cp tailgrids-bank/dashboard/VerticalNavbar/* design-system/layouts/VerticalNav/
```

**HorizontalMenu (6 вариантов):**
```bash
cp tailgrids-bank/dashboard/HorizontalMenu/* design-system/layouts/HorizontalMenu/
```

**Оставить как есть:**
- `Header/` - специфичный для проекта
- `Sidebar/` - специфичный для проекта
- `PageTemplate/` - специфичный для проекта

---

### Этап 6: Скопировать Business компоненты

**Dashboard:**
```bash
cp tailgrids-bank/dashboard/DataStats/* design-system/business/Dashboard/DataStats/
cp tailgrids-bank/dashboard/Chart/* design-system/business/Dashboard/Chart/
```

**Profile:**
```bash
cp tailgrids-bank/dashboard/Profile/* design-system/business/Profile/
```

**Settings:**
```bash
cp tailgrids-bank/dashboard/SettingsPage/* design-system/business/Settings/Page1/
cp tailgrids-bank/dashboard/SettingsPage2/* design-system/business/Settings/Page2/
```

**Auth:**
```bash
cp tailgrids-bank/application/Signin/* design-system/business/Auth/
```

**Contact:**
```bash
cp tailgrids-bank/application/Contact/* design-system/business/Contact/
```

**Blog:**
```bash
cp tailgrids-bank/application/Blog/* design-system/business/Blog/
```

**Errors:**
```bash
cp tailgrids-bank/application/Error/* design-system/business/Errors/
```

**Chat:**
```bash
cp tailgrids-bank/dashboard/ChatBox/* design-system/business/Chat/ChatBox/
cp tailgrids-bank/dashboard/ChatList/* design-system/business/Chat/ChatList/
```

**Cart:**
```bash
cp tailgrids-bank/dashboard/ShoppingCart/* design-system/business/Cart/
```

**Calendar:**
```bash
cp tailgrids-bank/dashboard/Calendar/* design-system/business/Calendar/
```

---

### Этап 7: Скопировать Utilities

**Clipboard:**
```bash
cp tailgrids-bank/core/Clipboard/* design-system/utilities/Clipboard/
cp tailgrids-bank/core/Clipboards/* design-system/utilities/Clipboard/variants/
```

**DatePicker:**
```bash
cp tailgrids-bank/core/DatePicker/* design-system/utilities/DatePicker/
```

**FileUpload:**
```bash
cp tailgrids-bank/core/FileUploads/* design-system/utilities/FileUpload/
```

**InputRange:**
```bash
cp tailgrids-bank/core/InputRange/* design-system/utilities/InputRange/
```

**Select:**
```bash
cp tailgrids-bank/core/Selects/* design-system/utilities/Select/
cp tailgrids-bank/dashboard/SelectBox/* design-system/utilities/SelectBox/
```

**Toast:**
```bash
cp tailgrids-bank/core/Toast/* design-system/utilities/Toast/
```

**Cookies:**
```bash
cp tailgrids-bank/dashboard/Cookies/* design-system/utilities/Cookies/
```

**Drawer:**
```bash
cp tailgrids-bank/dashboard/Drawer/* design-system/utilities/Drawer/
```

**Popover:**
```bash
cp tailgrids-bank/dashboard/Popover/* design-system/utilities/Popover/
```

**Stepper:**
```bash
cp tailgrids-bank/dashboard/Step/* design-system/utilities/Stepper/
```

**List:**
```bash
cp tailgrids-bank/core/List/* design-system/utilities/List/
```

**Gallery:**
```bash
cp tailgrids-bank/core/Galleries/* design-system/utilities/Gallery/
```

**Skeleton:**
```bash
cp tailgrids-bank/core/Skeletons/* design-system/utilities/Skeleton/
```

---

## Итоговая структура БЕЗ ДУБЛЕЙ

```
design-system/
  ├── primitives/                 # Atoms
  │   ├── Button/
  │   │   ├── Button.tsx          ✅ Адаптирован из TailGrids
  │   │   └── variants/           📦 34 варианта из банка
  │   ├── Input/
  │   │   └── Input.tsx           ✅ Адаптирован из TailGrids
  │   ├── Badge/
  │   │   ├── Badge.tsx           ✅ Адаптирован из TailGrids
  │   │   └── variants/           📦 9 вариантов из банка
  │   ├── Avatar/
  │   │   ├── Avatar.tsx          ✅ Уже есть
  │   │   └── variants/           📦 9 вариантов из банка
  │   ├── Icon/                   ✅ Кастомный (SVG)
  │   ├── Separator/              ✅ Кастомный
  │   ├── Alert/                  📦 13 вариантов из банка
  │   ├── Checkbox/               📦 5 вариантов из банка
  │   ├── Progress/               📦 7 вариантов из банка
  │   ├── Spinner/                📦 4 варианта из банка
  │   ├── Tooltip/                📦 5 вариантов из банка
  │   ├── Tag/                    📦 4 варианта из банка
  │   └── Rating/                 📦 3 варианта из банка
  │
  ├── composites/                 # Molecules
  │   ├── Modal/
  │   │   ├── Modal.tsx           ✅ Адаптирован из Modal1
  │   │   └── variants/           📦 10 остальных вариантов
  │   ├── WidgetCard/
  │   │   ├── WidgetCard.tsx      ✅ Адаптирован из Card1
  │   │   └── variants/           📦 15 остальных Card
  │   ├── Card/                   📦 16 вариантов Card
  │   ├── Table/                  📦 12 вариантов
  │   ├── Form/                   📦 5 вариантов
  │   ├── Tab/                    📦 11 вариантов (ЗАМЕНЯЕТ Tabs)
  │   ├── Switch/                 📦 5 вариантов (ЗАМЕНЯЕТ Switch)
  │   ├── Dropdown/               📦 4 варианта
  │   ├── Breadcrumb/             📦 12 вариантов
  │   ├── Pagination/             📦 6 вариантов
  │   ├── ButtonGroup/            📦 3 варианта
  │   ├── MegaMenu/               📦 3 варианта
  │   ├── DataSection/            ✅ Кастомный (оставить)
  │   └── SeparatedList/          ✅ Кастомный (оставить)
  │
  ├── layouts/                    # Organisms
  │   ├── Header/                 ✅ Кастомный (оставить)
  │   ├── Sidebar/                ✅ Кастомный (оставить)
  │   ├── PageTemplate/           ✅ Кастомный (оставить)
  │   ├── Footer/                 📦 7 вариантов (ЗАМЕНЯЕТ Footer)
  │   ├── Navbar/                 📦 8 вариантов
  │   ├── VerticalNav/            📦 7 вариантов
  │   └── HorizontalMenu/         📦 6 вариантов
  │
  ├── business/                   # Templates - НОВАЯ КАТЕГОРИЯ
  │   ├── Dashboard/
  │   │   ├── DataStats/          📦 10 вариантов
  │   │   └── Chart/              📦 10 вариантов
  │   ├── Profile/                📦 5 вариантов
  │   ├── Settings/               📦 20 вариантов (2 страницы)
  │   ├── Calendar/               📦 4 варианта
  │   ├── Auth/                   📦 8 вариантов (Signin)
  │   ├── Contact/                📦 14 вариантов
  │   ├── Blog/                   📦 10 вариантов
  │   ├── Errors/                 📦 8 вариантов
  │   ├── Chat/                   📦 7 вариантов
  │   └── Cart/                   📦 4 варианта
  │
  ├── utilities/                  # Helpers - НОВАЯ КАТЕГОРИЯ
  │   ├── Clipboard/              📦 8 вариантов (Clipboard + Clipboards)
  │   ├── DatePicker/             📦 2 варианта
  │   ├── FileUpload/             📦 5 вариантов
  │   ├── InputRange/             📦 3 варианта
  │   ├── Select/                 📦 7 вариантов (Selects + SelectBox)
  │   ├── Toast/                  📦 8 вариантов
  │   ├── Cookies/                📦 4 варианта
  │   ├── Drawer/                 📦 2 варианта
  │   ├── Popover/                📦 6 вариантов
  │   ├── Stepper/                📦 8 вариантов
  │   ├── List/                   📦 9 вариантов
  │   ├── Gallery/                📦 5 вариантов
  │   └── Skeleton/               📦 3 варианта
  │
  ├── contexts/                   ✅ Оставить как есть
  ├── themes/                     ✅ Оставить как есть
  └── tailgrids-bank/             🗑️ Удалить после распределения
```

---

## Резюме изменений

### Удалить (дубли):
- ❌ `layouts/Footer/` → заменить на TailGrids Footer
- ❌ `composites/Switch/` → заменить на TailGrids Switch
- ❌ `composites/Tabs/` → заменить на TailGrids Tab

### Оставить (уникальные):
- ✅ `layouts/Header/` - специфичный для проекта
- ✅ `layouts/Sidebar/` - специфичный для проекта
- ✅ `layouts/PageTemplate/` - специфичный для проекта
- ✅ `primitives/Icon/` - кастомные SVG иконки
- ✅ `primitives/Separator/` - кастомный разделитель
- ✅ `composites/DataSection/` - кастомный компонент
- ✅ `composites/SeparatedList/` - кастомная логика

### Дополнить (варианты):
- ✅ `primitives/Button/` + variants/
- ✅ `primitives/Avatar/` + variants/
- ✅ `primitives/Badge/` + variants/
- ✅ `composites/Modal/` + variants/
- ✅ `composites/WidgetCard/` + variants/

### Добавить (новые):
- 🆕 `primitives/Alert/`, `Checkbox/`, `Progress/`, `Spinner/`, `Tooltip/`, `Tag/`, `Rating/`
- 🆕 `composites/Card/`, `Table/`, `Form/`, `Tab/`, `Switch/`, `Dropdown/`, `Breadcrumb/`, `Pagination/`, `ButtonGroup/`, `MegaMenu/`
- 🆕 `layouts/Footer/`, `Navbar/`, `VerticalNav/`, `HorizontalMenu/`
- 🆕 `business/` - вся категория
- 🆕 `utilities/` - вся категория

---

## Команды для выполнения

Все команды используют абсолютные пути для работы с кириллицей:

```bash
BASE="/Users/dmitriy/Google Диск/Проекты курсор/Loginus UI/frontend/src/design-system"

# Этап 1: Удалить дубли
rm -rf "$BASE/layouts/Footer"
rm -rf "$BASE/composites/Switch"
rm -rf "$BASE/composites/Tabs"
```

---

**Готов начать распределение БЕЗ ДУБЛЕЙ?**
