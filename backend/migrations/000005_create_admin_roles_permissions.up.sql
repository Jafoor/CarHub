-- +goose Up
CREATE TABLE admin_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_super_admin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_role_permissions (
    role_id INTEGER NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES admin_permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE admin_user_roles (
    admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
    PRIMARY KEY (admin_id, role_id)
);

-- Create Super Admin role
INSERT INTO admin_roles (name, display_name, is_super_admin) 
VALUES ('super_admin', 'Super Administrator', true);