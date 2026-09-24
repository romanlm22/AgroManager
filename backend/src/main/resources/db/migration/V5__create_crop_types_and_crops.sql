CREATE TABLE crop_types (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO crop_types (name) VALUES
    ('Soja'),
    ('Maíz'),
    ('Trigo'),
    ('Arroz'),
    ('Algodón'),
    ('Otros');

CREATE TABLE crops (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id                 UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
    crop_type_id             UUID NOT NULL REFERENCES crop_types(id),
    planting_date            DATE NOT NULL,
    estimated_harvest_date   DATE,
    actual_harvest_date      DATE,
    planted_area_ha          NUMERIC(10,1),
    yield_kg_ha              NUMERIC(10,2),
    status                   VARCHAR(20) NOT NULL DEFAULT 'PLANTED'
                             CHECK (status IN ('PLANTED', 'GROWING', 'HARVESTED', 'LOST')),
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_crops_field_id ON crops (field_id);
CREATE INDEX idx_crops_crop_type_id ON crops (crop_type_id);