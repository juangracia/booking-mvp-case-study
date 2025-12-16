# Decisions and Tradeoffs

This document captures key technical and product decisions made during the development of the Booking System MVP, along with their rationale and tradeoffs.

## Table of Contents

1. [Technology Decisions](#technology-decisions)
2. [Architecture Decisions](#architecture-decisions)
3. [Feature Decisions](#feature-decisions)
4. [Deferred Items](#deferred-items)
5. [Known Risks](#known-risks)

---

## Technology Decisions

### TD-01: Spring Boot for Backend

**Decision:** Use Spring Boot 3 with Java 21 as the backend framework.

**Alternatives Considered:**
- Node.js/Express
- Go with Gin/Echo
- Python with FastAPI

**Rationale:**
- Strong typing and compile-time checks catch errors early
- Mature ecosystem with battle-tested libraries
- Excellent support for enterprise patterns (security, transactions, testing)
- Spring Security provides robust JWT and RBAC support
- Flyway integration for database migrations
- Testcontainers support for realistic integration tests

**Tradeoffs:**
- Heavier than Node.js or Go
- Longer startup time (acceptable for MVP)
- More verbose than Python/Node alternatives

---

### TD-02: PostgreSQL for Database

**Decision:** Use PostgreSQL as the primary database.

**Alternatives Considered:**
- MySQL/MariaDB
- MongoDB
- SQLite

**Rationale:**
- Excellent support for complex constraints (exclusion constraints for overlap prevention)
- GiST indexes for range queries
- Strong ACID compliance
- Wide cloud provider support
- Free and open source

**Tradeoffs:**
- Requires running a separate service (vs SQLite)
- More complex setup than embedded databases

---

### TD-03: JWT for Authentication

**Decision:** Use stateless JWT tokens for API authentication.

**Alternatives Considered:**
- Session-based auth with cookies
- OAuth2/OIDC
- API keys

**Rationale:**
- Stateless: no server-side session storage needed
- Easy to implement and debug
- Works well with REST APIs
- Self-contained user identity

**Tradeoffs:**
- Cannot invalidate tokens before expiry (acceptable for MVP)
- Token size larger than session ID
- Must secure secret key

**Mitigation:**
- Short token expiry (24h)
- Can add token blacklist in future if needed

---

### TD-04: Next.js for Frontend

**Decision:** Use Next.js with TypeScript for the web frontend.

**Alternatives Considered:**
- React + Vite
- Vue.js
- Plain HTML/CSS/JS

**Rationale:**
- TypeScript provides type safety with backend DTOs
- App Router provides clean page organization
- Built-in API routes if needed
- Good developer experience
- Easy deployment options

**Tradeoffs:**
- More complex than plain React
- SSR features not fully utilized in MVP

---

### TD-05: Tailwind CSS for Styling

**Decision:** Use Tailwind CSS for component styling.

**Alternatives Considered:**
- CSS Modules
- Styled Components
- Material UI
- Bootstrap

**Rationale:**
- Rapid prototyping with utility classes
- No context switching to separate CSS files
- Consistent design system
- Small production bundle (purges unused classes)

**Tradeoffs:**
- HTML can appear verbose
- Learning curve for utility-first approach

---

## Architecture Decisions

### AD-01: Monorepo Structure

**Decision:** Use a monorepo with `/backend`, `/frontend`, and `/docs` directories.

**Alternatives Considered:**
- Separate repositories
- Monorepo with shared packages (Turborepo/Nx)

**Rationale:**
- Simple to understand and navigate
- Single clone for entire project
- Easier to keep in sync
- Shared Docker Compose configuration

**Tradeoffs:**
- Less isolation between projects
- CI runs everything on any change (acceptable for MVP size)

---

### AD-02: Two-Layer Overlap Prevention

**Decision:** Implement booking overlap prevention at both service and database layers.

**Alternatives Considered:**
- Service layer only with pessimistic locking
- Database constraint only
- Distributed lock (Redis)

**Rationale:**
- Service check provides fast, friendly error messages
- Database constraint guarantees consistency under concurrency
- No additional infrastructure (Redis) needed
- Defense in depth

**Tradeoffs:**
- Slight code duplication between layers
- Must handle two different error types

---

### AD-03: Soft Delete for Resources

**Decision:** Resources are disabled rather than deleted.

**Alternatives Considered:**
- Hard delete with cascade
- Hard delete with orphan protection

**Rationale:**
- Preserves booking history
- Avoids foreign key issues
- Can restore resources if needed
- Consistent data for reporting

**Tradeoffs:**
- Inactive resources accumulate in database
- Must filter active resources in queries

---

### AD-04: Simple State Machine for Bookings

**Decision:** Bookings have only two states: ACTIVE and CANCELLED.

**Alternatives Considered:**
- PENDING → CONFIRMED → COMPLETED → CANCELLED
- State machine with more transitions

**Rationale:**
- Simplest model that meets requirements
- No need for approval workflow in MVP
- Easy to understand and test

**Tradeoffs:**
- No "completed" state for past bookings
- Cannot distinguish between user-cancelled and admin-cancelled

---

### AD-05: UTC Timestamps

**Decision:** All timestamps stored and transmitted in UTC.

**Alternatives Considered:**
- Store in local timezone
- Store timezone with each timestamp

**Rationale:**
- Consistent storage format
- No daylight saving issues
- Frontend can convert for display
- Simpler database queries

**Tradeoffs:**
- Frontend must handle conversion
- Users see UTC in API responses

---

## Feature Decisions

### FD-01: Self-Registration

**Decision:** Users can self-register without admin approval.

**Alternatives Considered:**
- Admin-only user creation
- Email verification required
- Invite-only registration

**Rationale:**
- Lowers barrier to entry
- Simpler implementation
- Suitable for internal tools or trusted environments

**Tradeoffs:**
- Anyone with access can create accounts
- No email verification

**Mitigation:**
- Rate limiting can be added
- Admin can disable accounts if needed

---

### FD-02: No Booking Modifications

**Decision:** Bookings cannot be modified once created; users must cancel and rebook.

**Alternatives Considered:**
- Full edit capability
- Limited edit (notes only)

**Rationale:**
- Simpler overlap prevention logic
- Clear audit trail
- Covers most real-world needs

**Tradeoffs:**
- Slightly worse UX for time changes
- Two operations instead of one

---

### FD-03: Maximum 8-Hour Bookings

**Decision:** Enforce maximum booking duration of 8 hours.

**Alternatives Considered:**
- No maximum
- Configurable per resource
- Different maximums for different roles

**Rationale:**
- Prevents accidental or malicious long bookings
- Reasonable for most use cases (meetings, equipment, facilities)
- Simple to implement and understand

**Tradeoffs:**
- May not suit all use cases (multi-day events)
- Requires code change to modify

---

## Deferred Items

Items identified during development but intentionally deferred:

| Item | Reason for Deferral | Priority for Future |
|------|---------------------|---------------------|
| Email notifications | Requires email service setup | High |
| Payment integration | Explicitly out of scope | Medium |
| Recurring bookings | Complex business logic | Medium |
| Multi-timezone support | Adds significant complexity | Low |
| Resource categories | Nice-to-have organization | Low |
| Booking modifications | Cancel/rebook is acceptable | Low |
| Token refresh endpoint | 24h expiry is acceptable | Low |
| Rate limiting | Not critical for MVP | Medium |
| Audit logging | Basic logging sufficient | Medium |

---

## Known Risks

### Risk 1: JWT Token Cannot Be Revoked

**Description:** JWT tokens remain valid until expiration, even if user is deleted or password changed.

**Impact:** Low for MVP (trusted user base, 24h expiry)

**Mitigation Options:**
- Implement token blacklist
- Reduce token expiry time
- Add token versioning in user record

---

### Risk 2: Race Condition Window

**Description:** Small window between service-layer check and database insert where concurrent requests could pass service check.

**Impact:** Low (database constraint prevents actual overlap)

**Mitigation:** Database exclusion constraint catches all races; service-layer check is optimization only.

---

### Risk 3: No Rate Limiting

**Description:** API endpoints are not rate-limited, potentially allowing abuse.

**Impact:** Medium for public deployment, Low for internal use

**Mitigation Options:**
- Add rate limiting middleware
- Implement at infrastructure level (nginx, API gateway)

---

### Risk 4: Password Reset Not Implemented

**Description:** Users cannot reset forgotten passwords without admin intervention.

**Impact:** Medium for user experience

**Mitigation:** Admin can reset passwords manually; implement password reset flow in future iteration.
