-- ============================================
-- Realtime: Order status updates
-- ============================================

-- 1. Channel pattern for per-order updates
INSERT INTO realtime.channels (pattern, description, enabled)
VALUES ('order:%', 'Per-order status updates', true)
ON CONFLICT (pattern) DO UPDATE
SET description = EXCLUDED.description,
    enabled = EXCLUDED.enabled;

-- 2. Function to publish status changes
CREATE OR REPLACE FUNCTION public.notify_order_status()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM realtime.publish(
    'order:' || NEW.id::text,
    'status_changed',
    jsonb_build_object('id', NEW.id, 'estado', NEW.estado)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger on orders table
CREATE TRIGGER order_status_trigger
AFTER UPDATE ON public.orders
FOR EACH ROW
WHEN (OLD.estado IS DISTINCT FROM NEW.estado)
EXECUTE FUNCTION public.notify_order_status();

-- 4. Restrict channel access to admins
ALTER TABLE realtime.channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_subscribe_all_orders
ON realtime.channels FOR SELECT
TO authenticated
USING (public.get_user_role() = 'admin');
