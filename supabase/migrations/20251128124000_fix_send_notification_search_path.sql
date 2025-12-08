-- Fix function search path mutable lint for send_notification
-- Using dynamic SQL to handle unknown signature
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT pg_get_function_identity_arguments(p.oid) as signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'send_notification'
    LOOP
        EXECUTE format('ALTER FUNCTION public.send_notification(%s) SET search_path = public', func_record.signature);
    END LOOP;
END $$;
