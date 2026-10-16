-- Refuse to proceed if duplicate OPEN orders exist.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM orders
        WHERE status = 'OPEN'
        GROUP BY table_id
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION
            'Cannot create unique active-order index: duplicate OPEN orders exist';
    END IF;
END $$;

-- Allow at most one OPEN order per table.
CREATE UNIQUE INDEX IF NOT EXISTS ux_orders_one_open_per_table
    ON orders (table_id)
    WHERE status = 'OPEN';
