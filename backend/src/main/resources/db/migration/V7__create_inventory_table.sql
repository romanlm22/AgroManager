CREATE TABLE inventory_items (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id          UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name             VARCHAR(150) NOT NULL,
    category         VARCHAR(20) NOT NULL CHECK (category IN
                     ('SEMILLA', 'FERTILIZANTE', 'HERBICIDA', 'FUNGICIDA',
                      'INSECTICIDA', 'OTRO')),
    supplier         VARCHAR(150),
    stock            NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (stock >= 0),
    unit             VARCHAR(20) NOT NULL CHECK (unit IN
                     ('KG', 'LITRO', 'UNIDAD', 'BOLSA', 'TONELADA')),
    price            NUMERIC(12,2) CHECK (price >= 0),
    expiration_date  DATE,
    batch_number     VARCHAR(100),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_items_farm_id ON inventory_items (farm_id);
CREATE INDEX idx_inventory_items_expiration_date ON inventory_items (expiration_date);
