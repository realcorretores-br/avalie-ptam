-- Promote jonathan@silvajonathan.me to admin

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Find user by email
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'jonathan@silvajonathan.me';

  IF v_user_id IS NOT NULL THEN
    -- Insert admin role if not exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'User jonathan@silvajonathan.me promoted to admin.';
  ELSE
    RAISE NOTICE 'User not found.';
  END IF;
END;
$$;
