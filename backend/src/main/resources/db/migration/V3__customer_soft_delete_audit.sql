-- Soft delete support for customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_customers_deleted_at ON customers(deleted_at);

-- Customer audit trail
CREATE TABLE customer_audit_logs (
    id           BIGSERIAL PRIMARY KEY,
    customer_id  BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    action       VARCHAR(30) NOT NULL,
    field_name   VARCHAR(100),
    old_value    TEXT,
    new_value    TEXT,
    performed_by VARCHAR(255) NOT NULL,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customer_audit_customer ON customer_audit_logs(customer_id);
CREATE INDEX idx_customer_audit_performed_at ON customer_audit_logs(performed_at DESC);
