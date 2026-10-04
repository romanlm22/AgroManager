CREATE TABLE machinery (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id                UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name                   VARCHAR(150) NOT NULL,
    machinery_type         VARCHAR(20) NOT NULL CHECK (machinery_type IN
                           ('TRACTOR', 'SEMBRADORA', 'PULVERIZADORA', 'COSECHADORA', 'OTRA')),
    brand                  VARCHAR(100),
    model                  VARCHAR(100),
    year                   INTEGER,
    hours_used             NUMERIC(10,1),
    status                 VARCHAR(20) NOT NULL DEFAULT 'OPERATIVA' CHECK (status IN
                           ('OPERATIVA', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO')),
    next_maintenance_date  DATE,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE machinery_maintenances (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machinery_id       UUID NOT NULL REFERENCES machinery(id) ON DELETE CASCADE,
    maintenance_date   DATE NOT NULL,
    description        TEXT,
    cost               NUMERIC(12,2) CHECK (cost >= 0),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_machinery_farm_id ON machinery (farm_id);
CREATE INDEX idx_machinery_maintenances_machinery_id ON machinery_maintenances (machinery_id);
CREATE INDEX idx_machinery_maintenances_date ON machinery_maintenances (maintenance_date);
