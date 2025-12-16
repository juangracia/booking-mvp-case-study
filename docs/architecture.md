# Architecture

This document describes the technical architecture of the Booking System MVP.

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Component Overview](#component-overview)
3. [Technology Stack](#technology-stack)
4. [Data Model](#data-model)
5. [API Design](#api-design)
6. [Security Architecture](#security-architecture)
7. [Key Flows](#key-flows)
8. [Overlap Prevention Strategy](#overlap-prevention-strategy)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Client Layer                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│    ┌─────────────────────┐         ┌─────────────────────┐          │
│    │   Web Browser       │         │   API Clients       │          │
│    │   (Next.js App)     │         │   (Swagger/Postman) │          │
│    └─────────┬───────────┘         └─────────┬───────────┘          │
│              │                               │                       │
└──────────────┼───────────────────────────────┼───────────────────────┘
               │           HTTP/REST           │
               └───────────────┬───────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────┐
│                         API Gateway                                  │
├──────────────────────────────┼──────────────────────────────────────┤
│                              ▼                                       │
│    ┌─────────────────────────────────────────────────────────┐      │
│    │              Spring Boot Application                     │      │
│    │                    (Port 18080)                          │      │
│    ├─────────────────────────────────────────────────────────┤      │
│    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │      │
│    │  │   Auth      │  │  Resource   │  │   Booking   │     │      │
│    │  │ Controller  │  │ Controller  │  │ Controller  │     │      │
│    │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │      │
│    │         │                │                │             │      │
│    │  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐     │      │
│    │  │   Auth      │  │  Resource   │  │   Booking   │     │      │
│    │  │  Service    │  │  Service    │  │  Service    │     │      │
│    │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │      │
│    │         │                │                │             │      │
│    │  ┌──────▼──────────────────────────────────▼──────┐    │      │
│    │  │              JPA Repositories                   │    │      │
│    │  └──────────────────────┬──────────────────────────┘    │      │
│    └─────────────────────────┼───────────────────────────────┘      │
│                              │                                       │
└──────────────────────────────┼───────────────────────────────────────┘
                               │ JDBC
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Data Layer                                   │
├─────────────────────────────────────────────────────────────────────┤
│    ┌─────────────────────────────────────────────────────────┐      │
│    │                    PostgreSQL                            │      │
│    │                    (Port 15432)                          │      │
│    │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │      │
│    │  │  users   │  │resources │  │ bookings │              │      │
│    │  └──────────┘  └──────────┘  └──────────┘              │      │
│    └─────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Overview

### Frontend (Next.js)

| Component | Responsibility |
|-----------|----------------|
| Pages | Route-based page components |
| Components | Reusable UI components |
| Hooks | Custom React hooks for API calls |
| Context | Auth state management |
| Services | API client functions |

### Backend (Spring Boot)

| Layer | Components | Responsibility |
|-------|------------|----------------|
| Controller | REST endpoints | Request handling, validation, response mapping |
| Service | Business logic | Core operations, transaction management |
| Repository | JPA interfaces | Data access abstraction |
| Security | JWT filter, config | Authentication and authorization |
| DTO | Request/Response objects | API contract definition |
| Entity | JPA entities | Database mapping |

---

## Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 17 | Runtime |
| Spring Boot | 3.2.x | Framework |
| Spring Security | 6.x | Authentication/Authorization |
| Spring Data JPA | 3.2.x | Data access |
| Hibernate | 6.x | ORM |
| Flyway | 10.x | Database migrations |
| PostgreSQL | 16 | Database |
| JJWT | 0.12.x | JWT handling |
| JUnit 5 | 5.10.x | Testing |
| Testcontainers | 1.19.x | Integration testing |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling |
| Axios | 1.x | HTTP client |

### DevOps
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Local orchestration |
| GitHub Actions | CI/CD |

---

## Data Model

### Entity Relationship Diagram

```
┌────────────────────────────┐
│          users             │
├────────────────────────────┤
│ id          UUID      PK   │
│ email       VARCHAR   UQ   │
│ password    VARCHAR        │
│ role        VARCHAR        │
│ created_at  TIMESTAMP      │
│ updated_at  TIMESTAMP      │
└────────────────────────────┘
            │
            │ 1:N
            ▼
┌────────────────────────────┐         ┌────────────────────────────┐
│         bookings           │         │        resources           │
├────────────────────────────┤         ├────────────────────────────┤
│ id          UUID      PK   │ N:1     │ id          UUID      PK   │
│ user_id     UUID      FK   │◄───────►│ name        VARCHAR        │
│ resource_id UUID      FK   │         │ description TEXT           │
│ start_at    TIMESTAMP      │         │ active      BOOLEAN        │
│ end_at      TIMESTAMP      │         │ created_at  TIMESTAMP      │
│ status      VARCHAR        │         │ updated_at  TIMESTAMP      │
│ notes       TEXT           │         └────────────────────────────┘
│ created_at  TIMESTAMP      │
│ updated_at  TIMESTAMP      │
└────────────────────────────┘
```

### Database Constraints

```sql
-- Users
ALTER TABLE users ADD CONSTRAINT uk_users_email UNIQUE (email);

-- Bookings: Prevent overlapping active bookings
ALTER TABLE bookings ADD CONSTRAINT exclude_overlapping_bookings
    EXCLUDE USING gist (
        resource_id WITH =,
        tsrange(start_at, end_at) WITH &&
    ) WHERE (status = 'ACTIVE');

-- Bookings: Ensure valid time range
ALTER TABLE bookings ADD CONSTRAINT chk_booking_time_range
    CHECK (start_at < end_at);
```

---

## API Design

### Base URL
```
http://localhost:18080/api
```

### Endpoints Overview

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /auth/register | No | - | Register new user |
| POST | /auth/login | No | - | Authenticate user |
| GET | /resources | Yes | USER | List active resources |
| GET | /resources/{id} | Yes | USER | Get resource details |
| GET | /resources/{id}/availability | Yes | USER | Get availability for date |
| POST | /admin/resources | Yes | ADMIN | Create resource |
| PUT | /admin/resources/{id} | Yes | ADMIN | Update resource |
| GET | /bookings | Yes | USER | Get user's bookings |
| POST | /bookings | Yes | USER | Create booking |
| DELETE | /bookings/{id} | Yes | USER | Cancel own booking |
| GET | /admin/bookings | Yes | ADMIN | Get all bookings |
| DELETE | /admin/bookings/{id} | Yes | ADMIN | Cancel any booking |

### Error Response Format

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/bookings",
  "errorCode": "BOOKING_OVERLAP",
  "message": "The requested time slot overlaps with an existing booking"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid request data |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| BOOKING_OVERLAP | 409 | Booking time conflict |
| INVALID_TIME_RANGE | 400 | End time before start time |
| RESOURCE_INACTIVE | 400 | Cannot book inactive resource |

---

## Security Architecture

### Authentication Flow

```
┌─────────┐      ┌─────────────┐      ┌─────────────┐
│ Client  │      │   Backend   │      │  Database   │
└────┬────┘      └──────┬──────┘      └──────┬──────┘
     │                  │                    │
     │ POST /auth/login │                    │
     │ {email,password} │                    │
     │─────────────────►│                    │
     │                  │  Find user by email│
     │                  │───────────────────►│
     │                  │◄───────────────────│
     │                  │                    │
     │                  │ Verify BCrypt hash │
     │                  │                    │
     │                  │ Generate JWT       │
     │  {token, user}   │                    │
     │◄─────────────────│                    │
     │                  │                    │
     │ GET /bookings    │                    │
     │ Auth: Bearer JWT │                    │
     │─────────────────►│                    │
     │                  │ Validate JWT       │
     │                  │ Extract user/role  │
     │                  │───────────────────►│
     │                  │◄───────────────────│
     │  {bookings}      │                    │
     │◄─────────────────│                    │
```

### JWT Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "USER",
  "iat": 1705312200,
  "exp": 1705398600
}
```

### Security Configuration

- Password hashing: BCrypt with strength 12
- JWT expiration: 24 hours
- CORS: Configured for frontend origin
- CSRF: Disabled (stateless API)

---

## Key Flows

### Create Booking Flow

```
┌────────┐   ┌────────────┐   ┌─────────────┐   ┌───────────┐   ┌──────────┐
│ Client │   │ Controller │   │   Service   │   │ Repository│   │ Database │
└───┬────┘   └─────┬──────┘   └──────┬──────┘   └─────┬─────┘   └────┬─────┘
    │              │                 │                │              │
    │ POST /bookings                 │                │              │
    │ {resourceId, │                 │                │              │
    │  startAt,    │                 │                │              │
    │  endAt}      │                 │                │              │
    │─────────────►│                 │                │              │
    │              │ createBooking() │                │              │
    │              │────────────────►│                │              │
    │              │                 │                │              │
    │              │                 │ @Transactional │              │
    │              │                 │                │              │
    │              │                 │ validate time  │              │
    │              │                 │ range          │              │
    │              │                 │                │              │
    │              │                 │ findResource() │              │
    │              │                 │───────────────►│              │
    │              │                 │◄───────────────│              │
    │              │                 │                │              │
    │              │                 │ check active   │              │
    │              │                 │                │              │
    │              │                 │ checkOverlap() │              │
    │              │                 │───────────────►│              │
    │              │                 │                │──────────────►
    │              │                 │                │◄──────────────
    │              │                 │◄───────────────│              │
    │              │                 │                │              │
    │              │                 │ save()         │              │
    │              │                 │───────────────►│              │
    │              │                 │                │──────────────►
    │              │                 │                │◄──────────────
    │              │                 │◄───────────────│              │
    │              │◄────────────────│                │              │
    │◄─────────────│                 │                │              │
    │ 201 Created  │                 │                │              │
```

---

## Overlap Prevention Strategy

### Two-Layer Defense

1. **Service Layer Check** (Optimistic)
   - Fast check before insert
   - Query: `SELECT COUNT(*) FROM bookings WHERE resource_id = ? AND status = 'ACTIVE' AND start_at < ? AND end_at > ?`
   - Returns immediately if conflict found

2. **Database Constraint** (Pessimistic)
   - PostgreSQL exclusion constraint using GiST index
   - Guarantees consistency even under concurrent writes
   - Catches race conditions missed by service check

### Concurrency Handling

```
Thread 1                    Thread 2
────────                    ────────
Check overlap → None        Check overlap → None
Insert booking              Insert booking
DB constraint OK            DB constraint FAILS
Commit                      Rollback
SUCCESS                     Return BOOKING_OVERLAP error
```

### Why Both Layers?

| Check | Pros | Cons |
|-------|------|------|
| Service layer | Fast feedback, clear error messages | Race condition possible |
| DB constraint | Guaranteed consistency | Generic error, requires parsing |

Using both provides fast feedback for the common case and guaranteed consistency for edge cases.
