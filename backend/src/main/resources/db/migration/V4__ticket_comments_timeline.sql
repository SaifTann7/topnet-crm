CREATE TABLE ticket_comments (
    id          BIGSERIAL PRIMARY KEY,
    ticket_id   BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    body        TEXT NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    author_name  VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_comments_ticket ON ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_created ON ticket_comments(created_at DESC);

CREATE TABLE ticket_activities (
    id            BIGSERIAL PRIMARY KEY,
    ticket_id     BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    activity_type VARCHAR(40) NOT NULL,
    description   TEXT,
    field_name    VARCHAR(100),
    old_value     TEXT,
    new_value     TEXT,
    performed_by  VARCHAR(255) NOT NULL,
    performed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_activities_ticket ON ticket_activities(ticket_id);
CREATE INDEX idx_ticket_activities_performed ON ticket_activities(performed_at DESC);
