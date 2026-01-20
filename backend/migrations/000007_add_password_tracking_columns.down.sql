-- +goose Up
-- This is a placeholder for the down migration in the separate file, 
-- but since I'm creating a pair of up/down files, I will put the down logic in the .down.sql file.

-- +goose Down
ALTER TABLE admins DROP COLUMN IF EXISTS password_changed;
ALTER TABLE admins DROP COLUMN IF EXISTS last_password_change;
