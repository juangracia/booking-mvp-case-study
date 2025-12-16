# Clarified Requirements

This document translates the [initial messy spec](./initial-idea.md) into structured, actionable requirements.

## Table of Contents

1. [Assumptions](#assumptions)
2. [Domain Model](#domain-model)
3. [User Roles](#user-roles)
4. [User Stories](#user-stories)
5. [Business Rules](#business-rules)
6. [Non-Functional Requirements](#non-functional-requirements)
7. [Explicitly Out of Scope](#explicitly-out-of-scope)

---

## Assumptions

Based on the initial request, the following assumptions were made:

| # | Assumption | Rationale |
|---|------------|-----------|
| A1 | A "Resource" is the bookable entity (room, court, equipment, etc.) | Generic term allows flexibility without overcomplicating the domain |
| A2 | All times are in a single configured timezone (UTC by default) | Complex timezone handling deferred to avoid scope creep |
| A3 | Bookings are time-slot based with start and end datetime | Most common booking pattern |
| A4 | Maximum booking duration is 8 hours | Prevents abuse, reasonable for most use cases |
| A5 | Users self-register; no admin approval required | Simplifies onboarding for MVP |
| A6 | Resources are managed by admins only | Clear separation of concerns |
| A7 | A booking can only be ACTIVE or CANCELLED | Simple state machine for MVP |
| A8 | Past bookings cannot be modified | Simplifies business logic |

---

## Domain Model

### Entities

#### User
- Represents anyone who can access the system
- Has email-based authentication
- Assigned a single role (USER or ADMIN)

#### Resource
- The bookable entity
- Has a name, description, and active status
- Inactive resources cannot accept new bookings

#### Booking
- Associates a User with a Resource for a time period
- Tracks status (ACTIVE/CANCELLED)
- Includes optional notes field

### Entity Relationships

```
User (1) -------- (*) Booking (*) -------- (1) Resource
```

---

## User Roles

### USER Role
- Can register and authenticate
- Can view active resources
- Can view availability for resources
- Can create bookings for themselves
- Can view their own bookings
- Can cancel their own active bookings

### ADMIN Role
- Has all USER permissions
- Can create new resources
- Can edit existing resources
- Can disable/enable resources
- Can view all bookings in the system
- Can filter bookings by resource and date range
- Can cancel any booking

---

## User Stories

### Authentication

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-01 | As a visitor, I want to register with email and password | Email must be unique; password stored securely |
| US-02 | As a user, I want to log in with my credentials | Returns JWT token on success; clear error on failure |
| US-03 | As a user, I want my session to expire after a period | JWT expires after 24 hours |

### Resource Management (Admin)

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-04 | As an admin, I want to create a new resource | Name required; description optional; active by default |
| US-05 | As an admin, I want to edit a resource | Can update name, description, active status |
| US-06 | As an admin, I want to disable a resource | Sets active=false; existing bookings unaffected |

### Resource Viewing

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-07 | As a user, I want to see all active resources | Returns list of resources where active=true |
| US-08 | As a user, I want to see resource details | Shows name, description, and availability |
| US-09 | As a user, I want to check availability for a date | Shows booked slots for the selected date |

### Booking Management

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-10 | As a user, I want to create a booking | Must specify resource, start, end; validates no overlap |
| US-11 | As a user, I want to add notes to my booking | Optional free-text field |
| US-12 | As a user, I want to view my bookings | Shows all my bookings with status |
| US-13 | As a user, I want to cancel my booking | Changes status to CANCELLED; cannot undo |
| US-14 | As an admin, I want to view all bookings | Supports filtering by resource and date range |
| US-15 | As an admin, I want to cancel any booking | Can cancel regardless of owner |

---

## Business Rules

### BR-01: No Overlapping Bookings
Two ACTIVE bookings for the same resource cannot overlap in time.

**Overlap definition:**
```
booking1.startAt < booking2.endAt AND booking1.endAt > booking2.startAt
```

**Implementation:** Enforced at both service layer and database level (PostgreSQL exclusion constraint).

### BR-02: Valid Time Range
- `startAt` must be before `endAt`
- `startAt` must be in the future (at time of creation)
- Duration must not exceed 8 hours

### BR-03: Resource Availability
- Only active resources can accept new bookings
- Inactive resources are hidden from users but visible to admins

### BR-04: Booking Cancellation
- Only ACTIVE bookings can be cancelled
- Users can only cancel their own bookings
- Admins can cancel any booking
- Cancellation is irreversible

### BR-05: Data Integrity
- Users cannot be deleted if they have bookings
- Resources cannot be deleted; only disabled

---

## Non-Functional Requirements

### Security
- Passwords hashed with BCrypt (strength 12)
- JWT tokens for stateless authentication
- Role-based access control on all endpoints
- No sensitive data in API responses (no password hashes)

### Performance
- API responses < 500ms for typical operations
- Support for concurrent booking requests (overlap prevention must be thread-safe)

### Reliability
- Database transactions for booking creation
- Consistent error response format

### Maintainability
- Clean architecture with separated concerns
- Comprehensive API documentation (OpenAPI/Swagger)
- Database migrations versioned with Flyway

### Observability
- Structured logging for all operations
- Request/response logging for debugging

---

## Explicitly Out of Scope

The following features were identified but explicitly excluded from MVP:

| Feature | Reason |
|---------|--------|
| Payments | Explicitly deferred in original request |
| Email notifications | Adds complexity; not essential for MVP |
| Calendar integrations | Integration complexity |
| Multi-tenant organizations | Architectural complexity |
| Recurring bookings | Business logic complexity |
| Complex timezone handling | Use single configured timezone |
| Mobile applications | Web-first for MVP |
| Advanced UI/branding | Functionality over aesthetics |
| Booking modifications | Simpler to cancel and rebook |
| Waitlists | Additional complexity |
| Resource categories/tags | Nice-to-have, not MVP |

These features are candidates for future iterations based on user feedback.
