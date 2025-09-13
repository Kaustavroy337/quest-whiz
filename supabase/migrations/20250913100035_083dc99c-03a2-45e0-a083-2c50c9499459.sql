-- Fix security warnings by setting proper search_path for all functions

-- Fix function 1: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix function 2: get_current_employee (already has search_path but ensuring it's correct)
CREATE OR REPLACE FUNCTION public.get_current_employee()
RETURNS TABLE (
  id UUID,
  username TEXT,
  name TEXT,
  berger_employee_code TEXT,
  can_attempt BOOLEAN
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT e.id, e.username, e.name, e.berger_employee_code, e.can_attempt
  FROM public.employees e
  INNER JOIN public.employee_profiles ep ON e.id = ep.employee_id
  WHERE ep.user_id = auth.uid();
$$;

-- Fix function 3: link_employee_to_auth_user
CREATE OR REPLACE FUNCTION public.link_employee_to_auth_user(
  p_employee_username TEXT,
  p_auth_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  employee_record RECORD;
BEGIN
  -- Find employee by username
  SELECT id INTO employee_record FROM public.employees WHERE username = p_employee_username;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Employee with username % not found', p_employee_username;
  END IF;
  
  -- Create employee profile link
  INSERT INTO public.employee_profiles (user_id, employee_id)
  VALUES (p_auth_user_id, employee_record.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN TRUE;
END;
$$;