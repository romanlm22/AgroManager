-- Pesajes individuales. El peso actual del animal se mantiene con el último pesaje.
CREATE TABLE animal_weighings (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_id      UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    weighing_date  DATE NOT NULL,
    weight_kg      NUMERIC(7,1) NOT NULL CHECK (weight_kg > 0),
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_animal_weighings_animal_date ON animal_weighings (animal_id, weighing_date);

-- Eventos sanitarios. Se aplican a un animal O a un rodeo (exactamente uno de los dos).
CREATE TABLE animal_health_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id         UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    animal_id       UUID REFERENCES animals(id) ON DELETE CASCADE,
    herd_id         UUID REFERENCES herds(id) ON DELETE CASCADE,
    event_type      VARCHAR(20) NOT NULL
        CHECK (event_type IN ('VACUNACION', 'DESPARASITACION', 'TRATAMIENTO', 'OTRO')),
    event_date      DATE NOT NULL,
    product         VARCHAR(150) NOT NULL,
    dose            VARCHAR(100),
    next_dose_date  DATE,
    cost            NUMERIC(12,2) CHECK (cost >= 0),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_health_event_target CHECK (
        (animal_id IS NOT NULL AND herd_id IS NULL)
        OR (animal_id IS NULL AND herd_id IS NOT NULL)
    ),
    CONSTRAINT chk_health_event_next_dose CHECK (
        next_dose_date IS NULL OR next_dose_date >= event_date
    )
);

CREATE INDEX idx_health_events_farm_id ON animal_health_events (farm_id);
CREATE INDEX idx_health_events_animal_id ON animal_health_events (animal_id);
CREATE INDEX idx_health_events_herd_id ON animal_health_events (herd_id);

-- Producción ganadera: leche, carne, lana, etc. Puede atribuirse a un rodeo o a un
-- animal, o a ninguno. Si se elimina el rodeo o el animal, la producción se conserva.
CREATE TABLE livestock_productions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id          UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    product_type     VARCHAR(20) NOT NULL
        CHECK (product_type IN ('LECHE', 'CARNE', 'LANA', 'HUEVOS', 'CUERO', 'OTRO')),
    production_date  DATE NOT NULL,
    quantity         NUMERIC(12,2) NOT NULL CHECK (quantity > 0),
    unit             VARCHAR(20) NOT NULL CHECK (unit IN ('LITROS', 'KG', 'UNIDADES')),
    herd_id          UUID REFERENCES herds(id) ON DELETE SET NULL,
    animal_id        UUID REFERENCES animals(id) ON DELETE SET NULL,
    price_per_unit   NUMERIC(12,2) CHECK (price_per_unit >= 0),
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_production_target CHECK (herd_id IS NULL OR animal_id IS NULL)
);

CREATE INDEX idx_livestock_productions_farm_date ON livestock_productions (farm_id, production_date);
