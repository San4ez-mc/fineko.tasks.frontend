Архітектура фронтенду
Останнє оновлення: 08.08.2025

Цілі
Єдина зрозуміла структура “feature-first + shared”.

Мінімум дублювання файлів/сторінок.

Повторновикористовувані елементи (фільтри, пагінація, таблиці, тощо).

Проста інтеграція з бекендом (Yii2), сесійні cookies.

Технічний стек (фронт)
React 18, React Router v6

axios для HTTP (cookies → withCredentials: true)

Без глобального стейт-менеджера поки що (локальний state + props)

Збірка: Create React App (react-scripts)

Якщо в майбутньому буде багато списків/кешування — розглянемо RTK Query або React Query.

Структура проєкту (актуальна)
vbnet
Копіювати
Редагувати
frontend/
├─ public/
├─ src/
│  ├─ context/
│  │  └─ AuthContext.jsx
│  ├─ modules/
│  │  ├─ auth/
│  │  │  └─ pages/
│  │  │     ├─ LoginPage.jsx
│  │  │     ├─ ForgotPasswordPage.jsx
│  │  │     └─ ResetPasswordPage.jsx
│  │  ├─ results/
│  │  │  ├─ api/
│  │  │  │  └─ results.js
│  │  │  └─ pages/
│  │  │     └─ ResultsPage.jsx
│  │  ├─ tasks/
│  │  │  └─ pages/
│  │  │     └─ DailyTasksPage.jsx
│  │  ├─ org/
│  │  │  └─ pages/
│  │  │     └─ OrgPage.jsx
│  │  └─ telegram/
│  │     └─ pages/
│  │        └─ TelegramGroupPage.jsx
│  ├─ pages/
│  │  ├─ HomePage.jsx
│  │  └─ NotFound.jsx
│  ├─ routes/
│  │  └─ AppRouter.jsx
│  ├─ shared/
│  │  ├─ api/
│  │  │  └─ client.js
│  │  ├─ components/
│  │  │  ├─ FiltersBar.jsx
│  │  │  └─ Pagination.jsx
│  │  ├─ hooks/
│  │  │  ├─ usePagination.js        (резерв)
│  │  │  └─ useToggle.js            (резерв)
│  │  └─ utils/
│  │     └─ date.js                 (резерв)
│  ├─ App.jsx
│  └─ index.jsx
├─ .env.example
└─ ARCHITECTURE.md   ← цей файл
Де що шукати
Маршрути: src/routes/AppRouter.jsx

Сторінка результатів (офіційна): src/modules/results/pages/ResultsPage.jsx

API results: src/modules/results/api/results.js

HTTP клієнт (axios): src/shared/api/client.js

Універсальні компоненти: src/shared/components/*

Аутентифікація: src/context/AuthContext.jsx (+ сторінки в modules/auth/pages)

Сторінка 404: src/pages/NotFound.jsx

Важливо: сторінки живуть у модулях. Не тримати дублікати у src/pages/*, якщо є модульна версія.

Правила кодування
Загальні
Тільки функціональні компоненти + Hooks. Жодних класових компонентів.

Іменування: PascalCase для компонентів/файлів компонентів, camelCase для змінних/функцій.

Один компонент — один файл; складні сторінки можна ділити на підкомпоненти у components/.

Не тягнути бізнес-логіку у JSX — винести в хелпери/хуки.

Валідація форм — мінімальна (HTML5) або маленькі утиліти; великі форми — розглянемо Formik/React Hook Form, якщо з’являться.

Імпорти
Відносні імпорти короткими шляхами в межах модуля.

Крос-модульні імпорти — через shared/* або чітко вказаний модуль.

Стилі
Поки базові інлайн/простий CSS. Якщо з’явиться дизайн-система — додамо Tailwind/Module CSS.

Не хардкодити кольори/відступи всередині великої кількості компонентів — зробимо токени пізніше, коли буде макет.

API/HTTP
Всі запити — через src/shared/api/client.js.

Cookies ідуть автоматично (withCredentials: true).

client.interceptors.response логуватиме помилки у консоль. Для прод-сповіщень додамо toasts (наприклад, react-hot-toast).

Обробка помилок UI
Мінімум — try/catch у місцях CRUD (уже є в ResultsPage).

TODO: додати глобальний ErrorBoundary для критичних збоїв.

Дати/час
deadline зараз — YYYY-MM-DD (date). Для форматування пізніше можна підключити date-fns; поки без залежностей.

Роутинг
Тільки один <Route path="/results"> — у AppRouter.jsx.

Приватні маршрути — через локальний RequireAuth (див. AppRouter.jsx).

Не дублювати маршрут на ту саму сторінку у різних місцях.

Тести (опційно)
Якщо вводимо тести — Jest + React Testing Library, тести поряд із компонентом: ComponentName.test.jsx.

ESLint/Prettier
Рекомендовано додати (якщо ще нема):

.editorconfig

Prettier (80–100 символів рядок; крапки з комою — так; лапки — подвійні)

ESLint (airbnb-base + react-hooks)

Повторновикористовувані елементи
shared/components/FiltersBar.jsx — рядок фільтрів (пошук + статус)

shared/components/Pagination.jsx — пагінація по сторінках

(резерв) shared/components/Table.jsx, shared/components/Modal.jsx, shared/components/Button.jsx — коли знадобиться єдиний вигляд

Принцип: якщо одна і та ж UI-частина використовується ≥2 рази — виносимо в shared/components.

API-конвенції
База: https://api.tasks.fineko.space

Авторизація: логін-пошта/пароль → сесійні cookies (бек: Yii2).
На фронті нічого вручну з cookies не робимо — withCredentials в axios.

Results
GET /results — список (параметри: page, q, status=active|done)

POST /results — створити { title, description?, expected_result?, deadline?, parent_id? }

PATCH /results/:id — оновити

DELETE /results/:id — видалити

POST /results/:id/complete — {"is_completed": true|false}

Пагінація: бек повертає { items, pagination: { page, pageCount, pageSize, totalCount } }.
На фронті використовуємо Pagination.jsx.

Telegram
POST /telegram/webhook — тіло: payload від Telegram (as-is). Відповідь: 200 OK.

POST /telegram/link/by-code — { "invite_code", "company_id" } → { ok, chat_id, title }
Помилки: 400 invalid_code, 410 code_expired, 409 already_linked

GET /telegram/groups?company_id=ID → [{id, chat_id, title, is_active, linked_at}]
GET /telegram/users?company_id=ID&q=olen → пагінований список користувачів
PUT /telegram/users/{id} — { employee_id?, synonyms? }

Потік авторизації у SPA
Користувач заходить на /auth, логіниться (бек ставить cookie).

Далі будь-які запити з фронту містять cookie автоматично (axios withCredentials).

Приватні роути в AppRouter.jsx огорнуті в RequireAuth (AuthContext визначає user).

Якщо з якихось причин API раптом повертає 401 — редірект на /auth (це можна додати в axios-interceptor пізніше).

Build & Deploy
Build
bash
Копіювати
Редагувати
npm install
npm run build
Збірка з’явиться у frontend/build/.

Deploy
Копіюємо вміст build/ на фронт-сервер (як зараз робиться).

Якщо при прямому оновленні сторінки на маршрутах (наприклад, /results) сервер віддає 404 — додати SPA fallback:

Nginx:

nginx
Копіювати
Редагувати
location / {
  try_files $uri /index.html;
}
Apache (.htaccess) у build/:

perl
Копіювати
Редагувати
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
CORS (нагадування)
На бекові має бути Access-Control-Allow-Origin: https://tasks.fineko.space і Access-Control-Allow-Credentials: true.

На фронті axios → withCredentials: true.

Домовленості по фічах
Results (готово): CRUD, підрезультати (через parent_id), фільтр (q/status), пагінація 25/стор, toggle complete.

Tasks (наступне): CRUD, прив’язка до result_id/parent_id, список за датою, виконавець/постановник, фільтри, пагінація, toggle done.
Реюз: FiltersBar, Pagination.
Розміщення: src/modules/tasks/*.

Прибирання дублікатів (чекліст)
 Залишаємо єдиний ResultsPage у src/modules/results/pages/ResultsPage.jsx.

 Видаляємо/прибираємо src/pages/ResultsPage.jsx (якщо ще десь лежить).

 В AppRouter.jsx один імпорт ResultsPage (з модуля) і один <Route path="/results" ...>.

Roadmap поліпшень (потім)
Єдині стилі (tokens) або Tailwind/SCSS.

Toast-повідомлення (успіх/помилки).

Локалізація (i18n), якщо потрібно.

RTK Query/React Query для кешу списків (коли з’являться масові фічі).

Тести критичних екранів.

## Конфігурація середовища (API, ключі, посилання)

Усі базові посилання, API-ендпоінти, токени, ключі до сторонніх сервісів зберігаються централізовано в одному файлі.

**Файл:** `src/config/env.js`

**Приклад вмісту:**
```js
const config = {
  apiBaseUrl: "https://api.tasks.fineko.space",
  telegramBotToken: "", // токен бота Telegram (необов'язково)
  // threadsApiKey: "...",
};

export default config;
```

`telegramBotToken` береться з `REACT_APP_TELEGRAM_BOT_TOKEN` або `window.__TELEGRAM_BOT_TOKEN__` і може залишатися порожнім, якщо бот не використовується.