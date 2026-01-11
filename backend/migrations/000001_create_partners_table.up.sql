-- +goose Up
CREATE TABLE partners (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'unverified' CHECK (status IN ('unverified', 'verified', 'suspended')),
    email_verified BOOLEAN NOT NULL DEFAULT false,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_partners_email ON partners(email);
CREATE INDEX idx_partners_phone ON partners(phone);
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_deleted_at ON partners(deleted_at);