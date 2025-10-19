CREATE TABLE divisions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    bn_name VARCHAR(100),
    lat DECIMAL(10, 8),
    lon DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_divisions_is_active ON divisions(is_active);
CREATE INDEX idx_divisions_priority ON divisions(priority);
CREATE INDEX idx_divisions_name ON divisions(name);