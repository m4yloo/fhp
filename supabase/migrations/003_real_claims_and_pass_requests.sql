-- Real fulfillment primitives: license inventory, pass requests, and
-- server-side game claiming. The browser should never generate license keys.

CREATE TABLE IF NOT EXISTS public.license_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id INTEGER NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  license_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'revoked')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_license_keys_game_status
  ON public.license_keys(game_id, status);

ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view assigned license keys" ON public.license_keys;
CREATE POLICY "Users can view assigned license keys" ON public.license_keys
  FOR SELECT USING (auth.uid() = assigned_to);

CREATE TABLE IF NOT EXISTS public.pass_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pass_type TEXT NOT NULL CHECK (pass_type IN ('limited', 'unlimited')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pass_requests_user_status
  ON public.pass_requests(user_id, status);

ALTER TABLE public.pass_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own pass requests" ON public.pass_requests;
CREATE POLICY "Users can view own pass requests" ON public.pass_requests
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own pass requests" ON public.pass_requests;
CREATE POLICY "Users can create own pass requests" ON public.pass_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can cancel own pending pass requests" ON public.pass_requests;
CREATE POLICY "Users can cancel own pending pass requests" ON public.pass_requests
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'cancelled');

DROP TRIGGER IF EXISTS update_pass_requests_updated_at ON public.pass_requests;
CREATE TRIGGER update_pass_requests_updated_at BEFORE UPDATE ON public.pass_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.request_pass(requested_pass_type TEXT)
RETURNS public.pass_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  created_request public.pass_requests;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF requested_pass_type NOT IN ('limited', 'unlimited') THEN
    RAISE EXCEPTION 'Invalid pass type';
  END IF;

  INSERT INTO public.pass_requests (user_id, pass_type)
  VALUES (auth.uid(), requested_pass_type)
  RETURNING * INTO created_request;

  INSERT INTO public.transactions (
    user_id,
    transaction_type,
    description,
    metadata
  )
  VALUES (
    auth.uid(),
    'pass_purchase',
    CASE requested_pass_type
      WHEN 'limited' THEN 'Pass request: Limited'
      ELSE 'Pass request: Unlimited'
    END,
    jsonb_build_object('status', 'pending', 'pass_type', requested_pass_type)
  );

  RETURN created_request;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_game(requested_game_id INTEGER)
RETURNS public.user_games
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  active_pass public.user_passes;
  selected_key public.license_keys;
  claimed_game public.user_games;
  game_title TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT *
  INTO active_pass
  FROM public.user_passes
  WHERE user_id = auth.uid()
    AND status = 'active'
    AND expires_at > now()
    AND games_claimed < games_allowed
  ORDER BY expires_at DESC
  LIMIT 1;

  IF active_pass.id IS NULL THEN
    RAISE EXCEPTION 'No active pass with remaining claims';
  END IF;

  SELECT title
  INTO game_title
  FROM public.games
  WHERE id = requested_game_id
    AND available = true;

  IF game_title IS NULL THEN
    RAISE EXCEPTION 'Game is not available';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.user_games
    WHERE user_id = auth.uid()
      AND game_id = requested_game_id
  ) THEN
    RAISE EXCEPTION 'Game already claimed';
  END IF;

  SELECT *
  INTO selected_key
  FROM public.license_keys
  WHERE game_id = requested_game_id
    AND status = 'available'
  ORDER BY created_at ASC
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  IF selected_key.id IS NULL THEN
    RAISE EXCEPTION 'No license key available for this game';
  END IF;

  UPDATE public.license_keys
  SET status = 'claimed',
      assigned_to = auth.uid(),
      assigned_at = now()
  WHERE id = selected_key.id;

  INSERT INTO public.user_games (
    user_id,
    game_id,
    pass_id,
    license_key,
    status
  )
  VALUES (
    auth.uid(),
    requested_game_id,
    active_pass.id,
    selected_key.license_key,
    'claimed'
  )
  RETURNING * INTO claimed_game;

  UPDATE public.user_passes
  SET games_claimed = games_claimed + 1
  WHERE id = active_pass.id;

  INSERT INTO public.transactions (
    user_id,
    game_id,
    pass_id,
    transaction_type,
    description,
    metadata
  )
  VALUES (
    auth.uid(),
    requested_game_id,
    active_pass.id,
    'game_claim',
    'Game claimed: ' || game_title,
    jsonb_build_object('license_key_id', selected_key.id)
  );

  RETURN claimed_game;
END;
$$;
