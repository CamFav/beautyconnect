BEGIN;

DO $$
DECLARE
  v_pro_id BIGINT;
  v_client_id BIGINT;
  v_service_id BIGINT;
  v_service_name TEXT;
  v_price NUMERIC(10,2);
  v_duration INT;

  v_start_at TIMESTAMPTZ := TIMESTAMPTZ '2026-02-10 10:00:00+01';
  v_new_end  TIMESTAMPTZ;

  v_conflict BOOLEAN;
BEGIN
  -- 1) Récupérer IDs pro/client
  SELECT id INTO v_pro_id FROM users WHERE email = 'bobpro@example.com';
  SELECT id INTO v_client_id FROM users WHERE email = 'alice@example.com';

  IF v_pro_id IS NULL OR v_client_id IS NULL THEN
    RAISE EXCEPTION 'Missing seed data: pro or client not found';
  END IF;

  -- 2) Récupérer service du pro (id, prix, durée)
  SELECT s.id, s.name, s.price, s.duration_min
  INTO v_service_id, v_service_name, v_price, v_duration
  FROM services s
  WHERE s.pro_user_id = v_pro_id
    AND s.name = 'Coupe + brushing'
  LIMIT 1;

  IF v_service_id IS NULL THEN
    RAISE EXCEPTION 'Service not found for this pro';
  END IF;

  v_new_end := v_start_at + make_interval(mins => v_duration);

  -- 3) Verrouiller les réservations actives du pro autour de la période

  PERFORM 1
  FROM reservations r
  WHERE r.pro_user_id = v_pro_id
    AND r.status IN ('pending','accepted','confirmed')
    AND r.start_at >= (v_start_at - interval '1 day')
    AND r.start_at <= (v_start_at + interval '1 day')
  FOR UPDATE;

  -- 4) Test de chevauchement : new_start < existing_end AND existing_start < new_end
  SELECT EXISTS (
    SELECT 1
    FROM reservations r
    WHERE r.pro_user_id = v_pro_id
      AND r.status IN ('pending','accepted','confirmed')
      AND v_start_at < (r.start_at + make_interval(mins => r.duration_min))
      AND r.start_at < v_new_end
  ) INTO v_conflict;

  IF v_conflict THEN
    RAISE EXCEPTION 'Double booking detected (overlap)';
  END IF;

  -- 5) Insert réservation
  INSERT INTO reservations (
    client_user_id, pro_user_id, service_id,
    service_name, price, duration_min,
    start_at, location, notes, status
  ) VALUES (
    v_client_id, v_pro_id, v_service_id,
    v_service_name, v_price, v_duration,
    v_start_at, 'Paris', 'Demo transaction', 'pending'
  );

END $$;

COMMIT;