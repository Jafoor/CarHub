-- +goose Up
ALTER TABLE admins ADD COLUMN IF NOT EXISTS password_changed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP;
