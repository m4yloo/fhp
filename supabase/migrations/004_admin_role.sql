-- Admin role + RLS policies for admin access

-- Add admin_role column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admin_role boolean NOT NULL DEFAULT false;

-- Admin can read all profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND admin_role = true)
  );

-- Admin can read all pass_requests
DROP POLICY IF EXISTS "Admins can read all pass requests" ON public.pass_requests;
CREATE POLICY "Admins can read all pass requests" ON public.pass_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND admin_role = true)
  );

-- Admin can update all pass_requests (approve/reject)
DROP POLICY IF EXISTS "Admins can update all pass requests" ON public.pass_requests;
CREATE POLICY "Admins can update all pass requests" ON public.pass_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND admin_role = true)
  );

-- Admin can read all passes
DROP POLICY IF EXISTS "Admins can read all passes" ON public.passes;
CREATE POLICY "Admins can read all passes" ON public.passes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND admin_role = true)
  );

-- Admin can read all user_games
DROP POLICY IF EXISTS "Admins can read all user games" ON public.user_games;
CREATE POLICY "Admins can read all user games" ON public.user_games
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND admin_role = true)
  );

-- Admin can read all transactions
DROP POLICY IF EXISTS "Admins can read all transactions" ON public.transactions;
CREATE POLICY "Admins can read all transactions" ON public.transactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND admin_role = true)
  );

-- Make maylomaylo768@gmail.com admin
UPDATE public.profiles SET admin_role = true WHERE id = (
  SELECT id FROM auth.users WHERE email = 'maylomaylo768@gmail.com'
);
