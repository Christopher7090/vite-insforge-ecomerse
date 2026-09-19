-- Add 'pagado' status for Stripe payment fulfillment
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_estado_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_estado_check
  CHECK (estado IN ('pendiente', 'pagado', 'en_transito', 'entregado', 'cancelado'));
