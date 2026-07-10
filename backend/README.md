# TOPNET CRM — Backend API

Spring Boot 3.5 API for the **TOPNET CRM demonstration application** — simulates an enterprise production system for APM platform discovery. Business logic is simple; structure and observability follow enterprise conventions.

## Stack

- Java 21 · Spring Boot 3.5 · Maven
- PostgreSQL 17 · Spring Data JPA · Flyway
- Spring Security · JWT · Validation · Actuator · OpenAPI

## Package Structure

```
com.topnet.crm
├── authentication/   controller · service · dto
├── user/             controller · service · repository · entity · dto · mapper
├── customer/         controller · service · repository · entity · dto · mapper
├── ticket/           controller · service · repository · entity · dto · mapper
├── dashboard/        controller · service · dto
├── profile/          controller · service · dto
├── apm/              APM discovery · ApplicationInfoController
├── security/         JWT · SecurityFilterChain · UserDetailsService
├── config/           OpenAPI · JPA Auditing · DataInitializer
├── exception/        BusinessException · GlobalExceptionHandler
├── validation/       Custom constraints
└── common/           BaseEntity · shared DTOs · utilities
```

## Run

```bash
# With PostgreSQL (Docker)
docker compose up postgres -d

# Start API
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

## Default Admin

| Email | Password |
|-------|----------|
| `admin@topnet.com` | `Admin@123` |

## API Endpoints

| Module | Method | Path | Access |
|--------|--------|------|--------|
| **Auth** | POST | `/api/v1/auth/login` | Public |
| | POST | `/api/v1/auth/register` | Public |
| | GET | `/api/v1/auth/me` | Authenticated |
| **Users** | GET | `/api/v1/users` | Admin, Manager |
| | GET | `/api/v1/users/{id}` | Admin, Manager |
| | POST | `/api/v1/users` | Admin, Manager |
| | PUT | `/api/v1/users/{id}` | Admin, Manager |
| | DELETE | `/api/v1/users/{id}` | Admin, Manager |
| **Customers** | GET | `/api/v1/customers` | Authenticated |
| | GET | `/api/v1/customers/{id}` | Authenticated |
| | POST | `/api/v1/customers` | Authenticated |
| | PUT | `/api/v1/customers/{id}` | Authenticated |
| | DELETE | `/api/v1/customers/{id}` | Authenticated |
| **Tickets** | GET | `/api/v1/tickets` | Authenticated |
| | GET | `/api/v1/tickets/{id}` | Authenticated |
| | POST | `/api/v1/tickets` | Authenticated |
| | PUT | `/api/v1/tickets/{id}` | Authenticated |
| | PATCH | `/api/v1/tickets/{id}/status` | Authenticated |
| | DELETE | `/api/v1/tickets/{id}` | Authenticated |
| **Dashboard** | GET | `/api/v1/dashboard/stats` | Authenticated |
| **Profile** | GET | `/api/v1/profile` | Authenticated |
| | PUT | `/api/v1/profile` | Authenticated |
| | POST | `/api/v1/profile/change-password` | Authenticated |

## Observability & APM Discovery

| Endpoint | Description |
|----------|-------------|
| `GET /actuator/health` | Health + DB status |
| `GET /actuator/info` | Metadata for APM platforms |
| `GET /actuator/metrics` | Micrometer metrics |
| `GET /application/info` | Consolidated discovery payload |
| `GET /swagger-ui.html` | Swagger UI |
| `GET /v3/api-docs` | OpenAPI spec |

```bash
# Shell discovery (in container)
apm-discover.sh
```

## Roles

| Role | Description |
|------|-------------|
| `ROLE_ADMIN` | Full system access |
| `ROLE_MANAGER` | User management + CRM operations |
| `ROLE_AGENT` | Standard support agent |
