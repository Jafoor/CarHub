CREATE TABLE districts (
    id BIGSERIAL PRIMARY KEY,
    division_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    bn_name VARCHAR(100),
    lat DECIMAL(10, 8),
    lon DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE RESTRICT
);

CREATE INDEX idx_districts_division_id ON districts(division_id);
CREATE INDEX idx_districts_is_active ON districts(is_active);
CREATE INDEX idx_districts_name ON districts(name);