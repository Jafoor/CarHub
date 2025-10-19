CREATE TABLE brands (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    vehicle_type_id BIGINT NOT NULL,
    image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id) ON DELETE RESTRICT
);

CREATE INDEX idx_brands_vehicle_type_id ON brands(vehicle_type_id);
CREATE INDEX idx_brands_is_active ON brands(is_active);
CREATE INDEX idx_brands_name ON brands(name);