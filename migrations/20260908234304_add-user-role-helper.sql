-- Helper function to get user role from auth.users.profile JSONB
-- Used by RLS policies and app code to check admin status
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT profile->>'rol' FROM auth.users WHERE id = auth.uid()),
    'cliente'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
