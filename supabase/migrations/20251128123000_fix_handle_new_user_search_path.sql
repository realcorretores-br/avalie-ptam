-- Fix function search path mutable lint
ALTER FUNCTION public.handle_new_user() SET search_path = public;
