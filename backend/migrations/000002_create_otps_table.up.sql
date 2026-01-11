-- +goose Up
CREATE TABLE otps (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL,
    owner_type VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_otps_owner ON otps(owner_type, owner_id, purpose);
CREATE INDEX idx_otps_expires_at ON otps(expires_at);
CREATE INDEX idx_otps_used ON otps(used);
CREATE INDEX idx_otps_deleted_at ON otps(deleted_at);