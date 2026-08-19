CREATE TABLE farms (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    location        VARCHAR(255),
    total_area_ha   NUMERIC(10,1),
    latitude        NUMERIC(9,6),
    longitude       NUMERIC(9,6),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE farm_users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id     UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_role   VARCHAR(20) NOT NULL CHECK (farm_role IN ('OWNER', 'MEMBER')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_farm_users_farm_user UNIQUE (farm_id, user_id)
);

CREATE INDEX idx_farm_users_farm_id ON farm_users (farm_id);
CREATE INDEX idx_farm_users_user_id ON farm_users (user_id);