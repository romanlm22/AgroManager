-- Uso del lote: permite distinguir potreros (ganadería) de lotes agrícolas.
-- Los lotes existentes quedan como AGRICULTURA.
ALTER TABLE fields
    ADD COLUMN land_use VARCHAR(20) NOT NULL DEFAULT 'AGRICULTURA'
        CHECK (land_use IN ('AGRICULTURA', 'GANADERIA', 'MIXTO'));

-- Rodeos: grupos de animales. head_count es el conteo manual, que se usa
-- solo mientras el rodeo no tenga fichas individuales activas.
CREATE TABLE herds (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id     UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name        VARCHAR(150) NOT NULL,
    category    VARCHAR(20) NOT NULL
        CHECK (category IN ('TERNERO', 'VAQUILLONA', 'VACA', 'TORO', 'NOVILLO', 'OTRA')),
    field_id    UUID REFERENCES fields(id) ON DELETE SET NULL,
    head_count  INTEGER NOT NULL DEFAULT 0 CHECK (head_count >= 0),
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_herds_farm_id ON herds (farm_id);
CREATE INDEX idx_herds_field_id ON herds (field_id);

-- Fichas individuales. La caravana es única dentro de cada establecimiento.
CREATE TABLE animals (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id            UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    tag_number         VARCHAR(50) NOT NULL,
    sex                VARCHAR(10) NOT NULL CHECK (sex IN ('MACHO', 'HEMBRA')),
    breed              VARCHAR(100),
    birth_date         DATE,
    category           VARCHAR(20) NOT NULL
        CHECK (category IN ('TERNERO', 'VAQUILLONA', 'VACA', 'TORO', 'NOVILLO', 'OTRA')),
    status             VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
        CHECK (status IN ('ACTIVO', 'VENDIDO', 'MUERTO')),
    current_weight_kg  NUMERIC(7,1) CHECK (current_weight_kg >= 0),
    herd_id            UUID REFERENCES herds(id) ON DELETE SET NULL,
    field_id           UUID REFERENCES fields(id) ON DELETE SET NULL,
    notes              TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_animals_farm_tag UNIQUE (farm_id, tag_number)
);

CREATE INDEX idx_animals_farm_id ON animals (farm_id);
CREATE INDEX idx_animals_herd_id ON animals (herd_id);
CREATE INDEX idx_animals_field_id ON animals (field_id);

-- Historial de movimientos entre potreros. NULL en from/to significa "sin potrero".
CREATE TABLE animal_movements (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_id      UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    from_field_id  UUID REFERENCES fields(id) ON DELETE SET NULL,
    to_field_id    UUID REFERENCES fields(id) ON DELETE SET NULL,
    movement_date  DATE NOT NULL,
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_animal_movements_animal_id ON animal_movements (animal_id);
