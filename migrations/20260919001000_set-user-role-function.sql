-- DB function to change a user's role (admin only)
CREATE OR REPLACE FUNCTION public.set_user_role(p_user_id uuid, p_new_rol text)
RETURNS void AS $$
BEGIN
  IF public.get_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Only admins can change user roles';
  END IF;

  IF p_new_rol NOT IN ('cliente', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: %. Allowed: cliente, admin', p_new_rol;
  END IF;

  UPDATE auth.users
  SET profile = jsonb_set(COALESCE(profile, '{}'), '{rol}', to_jsonb(p_new_rol))
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found', p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
