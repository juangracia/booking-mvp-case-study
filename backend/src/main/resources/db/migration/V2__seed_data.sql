-- Seed admin user (password: admin123)
-- BCrypt hash generated with strength 12
INSERT INTO users (id, email, password, role, created_at, updated_at)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'admin@example.com',
    '$2a$12$sy1DSll94d4GKm5TUoVWRuVYiAO2sDI.06B7dRhnUMkAkMCZ.ft9K',
    'ADMIN',
    NOW(),
    NOW()
);

-- Seed regular user (password: user123)
INSERT INTO users (id, email, password, role, created_at, updated_at)
VALUES (
    'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    'user@example.com',
    '$2a$12$JDn4BNf5j1UAOWvRiU65kelnAxAHTV9FH7pSwA9Dboau.nJrrkQEO',
    'USER',
    NOW(),
    NOW()
);

-- Seed resources
INSERT INTO resources (id, name, description, active, created_at, updated_at)
VALUES
    (
        'c3d4e5f6-a7b8-9012-cdef-345678901234',
        'Conference Room A',
        'Large conference room with projector and whiteboard. Capacity: 20 people.',
        true,
        NOW(),
        NOW()
    ),
    (
        'd4e5f6a7-b8c9-0123-def0-456789012345',
        'Meeting Room B',
        'Small meeting room for up to 6 people. Has video conferencing equipment.',
        true,
        NOW(),
        NOW()
    ),
    (
        'e5f6a7b8-c9d0-1234-ef01-567890123456',
        'Tennis Court 1',
        'Outdoor tennis court. Equipment available for rent at reception.',
        true,
        NOW(),
        NOW()
    );
