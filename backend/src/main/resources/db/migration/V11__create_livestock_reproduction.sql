-- Genealogía básica: la madre se registra al cargar un parto con cría.
ALTER TABLE animals
    ADD COLUMN mother_id UUID REFERENCES animals(id) ON DELETE SET NULL;

CREATE INDEX idx_animals_mother_id ON animals (mother_id);

-- Eventos reproductivos de una hembra: servicio, tacto, parto y aborto.
CREATE TABLE animal_reproduction_events (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id           UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    animal_id         UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    event_type        VARCHAR(20) NOT NULL
        CHECK (event_type IN ('SERVICIO', 'TACTO', 'PARTO', 'ABORTO')),
    event_date        DATE NOT NULL,
    service_type      VARCHAR(20) CHECK (service_type IN ('NATURAL', 'INSEMINACION')),
    sire_animal_id    UUID REFERENCES animals(id) ON DELETE SET NULL,
    sire_description  VARCHAR(150),
    tacto_result      VARCHAR(20) CHECK (tacto_result IN ('PRENADA', 'VACIA')),
    calf_animal_id    UUID REFERENCES animals(id) ON DELETE SET NULL,
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Cada dato solo tiene sentido en su tipo de evento.
    CONSTRAINT chk_repro_service_fields CHECK (
        event_type = 'SERVICIO'
        OR (service_type IS NULL AND sire_animal_id IS NULL AND sire_description IS NULL)
    ),
    CONSTRAINT chk_repro_service_type CHECK (event_type <> 'SERVICIO' OR service_type IS NOT NULL),
    CONSTRAINT chk_repro_tacto_result CHECK ((event_type = 'TACTO') = (tacto_result IS NOT NULL)),
    CONSTRAINT chk_repro_calf CHECK (event_type = 'PARTO' OR calf_animal_id IS NULL)
);

CREATE INDEX idx_repro_events_farm_id ON animal_reproduction_events (farm_id);
CREATE INDEX idx_repro_events_animal_date ON animal_reproduction_events (animal_id, event_date);
