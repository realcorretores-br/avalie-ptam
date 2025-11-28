-- Fix function search path mutable lint
ALTER FUNCTION public.check_low_credits() SET search_path = public;
