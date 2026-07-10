# TOPNET CRM — Architecture

> **Purpose:** Demonstration application that simulates a real enterprise production system for discovery by an external **Application Portfolio Management (APM)** platform.  
> **Not a product CRM** — business logic is intentionally simple; structure, deployment, and observability are production-grade.

---

## Design Principles

| Priority | Approach |
|----------|----------|
| APM discovery | Actuator, `/application/info`, OpenAPI, Docker labels |
| Professional appearance | Enterprise UI, consistent naming, realistic modules |
| Simple business logic | CRUD + search/filter; no workflow engines or integrations |
| Clean structure | Layered packages (backend), feature folders (frontend) |
| Easy deployment | `docker compose up -d` — PostgreSQL, API, SPA, Nginx |
| Avoid over-engineering | No event buses, CQRS, or microservices |

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 20, TypeScript, TailwindCSS, standalone components |
| Backend | Spring Boot 3.5, Java 21, Spring Data JPA |
| Database | PostgreSQL 17, Flyway migrations |
| Security | Spring Security, JWT |
| API docs | SpringDoc OpenAPI |
| Observability | Spring Boot Actuator, `/application/info` |
| Proxy | Nginx (reverse proxy, gzip, TLS-ready) |
| Runtime | Docker Compose |

---

## Repository Layout

```
topnet-crm/
├── README.md
├── ARCHITECTURE.md
├── docker-compose.yml
├── .env.example
│
├── docker/
│   ├── nginx/          # Reverse proxy (production config)
│   ├── postgres/init/  # DB bootstrap
│   └── apm/            # APM discovery env vars
│
├── scripts/
│   └── apm-discover.sh # Shell discovery for APM platforms
│
├── backend/            # Spring Boot API
└── frontend/           # Angular SPA
```

---

## Backend — Layered Modules

Each business area is a **vertical package** with a consistent layout:

```
{module}/
├── controller/     # REST API
├── service/        # Business logic (kept simple)
├── repository/     # Spring Data JPA
├── entity/         # JPA entities
├── dto/            # Request/response objects
└── mapper/         # Entity ↔ DTO mapping
```

Shared cross-cutting packages:

```
com.topnet.crm/
├── authentication/   # Login, register, JWT
├── user/             # User admin (Admin/Manager)
├── customer/         # Customer CRUD
├── ticket/           # Support tickets
├── dashboard/        # KPI aggregation
├── profile/          # Current user profile
├── apm/              # APM discovery endpoints
├── security/         # JWT filter, SecurityConfig
├── config/           # OpenAPI, JPA auditing, seed data
├── exception/        # Global error handling
├── validation/       # Custom validators
└── common/           # BaseEntity, PageResponse, utilities
```

### API Modules

| Module | Path | Scope |
|--------|------|-------|
| Auth | `/api/v1/auth` | Login, register, password reset |
| Users | `/api/v1/users` | Admin user management |
| Customers | `/api/v1/customers` | Customer CRUD, search, export |
| Tickets | `/api/v1/tickets` | Ticket CRUD, status, comments |
| Dashboard | `/api/v1/dashboard` | KPIs and recent activity |
| Profile | `/api/v1/profile` | Logged-in user settings |
| APM | `/application/info` | Discovery metadata |

### Persistence

- Flyway migrations in `backend/src/main/resources/db/migration/`
- JPA `validate` mode — schema owned by SQL migrations
- `BaseEntity` — `createdAt`, `updatedAt`, audit fields

---

## Frontend — Feature Architecture

```
src/app/
├── core/           # Auth, API client, guards, interceptors (singleton)
├── shared/         # Reusable UI components (table, modal, charts)
├── layout/         # Main shell, navbar, auth layout
└── features/       # Lazy-loaded feature areas
    ├── auth/
    ├── dashboard/
    ├── customers/
    ├── tickets/
    ├── profile/
    └── settings/
```

Each feature follows:

```
features/{name}/
├── data-access/
│   ├── models/
│   └── services/
├── pages/
└── {name}.routes.ts
```

---

## Deployment Topology

```
 Browser
    │
    ▼ :80 / :443
┌─────────┐
│  Nginx  │  Reverse proxy, compression, security headers
└────┬────┘
     ├──────────────────┐
     ▼                  ▼
┌──────────┐    ┌──────────────┐
│ Frontend │    │ Spring Boot  │
│ (Angular)│    │   :8080      │
└──────────┘    └──────┬───────┘
                       ▼
                ┌─────────────┐
                │ PostgreSQL  │
                └─────────────┘
```

**Start:** `docker compose up -d`

| Service | Role |
|---------|------|
| `postgres` | Primary datastore |
| `backend` | REST API + Actuator |
| `frontend` | Angular SPA (Nginx) |
| `nginx` | Public entry point |

---

## APM Discovery

Exposed without authentication for external platform scanning:

| Endpoint | Content |
|----------|---------|
| `GET /actuator/health` | Liveness, readiness, database status |
| `GET /actuator/info` | Application metadata |
| `GET /actuator/metrics` | Micrometer metrics |
| `GET /application/info` | Consolidated discovery payload |
| `GET /v3/api-docs` | Full API catalog |

Shell discovery: `./scripts/apm-discover.sh` or `docker exec topnet-backend apm-discover.sh`

---

## Environment Profiles

| Profile | Usage | Config |
|---------|-------|--------|
| `dev` | Local Maven run | `application-dev.yml` |
| `docker` | Docker Compose | `application-docker.yml` |
| `prod` | Production tuning | `application-prod.yml` |

---

## What We Deliberately Omit

To keep the demo realistic but maintainable:

- Multi-tenancy, billing, email gateways
- Workflow/BPM engines
- Microservices or message queues
- Full RBAC permission matrix
- Mobile apps or offline sync

These can be referenced in UI labels and API structure without implementation.

---

*TOPNET CRM — Enterprise IT demonstration application for APM portfolio discovery.*
