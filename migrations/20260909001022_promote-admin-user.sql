-- Promote user to admin role
UPDATE auth.users
SET profile = jsonb_set(COALESCE(profile, '{}'), '{rol}', '"admin"')
WHERE id = '9cf35559-686b-4512-81fa-3baee349b3e7';
