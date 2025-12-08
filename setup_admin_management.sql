CREATE OR REPLACE FUNCTION public.toggle_admin_role(
  target_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id uuid;
  v_has_role boolean;
BEGIN
  v_admin_id := auth.uid();
  
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = v_admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: Apenas administradores podem gerenciar permissões.';
  END IF;

  -- Check if target already has admin role
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = target_user_id AND role = 'admin'
  ) INTO v_has_role;

  IF v_has_role THEN
    -- Remove admin role
    DELETE FROM public.user_roles
    WHERE user_id = target_user_id AND role = 'admin';
    RETURN false; -- Now not admin
  ELSE
    -- Add admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin');
    RETURN true; -- Now admin
  END IF;
END;
$$;
