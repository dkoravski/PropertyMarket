# PropertyMarket

PropertyMarket е уеб приложение за публикуване и разглеждане на обяви за жилищни имоти (продажба и наем), разработено с Vanilla JavaScript и Supabase.

## Описание на проекта

### Какво прави приложението
- Публично разглеждане на активни обяви (без вход).
- Детайли за конкретен имот (цена, площ, стаи, адрес, снимки, описание).
- Регистрация/вход и управление на профил.
- Създаване, редакция, деактивация и изтриване на собствени обяви.
- Добавяне/премахване на обяви в Любими.

### Роли и права
- Гост (невписан): вижда публични обяви и детайли.
- Потребител: създава и управлява собствените си обяви, използва Любими, редактира профил.
- Администратор: има пълен достъп до потребители и всички обяви през Админ панел.
- Неактивен потребител: ограничен за insert/update операции според RLS политиките.

## Архитектура и технологии

### Front-end
- Vanilla JavaScript (ES Modules)
- HTML + CSS + Bootstrap 5 + Bootstrap Icons
- Vite за dev/build
- Multi-page navigation (отделни HTML страници, без SPA)

### Back-end (BaaS)
- Supabase (PostgreSQL + Auth + Storage)
- Supabase Auth за регистрация, вход и сесии
- Supabase Storage bucket `properties` за снимки
- RLS политики за контрол на достъпа на ниво ред

### Основни технологични зависимости
- `@supabase/supabase-js`
- `vite`

## Дизайн на базата данни

### Основни таблици
- `profiles` — профил към `auth.users` (1:1), роля и статус на потребителя.
- `properties` — обяви за имоти, собственик, тип, цена, локация, площ, стаи, статус.
- `property_images` — снимки към обява (1:N), включително корица.
- `favorites` — любими имоти, many-to-many връзка между потребители и обяви.

### Връзки между таблиците
```mermaid
erDiagram
	AUTH_USERS ||--|| PROFILES : "id"
	PROFILES ||--o{ PROPERTIES : "owner_id"
	PROPERTIES ||--o{ PROPERTY_IMAGES : "property_id"
	PROFILES ||--o{ FAVORITES : "user_id"
	PROPERTIES ||--o{ FAVORITES : "property_id"

	AUTH_USERS {
		uuid id PK
		citext email
		timestamptz created_at
	}

	PROFILES {
		uuid id PK
		citext email
		text full_name
		text phone
		user_role role
		boolean is_active
		timestamptz created_at
	}

	PROPERTIES {
		uuid id PK
		uuid owner_id FK
		text title
		text description
		property_type property_type
		listing_type listing_type
		numeric price
		text city
		text address
		numeric area_sq_m
		int rooms
		boolean is_active
		timestamptz created_at
	}

	PROPERTY_IMAGES {
		uuid id PK
		uuid property_id FK
		text image_url
		boolean is_cover
		timestamptz created_at
	}

	FAVORITES {
		uuid id PK
		uuid user_id FK
		uuid property_id FK
		timestamptz created_at
	}
```

### Бележки по схемата
- `auth.users` е системна таблица на Supabase; колоната `profiles.id` е едновременно PK и FK към `auth.users.id`.
- `favorites` има уникално ограничение за двойката `(user_id, property_id)`.
- `property_images` позволява най-много 1 корична снимка на обява (partial unique index).
- Enum типове: `user_role`, `property_type`, `listing_type` (вкл. `studio`).
- Добавени колони `is_active` в `profiles` и `properties` за soft-deactivation.

## Локална среда за разработка

### 1) Изисквания
- Node.js 18+ (препоръчително LTS)
- npm
- Supabase проект (URL + ключ)
- По желание: Supabase CLI (за автоматично прилагане на миграции)

### 2) Инсталация
```bash
npm install
```

### 3) Environment променливи
Създай `.env` в root папката:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
```

Допустимо е и:
```env
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

### 4) Подготовка на база данни
Изпълни SQL миграциите от `supabase/migrations` в реда на имената им (timestamp order).

Вариант A (Supabase SQL Editor):
- копирай и изпълни файловете последователно.

Вариант B (CLI + скрипт):
```powershell
$env:SUPABASE_ACCESS_TOKEN = "YOUR_SUPABASE_ACCESS_TOKEN"
./scripts/apply-supabase-migrations.ps1 -ProjectRef "YOUR_PROJECT_REF"
```

### 5) Стартиране
```bash
npm run dev
```

### 6) Build за production
```bash
npm run build
npm run preview
```

## Ключови папки и файлове

### Структура на проекта
```text
PropertyMarket/
├─ index.html
├─ netlify.toml
├─ package.json
├─ README.md
├─ vite.config.js
├─ scripts/
│  └─ apply-supabase-migrations.ps1
├─ src/
│  ├─ multipage/
│  │  ├─ bootstrap.js
│  │  ├─ initPage.js
│  │  ├─ hashCompat.js
│  │  └─ routes.js
│  ├─ components/
│  │  ├─ footer/
│  │  │  └─ footer.js
│  │  └─ header/
│  │     └─ header.js
│  ├─ pages/
│  │  ├─ aboutPage/
│  │  │  ├─ aboutPage.html
│  │  │  ├─ aboutPage.js
│  │  │  ├─ aboutPage.css
│  │  │  ├─ contactsPage.html
│  │  │  └─ contactsPage.js
│  │  ├─ adminPage/
│  │  │  ├─ adminPage.html
│  │  │  ├─ adminPage.css
│  │  │  └─ adminPage.js
│  │  ├─ createPropertyPage/
│  │  │  ├─ createPropertyPage.html
│  │  │  ├─ createPropertyPage.css
│  │  │  └─ createPropertyPage.js
│  │  ├─ editPropertyPage/
│  │  │  ├─ editPropertyPage.html
│  │  │  ├─ editPropertyPage.css
│  │  │  └─ editPropertyPage.js
│  │  ├─ favoritesPage/
│  │  │  ├─ favoritesPage.html
│  │  │  ├─ favoritesPage.css
│  │  │  └─ favoritesPage.js
│  │  ├─ forgotPasswordPage/
│  │  │  ├─ forgotPasswordPage.html
│  │  │  ├─ forgotPasswordPage.css
│  │  │  └─ forgotPasswordPage.js
│  │  ├─ homePage/
│  │  │  ├─ homePage.html
│  │  │  ├─ homePage.css
│  │  │  └─ homePage.js
│  │  ├─ listingsPage/
│  │  │  ├─ listingsPage.html
│  │  │  ├─ listingsPage.css
│  │  │  └─ listingsPage.js
│  │  ├─ loginPage/
│  │  │  ├─ loginPage.html
│  │  │  ├─ loginPage.css
│  │  │  └─ loginPage.js
│  │  ├─ myListingsPage/
│  │  │  ├─ myListingsPage.html
│  │  │  ├─ myListingsPage.css
│  │  │  └─ myListingsPage.js
│  │  ├─ profilePage/
│  │  │  ├─ profilePage.html
│  │  │  ├─ profilePage.css
│  │  │  └─ profilePage.js
│  │  ├─ propertyDetailsPage/
│  │  │  ├─ propertyDetailsPage.html
│  │  │  ├─ propertyDetailsPage.css
│  │  │  └─ propertyDetailsPage.js
│  │  ├─ registerPage/
│  │  │  ├─ registerPage.html
│  │  │  ├─ registerPage.css
│  │  │  └─ registerPage.js
│  │  └─ resetPasswordPage/
│  │     ├─ resetPasswordPage.html
│  │     ├─ resetPasswordPage.css
│  │     └─ resetPasswordPage.js
│  ├─ services/
│  │  └─ supabaseClient/
│  │     └─ supabaseClient.js
│  ├─ styles/
│  │  └─ main.css
│  └─ utils/
│     ├─ ui.js
│     └─ render/
│        └─ render.js
└─ supabase/
	└─ migrations/
		├─ 20260216120000_create_propertymarket_schema.sql
		├─ 20260216121000_enable_rls_and_policies.sql
		├─ 20260216123000_add_profiles_on_auth_signup_trigger.sql
		├─ 20260216124000_seed_initial_admin_by_email.sql
		├─ 20260216133000_bulletproof_signup_trigger.sql
		├─ 20260216140000_create_storage_bucket_properties.sql
		├─ 20260216143000_promote_admin_user.sql
		├─ 20260219100000_allow_public_profile_read_for_property_owners.sql
		├─ 20260221100000_add_studio_to_property_types.sql
		├─ 20260221110000_add_is_active_to_profiles.sql
		├─ 20260221111000_rls_block_inactive_users.sql
		├─ 20260221112000_hide_properties_of_inactive_users.sql
		├─ 20260221120000_fix_rls_circular_dependency.sql
		└─ 20260221130000_add_is_active_to_properties.sql
```

### Легенда
- `src/pages/` — отделни екрани, всеки със собствени `HTML + JS + CSS` файлове.
- `src/multipage/` — общ multipage bootstrap, route map, auth guard логика и съвместимост за `#/` линкове.
- `src/services/supabaseClient/` — връзка към Supabase (DB/Auth/Storage).
- `supabase/migrations/` — схема на базата данни, RLS политики и промени по сигурността.
- `src/components/` + `src/styles/main.css` — общи UI компоненти и global responsive стилове.

### Root
- `index.html` — входен HTML шаблон.
- `package.json` — npm скриптове и зависимости.
- `vite.config.js` — конфигурация на Vite.
- `netlify.toml` — настройки за деплой в Netlify.

### `src/`
- `multipage/bootstrap.js` — единна стартова точка за всички HTML страници (по `data-page`).
- `multipage/initPage.js` — инициализира shell, auth guard-и и redirect логика.
- `multipage/routes.js` — map на логически пътища и page URL-и.
- `components/` — общи UI компоненти (header, footer).
- `pages/` — логика и шаблони за всяка страница + отделен HTML и CSS за всяка страница.
- `services/supabaseClient/supabaseClient.js` — създава и експортира Supabase client.
- `styles/main.css` — глобални стилове.
- `utils/` — помощни функции за рендериране и UI feedback.

### `supabase/`
- `migrations/` — SQL миграции за schema, RLS policies, storage policies и trigger-и.

### `scripts/`
- `apply-supabase-migrations.ps1` — помощен PowerShell скрипт за `supabase db push`.

## Сигурност и контрол на достъпа

- RLS е активиран за `profiles`, `properties`, `property_images`, `favorites`.
- Политиките ограничават write операции до собственик/админ.
- Използват се helper функции като `public.is_admin()`, `public.is_active_user()`, `public.is_user_active()`.
- Публичните потребители виждат само допустимите обяви според активност и политики.

## Статус

Проектът е разработен с учебна цел за курса „Software Technologies with AI“ (SoftUni).
