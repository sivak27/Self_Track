# Personal Control Center

A modern, high-performance personal command and life management station built with a local, private 3-tier architecture:
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui + React Router + Recharts
- **Backend**: Node.js + Express.js + TypeScript + Zod + REST API
- **Database & Auth**: Local SQLite (`better-sqlite3`) with bcrypt password hashing and JWT/HTTP-only cookie authentication

---

## Architecture Overview

```
┌────────────────────────────────┐
│   React 19 + Vite (Frontend)   │  Port 3000 / 5173
│  • React Router                │  Light Mode (#F8FAFC)
│  • Lucide Icons & Recharts     │  Token & HTTP-only Cookie in API Client
└───────────────┬────────────────┘
                │ HTTP REST API (Bearer JWT / Cookie)
                ▼
┌────────────────────────────────┐
│  Node.js + Express (Backend)   │  Port 5000
│  • TypeScript & Zod Validation │  Routes -> Controllers -> Services
│  • Auth & Error Middleware     │  CORS Protection
└───────────────┬────────────────┘
                │ Native Database Driver (better-sqlite3)
                ▼
┌────────────────────────────────┐
│      SQLite Local Database     │  database/personal-control-center.db
│  • Automated Schema Init       │  11 Domain Tables + Indexes
│  • WAL Mode & Foreign Keys     │  Strict User Isolation
└────────────────────────────────┘
```

---

## Project Structure

```
personal-control-center/
├── frontend/                     # React + Vite Client Application
│   ├── src/
│   │   ├── components/           # Reusable UI cards, tables, modals, layouts
│   │   ├── pages/                # React Router pages (Dashboard, Expenses, Tasks, etc.)
│   │   ├── features/             # Feature domain barrels
│   │   ├── layouts/              # DashboardLayout & AuthLayout
│   │   ├── hooks/                # Custom React hooks (useExpenses, useTasks, useAuth, etc.)
│   │   ├── services/             # HTTP REST API services (apiClient, authService, etc.)
│   │   ├── types/                # TypeScript domain models
│   │   ├── utils/                # Date, currency, cn utilities
│   │   ├── validations/          # Zod validation schemas
│   │   ├── App.tsx               # Main routing & protected route setup
│   │   ├── main.tsx              # React DOM entrypoint
│   │   └── index.css             # Light-mode design system & Tailwind CSS
│   ├── public/                   # Static assets & favicon
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
├── backend/                      # Node.js + Express REST API Server
│   ├── src/
│   │   ├── config/               # Environment variables (PORT, JWT_SECRET, DATABASE_PATH)
│   │   ├── database/             # SQLite connection & schema initialization
│   │   ├── controllers/          # HTTP request handlers & response formatting
│   │   ├── services/             # Business logic & SQLite queries with user isolation
│   │   ├── routes/               # Modular Express API routers
│   │   ├── middleware/           # JWT auth token verification & error handler
│   │   ├── validators/           # Zod input schemas for query and body
│   │   ├── types/                # Backend domain interfaces & Express request extensions
│   │   ├── utils/                # Standardized response helpers
│   │   ├── app.ts                # Express app configuration & middleware
│   │   └── server.ts             # Server entrypoint listening on PORT 5000
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── database/                     # Consolidated Database Definitions
│   ├── personal-control-center.db# Local SQLite database file (created automatically)
│   ├── schema.sql                # Complete SQLite schema (tables, foreign keys, indexes)
│   └── seed.sql                  # Seed data template
├── .env.example                  # Root environment variable template
└── README.md
```

---

## Getting Started

### 1. Database Initialization
The SQLite database at `database/personal-control-center.db` is created automatically whenever the backend server starts. No separate database installation or server is required.

### 2. Backend Setup
1. Open a terminal in `./backend`:
   ```bash
   cd backend
   npm install
   ```
2. Configure `backend/.env` (from `backend/.env.example`):
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   DATABASE_PATH=../database/personal-control-center.db
   JWT_SECRET=personal-control-center-jwt-secret-key-32chars
   ```
3. Start the Express server:
   ```bash
   npm run dev
   ```
   The backend will start on `http://localhost:5000`. Test health: `http://localhost:5000/health`.

### 3. Frontend Setup
1. Open a terminal in `./frontend`:
   ```bash
   cd frontend
   npm install
   ```
2. Configure `frontend/.env` (from `frontend/.env.example`):
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_APP_NAME="Personal Control Center"
   VITE_DEFAULT_CURRENCY=USD
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173` (or `http://localhost:3000`).

---

## API Endpoints Reference

All endpoints are prefixed with `/api` and require an `Authorization: Bearer <jwt_token>` header or `auth_token` cookie (except public auth endpoints).

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/health` | Server uptime & status check |
| **Auth** | `POST` | `/api/auth/register` | Register new user in SQLite (bcrypt hashed) |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & issue token / cookie |
| **Auth** | `POST` | `/api/auth/logout` | Revoke session & clear auth cookie |
| **Auth** | `POST` | `/api/auth/reset-password` | Local password reset mechanism |
| **Auth** | `GET` | `/api/auth/me` | Retrieve authenticated user, profile, & settings |
| **Expenses** | `GET` | `/api/expenses` | List expenses (with category join & filters) |
| **Expenses** | `GET` | `/api/expenses/:id` | Get expense by ID |
| **Expenses** | `POST` | `/api/expenses` | Create a new expense entry |
| **Expenses** | `PUT` | `/api/expenses/:id` | Update an existing expense |
| **Expenses** | `DELETE` | `/api/expenses/:id` | Delete an expense |
| **Expenses** | `GET` | `/api/expenses/categories` | List expense categories |
| **Expenses** | `POST` | `/api/expenses/categories` | Create a custom category |
| **Income** | `GET` | `/api/income` | List income records |
| **Income** | `GET` | `/api/income/:id` | Get income record by ID |
| **Income** | `POST` | `/api/income` | Record new income inflow |
| **Income** | `PUT` | `/api/income/:id` | Update an income entry |
| **Income** | `DELETE` | `/api/income/:id` | Delete an income entry |
| **Income** | `GET` | `/api/income/sources` | List income sources |
| **Income** | `POST` | `/api/income/sources` | Create a new income channel |
| **Budgets** | `GET` | `/api/budgets` | List budgets with real spending calculations |
| **Budgets** | `GET` | `/api/budgets/:id` | Get budget by ID |
| **Budgets** | `POST` | `/api/budgets` | Create a budget limit envelope |
| **Budgets** | `PUT` | `/api/budgets/:id` | Update budget limits |
| **Budgets** | `DELETE` | `/api/budgets/:id` | Delete a budget envelope |
| **Tasks** | `GET` | `/api/tasks` | List tasks (supports status/project filters) |
| **Tasks** | `GET` | `/api/tasks/:id` | Get task by ID |
| **Tasks** | `POST` | `/api/tasks` | Create a task |
| **Tasks** | `PUT` | `/api/tasks/:id` | Update task or status |
| **Tasks** | `DELETE` | `/api/tasks/:id` | Delete task |
| **Projects** | `GET` | `/api/projects` | List projects with calculated progress % |
| **Projects** | `GET` | `/api/projects/:id` | Get project by ID |
| **Projects** | `POST` | `/api/projects` | Create a project |
| **Projects** | `PUT` | `/api/projects/:id` | Update project metadata |
| **Projects** | `DELETE` | `/api/projects/:id` | Delete project |
| **Goals** | `GET` | `/api/goals` | List goals & calculated progress |
| **Goals** | `GET` | `/api/goals/:id` | Get goal by ID |
| **Goals** | `POST` | `/api/goals` | Create a goal |
| **Goals** | `PUT` | `/api/goals/:id` | Update goal |
| **Goals** | `POST` | `/api/goals/:id/increment` | Increment goal current value |
| **Goals** | `DELETE` | `/api/goals/:id` | Delete goal |
| **Analytics** | `GET` | `/api/analytics` | Aggregated dashboard metrics |
| **Analytics** | `GET` | `/api/analytics/dashboard` | Dashboard metrics (with recent items) |
| **Analytics** | `GET` | `/api/analytics/summary` | Financial & productivity summary |
| **Analytics** | `GET` | `/api/analytics/expenses` | Expense category analytics |
| **Analytics** | `GET` | `/api/analytics/income` | Income source analytics |
| **Settings** | `GET` | `/api/settings` | Retrieve user preferences & profile |
| **Settings** | `PUT` | `/api/settings` | Save personal settings & profile |
| **Settings** | `GET` | `/api/settings/export` | Download complete JSON backup |

---

## Security & User Data Isolation

- **Password Hashing**: All passwords hashed using `bcrypt` (10 salt rounds). Plaintext passwords are never stored.
- **Token Verification**: Express authentication middleware (`auth.middleware.ts`) verifies the JWT on every protected route.
- **Strict User Isolation**: Every database query filters by `user_id = authenticatedUser.id`. Users can never read or mutate records belonging to other users.
- **Local Privacy**: All personal financial and task data resides exclusively in your local SQLite database file (`database/personal-control-center.db`).
#   S e l f _ T r a c k  
 