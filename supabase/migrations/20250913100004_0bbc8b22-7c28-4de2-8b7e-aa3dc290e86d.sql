-- SECURITY FIX: Secure Employee Authentication System
-- This migration addresses the critical security vulnerability where employee credentials are exposed

-- Step 1: Create a secure authentication table that links to Supabase auth
CREATE TABLE IF NOT EXISTS public.employee_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Step 2: Remove password field from employees table (SECURITY CRITICAL)
ALTER TABLE public.employees DROP COLUMN IF EXISTS password;

-- Step 3: Enable RLS on employee_profiles
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create secure RLS policies for employee_profiles
CREATE POLICY "Users can view their own employee profile"
  ON public.employee_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own employee profile"
  ON public.employee_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Step 5: Update employees table RLS policies to be properly secured
DROP POLICY IF EXISTS "Employees can view their own record" ON public.employees;

CREATE POLICY "Employees can view their own record"
  ON public.employees
  FOR SELECT
  USING (
    id IN (
      SELECT employee_id 
      FROM public.employee_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Step 6: Update attempts table RLS policies to properly restrict access
DROP POLICY IF EXISTS "Employees can view their own attempts" ON public.attempts;
DROP POLICY IF EXISTS "Employees can create their own attempts" ON public.attempts;
DROP POLICY IF EXISTS "Employees can update their own attempts" ON public.attempts;

CREATE POLICY "Employees can view their own attempts"
  ON public.attempts
  FOR SELECT
  USING (
    employee_id IN (
      SELECT employee_id 
      FROM public.employee_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can create their own attempts"
  ON public.attempts
  FOR INSERT
  WITH CHECK (
    employee_id IN (
      SELECT employee_id 
      FROM public.employee_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can update their own attempts"
  ON public.attempts
  FOR UPDATE
  USING (
    employee_id IN (
      SELECT employee_id 
      FROM public.employee_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Step 7: Create function to get current employee data
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
AS $$
  SELECT e.id, e.username, e.name, e.berger_employee_code, e.can_attempt
  FROM public.employees e
  INNER JOIN public.employee_profiles ep ON e.id = ep.employee_id
  WHERE ep.user_id = auth.uid();
$$;

-- Step 8: Create function to link employee accounts (for admin use)
CREATE OR REPLACE FUNCTION public.link_employee_to_auth_user(
  p_employee_username TEXT,
  p_auth_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Step 9: Add updated_at trigger for employee_profiles
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employee_profiles_updated_at
  BEFORE UPDATE ON public.employee_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();