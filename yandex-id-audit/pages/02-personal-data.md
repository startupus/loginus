# ТЗ: Страница Персональные данные

## URL
https://id.yandex.ru/personal

## Статус в Loginus
❌ **Не реализовано**

## Визуальный референс
Скриншот: `.playwright-mcp/yandex-id-audit/02-personal-data.png`

## Описание
Страница управления всеми персональными данными пользователя: документы, автомобили, питомцы, адреса, контакты, публичные данные и управление данными. Демонстрирует отличную организацию большого объема информации через секции.

## Актуальные секции (из визуального аудита)

1. **Профиль** - Dmitriy Lukyan, "Зовите меня: Дмитрий Лукьян", 03.02.1983
2. **Документы** - 9 типов: Паспорт РФ, Загран, Св-во о рождении, ВУ, СТС, ОМС, ДМС, ИНН, СНИЛС
3. **Автомобили** - 2 авто: Chery Tiggo 8 Pro (VIN: LVTDB21B3MD357189), Honda Civic (VIN: SHHFK28608U043703)
4. **Питомцы** - "Добавить питомца"
5. **Адреса** - Дом, Работа, Другие
6. **Контакты** - Email (dmitriy-ldm@ya.ru), Основной телефон (+7 905 730-81-81), Доп. номера (1), Запасная почта (boss.ldm@gmail.com), Связанные аккаунты (3)
7. **Публичные данные** - Публичный профиль, Отзывы и оценки, Добавить публичный адрес
8. **Управление данными** - Спецвозможности, Доступы к данным, Уведомления, Данные на сервисах, Удалить профиль

## Анализ лучших практик UI/UX Яндекс ID

### Информационная архитектура
- **Секционная организация**: Данные разбиты на логические группы (Документы, Автомобили, Питомцы, Адреса, Контакты, Публичные данные, Управление данными)
- **Якорные ссылки**: Каждая секция имеет якорную ссылку (#documents, #auto, #pets и т.д.)
- **Описательные тексты**: Каждая секция имеет краткое описание назначения
- **Прогрессивное раскрытие**: Основная информация видна, детали доступны по клику

### Визуальная иерархия
- **Карточки профиля**: Выделенная карточка с именем пользователя вверху
- **Заголовки секций**: Четкая типографика h2 для каждой секции
- **Separators**: Визуальные разделители между элементами списков
- **Иконки**: Уникальные иконки для каждого типа данных

### Интерактивность
- **Quick Actions**: Кнопки "Добавить" прямо в секциях
- **Inline Editing**: Редактирование профиля через кнопку в карточке
- **Contextual Links**: Ссылки "Все [тип]" для перехода к полным спискам

## Структура страницы

### Карточка профиля
```jsx
<button className="profile-card" onClick={openEditProfile}>
  <Avatar src={user.avatar} />
  <div>
    <h3>{user.name}</h3>
    <p>Зовите меня: {user.name}</p>
  </div>
  <Icon name="edit" />
</button>
```

### Секция Документы
```jsx
<section id="documents" className="documents-section">
  <header>
    <h2>
      <Link to="#documents">Документы</Link>
    </h2>
    <p>В ID ваши документы всегда под рукой. А мы бережно их храним</p>
  </header>
  
  <div className="documents-grid">
    {documentTypes.map(doc => (
      <Button
        key={doc.type}
        variant="card"
        onClick={() => openAddDocumentModal(doc.type)}
      >
        <Icon name={doc.icon} />
        <span>Добавить {doc.label}</span>
      </Button>
    ))}
    <Button variant="ghost" onClick={showMoreDocuments}>
      <Icon name="chevron-right" />
    </Button>
  </div>
  
  <Link to="/personal/documents" className="view-all">
    <Icon name="document" />
    <span>Все документы</span>
    <Icon name="chevron-right" />
  </Link>
</section>
```

**Типы документов:**
1. Паспорт РФ
2. Загранпаспорт
3. Свидетельство о рождении
4. ВУ (Водительское удостоверение)
5. СТС (Свидетельство о регистрации ТС)
6. ОМС (Полис медицинского страхования)
7. ДМС (Полис добровольного медицинского страхования)
8. ИНН
9. СНИЛС

### Секция Автомобили
```jsx
<section id="auto" className="vehicles-section">
  <header>
    <h2>
      <Link to="#auto">Автомобили</Link>
    </h2>
  </header>
  
  <Button variant="card" onClick={openAddVehicleModal}>
    <Icon name="car" />
    <span>Добавить автомобиль</span>
    <Icon name="plus" />
  </Button>
</section>
```

### Секция Питомцы
```jsx
<section id="pets" className="pets-section">
  <header>
    <h2>
      <Link to="#pets">Питомцы</Link>
    </h2>
    <p>Поможем хранить документы, подобрать корм или записать к ветеринару</p>
  </header>
  
  {pets.map(pet => (
    <Card key={pet.id} variant="pet" onClick={openPetProfile}>
      <Avatar src={pet.avatar} />
      <div>
        <h4>{pet.name}</h4>
        <p>{pet.type} · {pet.breed}</p>
      </div>
    </Card>
  ))}
  
  <Link to="/personal/pets" className="view-all">
    <Icon name="paw" />
    <span>Все питомцы</span>
    <Icon name="chevron-right" />
  </Link>
</section>
```

### Секция Адреса
```jsx
<section id="addresses" className="addresses-section">
  <header>
    <h2>
      <Link to="#addresses">Адреса</Link>
    </h2>
    <p>Для заказа в один клик и чтобы не вводить в Навигаторе</p>
  </header>
  
  <div className="addresses-grid">
    <Button variant="card" onClick={() => openAddAddressModal('home')}>
      <Icon name="home" />
      <span>Дом</span>
    </Button>
    
    <Button variant="card" onClick={() => openAddAddressModal('work')}>
      <Icon name="briefcase" />
      <span>Работа</span>
    </Button>
    
    <Button variant="card" onClick={() => openAddAddressModal('other')}>
      <Icon name="map-pin" />
      <span>Другие</span>
    </Button>
  </div>
  
  <Link to="/personal/addresses" className="view-all">
    <Icon name="map-pin" />
    <span>Все адреса</span>
    <Icon name="chevron-right" />
  </Link>
</section>
```

### Секция Контакты
```jsx
<section id="contacts" className="contacts-section">
  <header>
    <h2>
      <Link to="#contacts">Контакты</Link>
    </h2>
  </header>
  
  <div className="contacts-list">
    <div className="contact-item">
      <Icon name="mail" />
      <div>
        <span>Email в Яндексе</span>
        <span>{user.email}</span>
      </div>
      <Icon name="chevron-right" />
    </div>
    
    <Separator />
    
    <Link to="/security/phones" className="contact-item">
      <Icon name="phone" />
      <div>
        <span>Основной телефон</span>
        <span>{user.phone}</span>
      </div>
      <Icon name="chevron-right" />
    </Link>
    
    <Separator />
    
    <Link to="/security/external-accounts" className="contact-item">
      <Icon name="link" />
      <div>
        <span>Добавить внешние аккаунты</span>
        <p>Помогут быстрее входить в Яндекс и заполнить данные</p>
      </div>
      <Icon name="chevron-right" />
    </Link>
  </div>
</section>
```

### Секция Публичные данные
```jsx
<section id="public-data" className="public-data-section">
  <header>
    <h2>
      <Link to="#public-data">Публичные данные</Link>
    </h2>
  </header>
  
  <div className="public-data-list">
    <Link to="/personal/public-profile" className="data-item">
      <Icon name="globe" />
      <span>Публичный профиль в поиске Яндекса</span>
      <Icon name="chevron-right" />
    </Link>
    
    <Separator />
    
    <Link to="/reviews" className="data-item">
      <Icon name="star" />
      <span>Ваши отзывы и оценки</span>
      <Icon name="chevron-right" />
    </Link>
    
    <Separator />
    
    <Button variant="ghost" onClick={openAddPublicAddressModal}>
      <Icon name="map-pin" />
      <div>
        <span>Добавить публичный адрес</span>
        <p>Для ваших страниц в Яндексе</p>
      </div>
      <Icon name="chevron-right" />
    </Button>
  </div>
</section>
```

### Секция Управление данными
```jsx
<section id="data-management" className="data-management-section">
  <header>
    <h2>
      <Link to="#data-management">Управление данными</Link>
    </h2>
  </header>
  
  <div className="management-list">
    <Link to="/personal/inclusion" className="management-item">
      <Icon name="accessibility" />
      <span>Специальные возможности</span>
      <Icon name="chevron-right" />
    </Link>
    
    <Separator />
    
    <Link to="/personal/data-access" className="management-item">
      <Icon name="key" />
      <span>Доступы к данным</span>
      <Icon name="chevron-right" />
    </Link>
    
    <Separator />
    
    <Link to="/personal/communication-preferences" className="management-item">
      <Icon name="bell" />
      <span>Уведомления сервисов</span>
      <Icon name="chevron-right" />
    </Link>
    
    <Separator />
    
    <Link to="/personal/data" className="management-item">
      <Icon name="database" />
      <span>Данные на сервисах</span>
      <Icon name="chevron-right" />
    </Link>
    
    <Separator />
    
    <Button variant="danger" onClick={openDeleteProfileModal}>
      <Icon name="trash" />
      <span>Удалить профиль</span>
    </Button>
  </div>
</section>
```

## Попапы и модальные окна

### Модальное окно редактирования профиля
**Триггер:** Кнопка редактирования в карточке профиля

**Содержание:**
- Форма с полями: Имя, Фамилия, Отчество
- Поле "Зовите меня"
- Кнопки "Сохранить" и "Отмена"

### Модальное окно добавления документа
**Триггер:** Кнопки "Добавить [Тип документа]"

**Содержание:**
- Загрузка фото/скана документа
- Форма с полями документа (серия, номер, дата выдачи и т.д.)
- Валидация полей
- Кнопки "Сохранить" и "Отмена"

### Модальное окно добавления автомобиля
**Триггер:** Кнопка "Добавить автомобиль"

**Содержание:**
- Форма: Марка, Модель, Гос. номер, СТС
- Загрузка документов
- Кнопки "Сохранить" и "Отмена"

### Модальное окно добавления питомца
**Триггер:** Кнопка добавления в секции Питомцы

**Содержание:**
- Форма: Имя, Тип, Порода, Дата рождения
- Загрузка фото
- Кнопки "Сохранить" и "Отмена"

### Модальное окно добавления адреса
**Триггер:** Кнопки "Добавить [Тип адреса]"

**Содержание:**
- Форма адреса
- Интеграция с картами
- Выбор типа адреса
- Кнопки "Сохранить" и "Отмена"

### Модальное окно удаления профиля
**Триггер:** Кнопка "Удалить профиль"

**Содержание:**
- Предупреждение о последствиях
- Подтверждение через ввод пароля
- Финальное подтверждение
- Кнопки "Удалить" и "Отмена"

## Навигация

### Якорные ссылки
- `#documents` → Секция Документы
- `#auto` → Секция Автомобили
- `#pets` → Секция Питомцы
- `#addresses` → Секция Адреса
- `#contacts` → Секция Контакты
- `#public-data` → Секция Публичные данные
- `#data-management` → Секция Управление данными

### Переходы на другие страницы
- **Все документы** → `/personal/documents`
- **Все питомцы** → `/personal/pets`
- **Все адреса** → `/personal/addresses`
- **Телефон** → `/security/phones`
- **Внешние аккаунты** → `/security/external-accounts`
- **Публичный профиль** → `/personal/public-profile`
- **Специальные возможности** → `/personal/inclusion`
- **Доступы к данным** → `/personal/data-access`
- **Уведомления** → `/personal/communication-preferences`
- **Данные на сервисах** → `/personal/data`

## План модернизации для Loginus

### Что добавить

#### 1. Компонент секции данных
```tsx
interface DataSectionProps {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  viewAllLink?: string;
}

export const DataSection: React.FC<DataSectionProps> = ({
  id,
  title,
  description,
  children,
  viewAllLink,
}) => {
  const { t } = useTranslation();
  
  return (
    <section id={id} className="data-section mb-8">
      <header className="mb-4">
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
          <Link to={`#${id}`}>{title}</Link>
        </h2>
        {description && (
          <p className="text-secondary-600 dark:text-dark-6 mt-2">
            {description}
          </p>
        )}
      </header>
      
      <div className="section-content">
        {children}
      </div>
      
      {viewAllLink && (
        <Link to={viewAllLink} className="view-all-link">
          <Icon name="chevron-right" />
          <span>{t('common.viewAll')}</span>
          <Icon name="chevron-right" />
        </Link>
      )}
    </section>
  );
};
```

#### 2. Компонент списка элементов с разделителями
```tsx
export const SeparatedList: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const items = React.Children.toArray(children);
  
  return (
    <div className="separated-list">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item}
          {index < items.length - 1 && <Separator />}
        </React.Fragment>
      ))}
    </div>
  );
};
```

#### 3. Поддержка темной темы для всех секций
```tsx
<div className="bg-white dark:bg-dark-2 rounded-xl shadow-soft p-6">
  {/* контент */}
</div>
```

#### 4. i18n для всех текстов
```tsx
const { t } = useTranslation();

<h2>{t('personal.sections.documents.title')}</h2>
<p>{t('personal.sections.documents.description')}</p>
```

### Что изменить

#### 1. Структура страницы
- Использовать PageTemplate с Sidebar
- Разделить на переиспользуемые компоненты секций
- Добавить loading states
- Добавить error states

#### 2. Типизация
```typescript
interface DocumentType {
  id: string;
  type: 'passport' | 'foreign-passport' | 'birth-certificate' | 'driver-license' | 'vehicle-registration' | 'oms' | 'dms' | 'inn' | 'snils';
  label: string;
  icon: string;
  fields: DocumentField[];
}

interface AddressType {
  id: string;
  type: 'home' | 'work' | 'other';
  label: string;
  icon: string;
}
```

#### 3. Оптимизация
- Lazy loading секций
- Виртуализация списков документов
- Кэширование данных через React Query

### Ссылка на существующую страницу Loginus
- Текущая реализация: `frontend/src/pages/profile/ProfilePage.tsx`
- Нужно создать отдельную страницу `/personal` с полной функциональностью

## Примеры кода для Loginus

### PersonalDataPage компонент
```tsx
import { PageTemplate } from '@/design-system/layouts';
import { DataSection, SeparatedList } from '@/components/PersonalData';
import { usePersonalData } from '@/hooks';

export const PersonalDataPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, documents, pets, addresses } = usePersonalData();
  
  const sidebarItems = [
    { label: t('sidebar.home'), path: '/' },
    { label: t('sidebar.data'), path: '/personal', active: true },
    // ...
  ];
  
  return (
    <PageTemplate
      headerProps={{ ... }}
      sidebarItems={sidebarItems}
      showSidebar
    >
      <div className="personal-data-content">
        <ProfileCard user={user} />
        
        <DataSection
          id="documents"
          title={t('personal.sections.documents.title')}
          description={t('personal.sections.documents.description')}
          viewAllLink="/personal/documents"
        >
          <DocumentsGrid documentTypes={documentTypes} />
        </DataSection>
        
        <DataSection
          id="vehicles"
          title={t('personal.sections.vehicles.title')}
        >
          <AddVehicleButton />
        </DataSection>
        
        {/* остальные секции */}
      </div>
    </PageTemplate>
  );
};
```

---

**Дата создания:** 2025-01-17  
**Статус:** Готово к реализации  
**Приоритет:** Высокий

