INSERT INTO roles (name, description) VALUES
    ('ROLE_ADMIN', 'System administrator with full access'),
    ('ROLE_MANAGER', 'Team manager with elevated permissions'),
    ('ROLE_AGENT', 'Support agent handling tickets and customers')
ON CONFLICT (name) DO NOTHING;
