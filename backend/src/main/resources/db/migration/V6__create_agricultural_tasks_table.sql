CREATE TABLE agricultural_tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id        UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
    crop_id         UUID REFERENCES crops(id) ON DELETE SET NULL,
    responsible_id  UUID NOT NULL REFERENCES users(id),
    task_type       VARCHAR(30) NOT NULL CHECK (task_type IN
                    ('SIEMBRA', 'FERTILIZACION', 'PULVERIZACION', 'RIEGO',
                     'COSECHA', 'CONTROL_MALEZAS', 'OTRA')),
    status          VARCHAR(20) NOT NULL DEFAULT 'PLANIFICADA' CHECK (status IN
                    ('PLANIFICADA', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA')),
    task_date       DATE NOT NULL,
    cost            NUMERIC(12,2),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agricultural_tasks_field_id ON agricultural_tasks (field_id);
CREATE INDEX idx_agricultural_tasks_crop_id ON agricultural_tasks (crop_id);
CREATE INDEX idx_agricultural_tasks_responsible_id ON agricultural_tasks (responsible_id);
CREATE INDEX idx_agricultural_tasks_task_date ON agricultural_tasks (task_date);
