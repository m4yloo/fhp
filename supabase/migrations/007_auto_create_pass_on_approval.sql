-- When a pass_request is approved, auto-create the user_passes row
-- This runs as SECURITY DEFINER so it bypasses RLS

CREATE OR REPLACE FUNCTION public.handle_approved_pass_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_games_allowed integer;
BEGIN
  -- Only act when status transitions to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    -- Determine games_allowed from pass_type
    IF NEW.pass_type = 'unlimited' THEN
      v_games_allowed := 100;
    ELSE
      v_games_allowed := 12;
    END IF;

    INSERT INTO public.user_passes (
      user_id,
      pass_type,
      games_allowed,
      games_claimed,
      started_at,
      expires_at,
      status
    ) VALUES (
      NEW.user_id,
      NEW.pass_type,
      v_games_allowed,
      0,
      now(),
      now() + interval '4 months',
      'active'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_pass_request_approved ON public.pass_requests;
CREATE TRIGGER on_pass_request_approved
  AFTER UPDATE ON public.pass_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_approved_pass_request();
