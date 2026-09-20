-- Stripe Checkout & Portal session RLS policies
-- Allows authenticated users to create and read their own Stripe sessions

ALTER TABLE payments.stripe_checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments.stripe_customer_portal_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users create their stripe checkout sessions"
ON payments.stripe_checkout_sessions
FOR INSERT
TO authenticated
WITH CHECK (
  subject_type = 'user'
  AND subject_id = auth.uid()::text
);

CREATE POLICY "users read their stripe checkout sessions"
ON payments.stripe_checkout_sessions
FOR SELECT
TO authenticated
USING (
  subject_type = 'user'
  AND subject_id = auth.uid()::text
);

CREATE POLICY "users create their stripe portal sessions"
ON payments.stripe_customer_portal_sessions
FOR INSERT
TO authenticated
WITH CHECK (
  subject_type = 'user'
  AND subject_id = auth.uid()::text
);

CREATE POLICY "users read their stripe portal sessions"
ON payments.stripe_customer_portal_sessions
FOR SELECT
TO authenticated
USING (
  subject_type = 'user'
  AND subject_id = auth.uid()::text
);
