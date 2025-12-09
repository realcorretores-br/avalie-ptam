-- Create send_notification function
CREATE OR REPLACE FUNCTION public.send_notification(
    p_title TEXT,
    p_message TEXT,
    p_user_id UUID DEFAULT NULL,
    p_is_mass BOOLEAN DEFAULT FALSE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- If mass notification, insert for all users
    IF p_is_mass THEN
        INSERT INTO public.notifications (user_id, title, message, is_mass, read)
        SELECT id, p_title, p_message, TRUE, FALSE
        FROM auth.users;
    ELSE
        -- Individual notification
        IF p_user_id IS NULL THEN
            RAISE EXCEPTION 'user_id is required for individual notifications';
        END IF;

        INSERT INTO public.notifications (user_id, title, message, is_mass, read)
        VALUES (p_user_id, p_title, p_message, FALSE, FALSE);
    END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.send_notification TO authenticated;
