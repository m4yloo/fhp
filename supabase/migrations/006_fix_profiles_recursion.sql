-- Fix infinite recursion in profiles RLS policy
-- The admin policy in 004 queries profiles FROM a profiles policy = infinite recursion
-- Fix: create a SECURITY DEFINER function that bypasses RLS

-- Drop ALL policies on profiles that reference admin_role to stop recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;

-- Create a helper function that bypasses RLS via SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND admin_role = true
  );
$$;

-- Recreate the profiles admin policy using the helper
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Recreate admin policies on other tables using the helper
-- (these also referenced profiles which triggered the recursion cascade)

DROP POLICY IF EXISTS "Admins can read all pass requests" ON public.pass_requests;
CREATE POLICY "Admins can read all pass requests"
  ON public.pass_requests FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all pass requests" ON public.pass_requests;
CREATE POLICY "Admins can update all pass requests"
  ON public.pass_requests FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read all passes" ON public.user_passes;
CREATE POLICY "Admins can read all passes"
  ON public.user_passes FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read all user games" ON public.user_games;
CREATE POLICY "Admins can read all user games"
  ON public.user_games FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read all transactions" ON public.transactions;
CREATE POLICY "Admins can read all transactions"
  ON public.transactions FOR SELECT
  USING (public.is_admin());
