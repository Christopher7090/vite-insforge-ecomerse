-- Stripe one-time payment fulfillment trigger
-- Marks order as paid when Stripe webhook confirms payment

CREATE OR REPLACE FUNCTION public.fulfill_stripe_paid_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.provider = 'stripe'
     AND NEW.processing_status = 'processed'
     AND NEW.event_type IN (
       'checkout.session.completed',
       'checkout.session.async_payment_succeeded',
       'payment_intent.succeeded',
       'invoice.paid'
     )
     AND (NEW.payload -> 'data' -> 'object' -> 'metadata' ->> 'order_id') IS NOT NULL THEN
    UPDATE public.orders
    SET estado = 'pagado'
    WHERE id::text = NEW.payload -> 'data' -> 'object' -> 'metadata' ->> 'order_id'
      AND estado = 'pendiente';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER fulfill_stripe_paid_order_from_webhook
  AFTER INSERT OR UPDATE ON payments.webhook_events
  FOR EACH ROW
  EXECUTE FUNCTION public.fulfill_stripe_paid_order();
