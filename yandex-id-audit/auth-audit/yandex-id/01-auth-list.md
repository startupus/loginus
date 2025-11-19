### Яндекс ID — список аккаунтов (auth/list)

- **URL**: `https://passport.yandex.ru/auth/list`
- **Скриншот**: `yandex-id-audit/auth-audit/yandex-id/01-auth-list.png`

### Наблюдаемая структура
- **Заголовок H1**: «Выберите аккаунт для входа»
- **Секция**: «Аккаунты, из которых вы вышли» — список из карточек аккаунтов
  - Аватар, email/логин, имя
  - Бейджи: Плюс, Карты, Семья, Организации (по аккаунту)
  - Кнопка «Дополнительные действия с аккаунтом» (иконка «⋯»)
- **Кнопка/ссылка**: «Добавить аккаунт» (ведёт на `/auth/add`)
- **Подвал**: «Яндекс ID — ключ от всех сервисов», ссылка «Узнать больше»
- **Футер‑навигация**: переключатель языка («Ru»), «Справка и поддержка»

### A11y/DOM (по снапшоту)
- H1: «Выберите аккаунт для входа»
- H2: «Аккаунты, из которых вы вышли»
- Список аккаунтов: роль `list` → `listitem` с ссылкой на `/auth/welcome?...`
- Ссылки: «Добавить аккаунт», «Узнать больше», «Справка и поддержка»

### Скелет интерфейса (React)
```tsx
export function YandexAuthList() {
  return (
    <main className="auth-bg">
      <section className="auth-card">
        <header className="auth-card__header">
          <Logo kind="yandex-id" />
          <h1>Выберите аккаунт для входа</h1>
        </header>

        <h2>Аккаунты, из которых вы вышли</h2>
        <ul className="account-list">
          {/* Повторяющиеся элементы */}
          <li className="account-item">
            <a className="account-link" href="/auth/welcome?...">
              <Avatar />
              <div className="account-meta">
                <div className="account-login">email@example.com</div>
                <div className="account-name">Имя Фамилия</div>
                <div className="account-badges">
                  <Badge>Плюс</Badge>
                  <Badge>Карты</Badge>
                  <Badge>Семья</Badge>
                </div>
              </div>
              <IconButton aria-label="Дополнительные действия с аккаунтом" icon="more" />
            </a>
          </li>
        </ul>

        <a className="auth-add" href="/auth/add">Добавить аккаунт</a>

        <footer className="auth-footer">
          <p>Яндекс ID — ключ от всех сервисов</p>
          <a href="https://id.yandex.ru/about">Узнать больше</a>
          <nav>
            <button type="button" aria-label="Язык">Ru</button>
            <a href="https://yandex.ru/support/passport/">Справка и поддержка</a>
          </nav>
        </footer>
      </section>
    </main>
  );
}
```

### Заметки для Loginus
- Если есть «известные» сессии/аккаунты на устройстве — показывать быстрый выбор (как у Яндекс ID).
- Если нет — сразу вести на экран ввода единого поля (телефон/почта) с авто‑определением.


