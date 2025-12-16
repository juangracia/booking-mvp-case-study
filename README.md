# Booking System MVP – From Messy Spec to Working Product

A portfolio case study demonstrating end-to-end delivery of a booking system, from an ambiguous business request to a fully functional MVP.

## Table of Contents

1. [What This Project Is](#what-this-project-is)
2. [Who This Is For](#who-this-is-for)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [Architecture](#architecture)
6. [Getting Started](#getting-started)
7. [Configuration](#configuration)
8. [Demo Credentials](#demo-credentials)
9. [API Documentation](#api-documentation)
10. [Overlap Prevention](#overlap-prevention)
11. [Testing Strategy](#testing-strategy)
12. [Future Improvements](#future-improvements)
13. [Verification Checklist](#verification-checklist)
14. [License](#license)

---

## What This Project Is

This repository demonstrates how to take a vague business requirement and deliver a working product:

1. **Start**: A one-sentence request: *"We need a booking system..."*
2. **Clarify**: Transform ambiguity into structured requirements
3. **Design**: Make architectural decisions with documented tradeoffs
4. **Build**: Implement a working full-stack application
5. **Ship**: Deploy locally with Docker Compose

The goal is to show professional software development practices, clear communication, and responsible delivery.

## Who This Is For

- **Hiring managers** evaluating full-stack engineering capabilities
- **Developers** looking for a reference implementation of Spring Boot + Next.js
- **Teams** seeking examples of documentation-first development

## Features

### User Features
- Self-registration and JWT-based authentication
- Browse active resources
- Check availability by date
- Create bookings with start time, end time, and notes
- View and cancel personal bookings

### Admin Features
- Create, edit, and disable resources
- View all bookings with filters (by resource, date range)
- Cancel any booking

### Technical Features
- Overlap prevention at service and database layers
- Maximum 8-hour booking duration
- Consistent JSON error responses
- OpenAPI/Swagger documentation
- Seed data for demo

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Java 17 | Runtime |
| Spring Boot 3.2 | Framework |
| Spring Security | JWT Authentication |
| Spring Data JPA | Data Access |
| Flyway | Database Migrations |
| PostgreSQL 16 | Database |
| JUnit 5 | Testing |

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14 | React Framework |
| TypeScript | Type Safety |
| Tailwind CSS | Styling |
| Axios | HTTP Client |

### DevOps
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Local Orchestration |
| GitHub Actions | CI/CD |
| Playwright | E2E Testing |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│                      Port: 13000                             │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/REST
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Spring Boot)                     │
│                      Port: 18080                             │
│  ┌─────────────┬─────────────┬─────────────┐               │
│  │    Auth     │  Resources  │  Bookings   │               │
│  │ Controller  │ Controller  │ Controller  │               │
│  └──────┬──────┴──────┬──────┴──────┬──────┘               │
│         │             │             │                       │
│  ┌──────▼─────────────▼─────────────▼──────┐               │
│  │           Service Layer                  │               │
│  │  • Business logic                        │               │
│  │  • Overlap prevention                    │               │
│  │  • Transaction management                │               │
│  └──────────────────┬───────────────────────┘               │
│                     │                                        │
│  ┌──────────────────▼───────────────────────┐               │
│  │           JPA Repositories               │               │
│  └──────────────────┬───────────────────────┘               │
└─────────────────────┼───────────────────────────────────────┘
                      │ JDBC
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                         │
│                      Port: 15432                             │
│  ┌──────────┬────────────┬────────────┐                    │
│  │  users   │  resources │  bookings  │                    │
│  └──────────┴────────────┴────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/juangracia/booking-mvp-case-study.git
cd booking-mvp-case-study

# Start all services
docker compose up -d

# Wait for services to be healthy (about 30 seconds)
docker compose ps

# Access the application
# Frontend: http://localhost:13000
# Backend API: http://localhost:18080
# Swagger UI: http://localhost:18080/swagger-ui.html
```

### Development Setup

```bash
# Backend (requires Java 21)
cd backend
./mvnw spring-boot:run

# Frontend (requires Node.js 20+)
cd frontend
npm install
npm run dev

# Database (using Docker)
docker compose up postgres -d
```

### Useful Commands

```bash
# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove data
docker compose down -v

# Run backend tests
cd backend && ./mvnw test

# Run frontend lint
cd frontend && npm run lint

# Run E2E tests (requires services running)
cd e2e && npm install && npm test
```

## Configuration

### Default Ports

| Service | Default Port | Environment Variable |
|---------|--------------|---------------------|
| PostgreSQL | 15432 | `DB_PORT` |
| Backend API | 18080 | `BACKEND_PORT` |
| Frontend | 13000 | `FRONTEND_PORT` |

### Customizing Ports

Create a `.env` file in the project root:

```bash
# Copy example and modify
cp .env.example .env

# Edit .env with your preferred ports
DB_PORT=15432
BACKEND_PORT=18080
FRONTEND_PORT=13000
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | localhost | Database host |
| `DB_PORT` | 15432 | Database port |
| `DB_NAME` | booking | Database name |
| `DB_USER` | booking | Database user |
| `DB_PASSWORD` | booking | Database password |
| `JWT_SECRET` | (see .env.example) | JWT signing secret |
| `JWT_EXPIRATION_MS` | 86400000 | JWT expiration (24h) |
| `NEXT_PUBLIC_API_URL` | http://localhost:18080 | Backend URL for frontend |

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| User | user@example.com | user123 |

## API Documentation

### Swagger UI
Access interactive API documentation at:
```
http://localhost:18080/swagger-ui.html
```

### OpenAPI Spec
Raw OpenAPI specification available at:
```
http://localhost:18080/api-docs
```

### Key Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Get JWT token |
| GET | /api/resources | Yes | List active resources |
| GET | /api/resources/{id}/availability | Yes | Get availability |
| POST | /api/bookings | Yes | Create booking |
| DELETE | /api/bookings/{id} | Yes | Cancel booking |
| GET | /api/admin/bookings | Admin | View all bookings |

## Overlap Prevention

The system prevents double-booking using a two-layer approach:

### 1. Service Layer Check (Fast)
Before creating a booking, the service queries for existing overlapping bookings:
```sql
SELECT COUNT(*) FROM bookings
WHERE resource_id = ?
AND status = 'ACTIVE'
AND start_at < ?  -- new end time
AND end_at > ?    -- new start time
```

### 2. Database Constraint (Guaranteed)
PostgreSQL exclusion constraint ensures consistency even under concurrent requests:
```sql
ALTER TABLE bookings ADD CONSTRAINT exclude_overlapping_bookings
    EXCLUDE USING gist (
        resource_id WITH =,
        tstzrange(start_at, end_at) WITH &&
    ) WHERE (status = 'ACTIVE');
```

### Why Both?
- **Service check**: Fast feedback, clear error messages
- **Database constraint**: Catches race conditions, guarantees data integrity

## Testing Strategy

### Backend Tests
- **Unit tests**: Service layer logic (BookingServiceTest, AuthServiceTest)
- **Controller tests**: API endpoint validation
- **Integration tests**: Full request/response cycles

```bash
cd backend && ./mvnw test
```

### Frontend
- **Linting**: ESLint with Next.js config
- **Type checking**: TypeScript strict mode

```bash
cd frontend && npm run lint
```

### E2E Tests
Playwright tests covering critical user flows:
- Login and registration
- Resource browsing
- Booking creation
- Booking cancellation
- Overlap prevention
- Admin operations

```bash
cd e2e && npm install && npm test
```

## Future Improvements

| Feature | Priority | Complexity |
|---------|----------|------------|
| Email notifications | High | Medium |
| Password reset | High | Low |
| Recurring bookings | Medium | High |
| Payment integration | Medium | High |
| Calendar export (iCal) | Low | Low |
| Rate limiting | Medium | Low |
| Audit logging | Medium | Medium |

## Verification Checklist

Before deployment, verify:

- [ ] `docker compose up` starts all services successfully
- [ ] PostgreSQL is accessible on port 15432
- [ ] Backend API responds at http://localhost:18080/actuator/health
- [ ] Swagger UI loads at http://localhost:18080/swagger-ui.html
- [ ] Frontend loads at http://localhost:13000
- [ ] Can login as admin (admin@example.com / admin123)
- [ ] Can login as user (user@example.com / user123)
- [ ] Resources list displays 3 seeded resources
- [ ] Can create a booking for a future time slot
- [ ] Overlap prevention rejects conflicting bookings
- [ ] Can cancel own booking
- [ ] Admin can view all bookings
- [ ] Admin can cancel any booking
- [ ] Admin can create/edit resources
- [ ] Backend tests pass (`./mvnw test`)
- [ ] E2E tests pass (`npm test` in e2e/)

## Documentation

| Document | Description |
|----------|-------------|
| [docs/initial-idea.md](docs/initial-idea.md) | Original messy spec |
| [docs/clarified-requirements.md](docs/clarified-requirements.md) | Structured requirements |
| [docs/architecture.md](docs/architecture.md) | Technical architecture |
| [docs/decisions-and-tradeoffs.md](docs/decisions-and-tradeoffs.md) | Design decisions |
| [docs/ai-workflow.md](docs/ai-workflow.md) | AI-assisted development |

## License

MIT License - see [LICENSE](LICENSE) for details.
