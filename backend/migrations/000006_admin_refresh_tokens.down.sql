-- +goose Down
DROP INDEX IF EXISTS idx_admin_refresh_tokens_expires_at;
DROP INDEX IF EXISTS idx_admin_refresh_tokens_admin_id;
DROP TABLE IF EXISTS admin_refresh_tokens;
