# TOPNET CRM — Angular Frontend

Enterprise-style SPA for the **TOPNET CRM demonstration application** (APM portfolio discovery). Professional UI with simple business flows — standalone components, signals, TailwindCSS, lazy-loaded features.
## Stack

- Angular 20 (standalone components)
- Signals for reactive state
- TailwindCSS 3 (dark mode via `class` strategy)
- Lazy-loaded routes
- JWT authentication against Spring Boot API

## Run

```bash
npm install
npm start
```

Open http://localhost:4200 (backend must run on http://localhost:8080)

**Login:** `admin@topnet.com` / `Admin@123`

## Build

```bash
npm run build
```

## Pages

| Route | Page |
|-------|------|
| `/login` | Authentication |
| `/dashboard` | CRM KPIs from `/api/v1/dashboard/stats` |
| `/customers` | Customer CRUD |
| `/tickets` | Ticket management |
| `/profile` | User profile & password |
| `/settings` | Theme, preferences, user admin |
| `/unauthorized` | 401 session expired |
| `/forbidden` | 403 access denied |
| `/**` | 404 not found |

## Architecture

```
src/app/
├── core/           Auth (signals), API, theme, guards, interceptors
├── shared/         Reusable UI components (button, card, modal, badge, etc.)
├── layout/         Main shell + auth layout
└── features/       auth, dashboard, customers, tickets, profile, settings, errors
```

## Reusable Components

- `app-button`, `app-badge`, `app-card`, `app-modal`
- `app-page-header`, `app-stat-card`, `app-data-table`
- `app-loading-spinner`, `app-empty-state`, `app-alert`
- `app-theme-toggle`

## Dark Mode

Toggle via header/settings. Persisted in `localStorage` (`topnet_crm_theme`).
