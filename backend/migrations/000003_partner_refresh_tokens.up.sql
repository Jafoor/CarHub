-- +goose Up
CREATE TABLE partner_refresh_tokens (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    token_hash VARCHAR(512) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_partner_refresh_tokens_partner_id ON partner_refresh_tokens(partner_id);
CREATE INDEX idx_partner_refresh_tokens_expires_at ON partner_refresh_tokens(expires_at);