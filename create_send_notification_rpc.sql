CREATE OR REPLACE FUNCTION public.send_notification(
  p_title text,
  p_message text,
  p_user_id uuid DEFAULT NULL,
  p_is_mass boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id uuid;
BEGIN
  v_admin_id := auth.uid();
  
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = v_admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: Apenas administradores podem enviar notificações.';
  END IF;

  IF p_is_mass THEN
    -- Insert for all users found in profiles
    INSERT INTO public.notifications (user_id, title, message, is_mass, created_by)
    SELECT id, p_title, p_message, true, v_admin_id
    FROM public.profiles;
  ELSE
    IF p_user_id IS NULL THEN
      RAISE EXCEPTION 'ID do usuário é obrigatório para envio individual.';
    END IF;
    
    INSERT INTO public.notifications (user_id, title, message, is_mass, created_by)
    VALUES (p_user_id, p_title, p_message, false, v_admin_id);
  END IF;
END;
$$;
