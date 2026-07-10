# TOPNET CRM

**Demonstration application** that simulates a real enterprise production system for an external **Application Portfolio Management (APM)** platform.

This is not a full CRM product. Business logic is intentionally simple. The focus is on professional structure, deployment, UI, and observability — the signals an APM tool expects from portfolio software.

## Principles

- **Look real** — enterprise folder layout, professional UI, JWT auth, PostgreSQL
- **Stay simple** — CRUD, search, dashboards; no unnecessary domain complexity
- **Deploy easily** — `docker compose up -d`
- **Monitor easily** — Actuator, `/application/info`, OpenAPI, Docker labels

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 20, TypeScript, SCSS |
| Backend | Spring Boot 3.5, Java 21 |
| Database | PostgreSQL 17 |
| Security | Spring Security, JWT |
| API Docs | SpringDoc OpenAPI (Swagger) |
| Observability | Spring Boot Actuator |
| Infrastructure | Docker, Docker Compose, Nginx |

## Quick Start (Docker)

Production-ready stack: **PostgreSQL**, **Spring Boot**, **Angular**, **Nginx** reverse proxy.

```bash
# 1. Optional: copy and customize environment variables
cp .env.example .env

# 2. Start everything (builds images on first run)
docker compose up -d

# 3. Verify all services are healthy
docker compose ps
```

### Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Application** | http://localhost | Main entry (Nginx → Angular + API) |
| Frontend (direct) | http://localhost:4200 | Angular SPA container |
| Backend API | http://localhost:8080/api/v1 | Spring Boot REST API |
| Swagger UI | http://localhost/swagger-ui.html | API documentation (via Nginx) |
| Health (Nginx) | http://localhost/health | Reverse proxy health |
| Health (Backend) | http://localhost:8080/actuator/health | Spring Actuator |
| PostgreSQL | localhost:5432 | Database (user: `topnet`) |

### Docker Commands

```bash
docker compose up -d              # Start all services
docker compose down               # Stop and remove containers
docker compose down -v            # Stop and remove volumes (resets DB)
docker compose logs -f backend    # Tail backend logs
docker compose ps                 # Service status + health
docker compose up -d --build      # Rebuild images after code changes
```

### Architecture

```
                    ┌─────────────┐
   Browser ────────►│   Nginx:80  │◄── Main entry point
                    └──────┬──────┘
              ┌────────────┼────────────┐
              ▼            ▼            │
        ┌──────────┐ ┌──────────┐      │
        │ Frontend │ │ Backend  │      │
        │  :80     │ │  :8080   │      │
        └──────────┘ └────┬─────┘      │
                          ▼            │
                    ┌──────────┐       │
                    │ Postgres │       │
                    │  :5432   │       │
                    └──────────┘       │
```

### Environment Variables

See [`.env.example`](./.env.example) for all configurable variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_DB` | `topnet_crm` | Database name |
| `POSTGRES_USER` | `topnet` | Database user |
| `POSTGRES_PASSWORD` | `topnet123` | Database password |
| `JWT_SECRET` | *(see .env.example)* | JWT signing key — **change in production** |
| `NGINX_PORT` | `80` | Public HTTP port |
| `NGINX_SSL_PORT` | `443` | Public HTTPS port |
| `NGINX_SSL_ENABLED` | `false` | Enable TLS (requires certs in `docker/nginx/ssl/`) |
| `BACKEND_PORT` | `8080` | Direct API port |
| `FRONTEND_PORT` | `4200` | Direct frontend port |
| `JAVA_OPTS` | container-aware JVM | JVM tuning |

### Volumes

| Volume | Purpose |
|--------|---------|
| `postgres_data` | Persistent PostgreSQL data |
| `nginx_logs` | Nginx access/error logs |
| `nginx_cache` | Proxy cache for static assets |

### Nginx Reverse Proxy

Production config lives in [`docker/nginx/`](./docker/nginx/):

| Feature | Implementation |
|---------|----------------|
| **Reverse proxy** | `/` → Angular, `/api/` → Spring Boot |
| **Compression** | Gzip level 5 for text, JS, CSS, JSON, SVG, fonts |
| **Caching** | 7-day proxy cache for static assets; `no-store` for API |
| **Security headers** | CSP, X-Frame-Options, HSTS (HTTPS), Permissions-Policy |
| **Rate limiting** | 30 req/s API, 50 req/s general |
| **HTTPS ready** | TLS 1.2/1.3, HTTP/2, auto HTTP→HTTPS redirect |

**Enable HTTPS:**

```bash
cd docker/nginx/ssl
./generate-self-signed.sh localhost   # or use real certs

# In .env:
NGINX_SSL_ENABLED=true

docker compose up -d --build nginx
```

| URL | Description |
|-----|-------------|
| http://localhost | HTTP (redirects to HTTPS when SSL enabled) |
| https://localhost | HTTPS (when `NGINX_SSL_ENABLED=true`) |

### Health Checks

All services include Docker health checks with `depends_on: condition: service_healthy` startup ordering:

1. **PostgreSQL** — `pg_isready`
2. **Backend** — `/actuator/health/readiness`
3. **Frontend** — `/health`
4. **Nginx** — `/health`

### Default Credentials

- **Email:** `admin@topnet.com`
- **Password:** `Admin@123`

## Local Development

### Backend

```bash
cd backend
# Requires Java 21 and Maven
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Ensure PostgreSQL is running (or use Docker for postgres only):

```bash
docker compose up postgres -d
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Open http://localhost:4200

## API Overview

| Module | Base Path |
|--------|-----------|
| Auth | `/api/v1/auth` |
| Users | `/api/v1/users` |
| Customers | `/api/v1/customers` |
| Tickets | `/api/v1/tickets` |
| Dashboard | `/api/v1/dashboard` |
| Profile | `/api/v1/profile` |

## APM Discovery Endpoints

Public REST endpoints for external Application Portfolio Management platforms (no authentication required):

| Endpoint | Description |
|----------|-------------|
| `GET /actuator/health` | Health + database component status |
| `GET /actuator/info` | Application metadata (name, version, environment, build, Java, Spring, DB) |
| `GET /actuator/metrics` | Micrometer metrics index |
| `GET /application/info` | Consolidated APM discovery payload |
| `GET /v3/api-docs` | OpenAPI catalog |

### Example — Application Info

```bash
curl http://localhost/application/info
```

```json
{
  "applicationName": "TOPNET CRM",
  "version": "1.0.0-SNAPSHOT",
  "environment": "docker",
  "buildTime": "2026-07-10T20:00:00Z",
  "javaVersion": "21.0.x",
  "springVersion": "6.2.x",
  "databaseStatus": "UP",
  "dockerReady": true,
  "discovery": {
    "health": "http://localhost:8080/actuator/health",
    "info": "http://localhost:8080/actuator/info",
    "metrics": "http://localhost:8080/actuator/metrics",
    "applicationInfo": "http://localhost:8080/application/info",
    "openapi": "http://localhost:8080/v3/api-docs"
  }
}
```

### SSH / Shell Discovery

```bash
# Host machine (via Nginx)
./scripts/apm-discover.sh

# Inside backend container
docker exec topnet-backend apm-discover.sh

# Source endpoint URLs
source docker/apm/discovery-endpoints.env
echo $TOPNET_APM_HEALTH_URL
```

Docker labels on `topnet-backend`: `apm.topnet.discovery=true`, `apm.topnet.health.url`, etc.

## Project Structure

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full enterprise architecture documentation.

## License

Proprietary — TOPNET Enterprise
