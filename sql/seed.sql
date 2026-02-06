BEGIN;

INSERT INTO users (name, email, password_hash, role, active_role, city, country)
VALUES
  ('Alice Client', 'alice@example.com', '$2b$10$seedseedseedseedseedseedseedseedseedseedseed', 'client', 'client', 'Paris', 'FR'),
  ('Bob Pro', 'bobpro@example.com', '$2b$10$seedseedseedseedseedseedseedseedseedseedseed', 'pro', 'pro', 'Paris', 'FR'),
  ('Chloé Pro', 'chloepro@example.com', '$2b$10$seedseedseedseedseedseedseedseedseedseedseed', 'pro', 'pro', 'Lyon', 'FR');

INSERT INTO pro_profiles (user_id, business_name, status, experience, city, country, address)
SELECT id, 'Bob Studio', 'salon', '2+ ans', 'Paris', 'FR', '10 rue de Rivoli'
FROM users WHERE email='bobpro@example.com';

INSERT INTO pro_profiles (user_id, business_name, status, experience, city, country, address)
SELECT id, 'Chloé Beauty', 'freelance', '1 an', 'Lyon', 'FR', '5 place Bellecour'
FROM users WHERE email='chloepro@example.com';

INSERT INTO services (pro_user_id, name, price, duration_min, description)
SELECT id, 'Coupe + brushing', 45.00, 45, 'Prestation classique'
FROM users WHERE email='bobpro@example.com';

INSERT INTO services (pro_user_id, name, price, duration_min, description)
SELECT id, 'Maquillage soirée', 60.00, 60, 'Look soirée'
FROM users WHERE email='chloepro@example.com';

-- Bob: Mon..Fri enabled
INSERT INTO availability_rules (pro_user_id, day_of_week, enabled)
SELECT id, d, true
FROM users, generate_series(1,5) AS d
WHERE email='bobpro@example.com'
ON CONFLICT (pro_user_id, day_of_week) DO NOTHING;

-- Slots for Bob
INSERT INTO availability_slots (rule_id, start_time, end_time)
SELECT r.id, '09:00', '12:00'
FROM availability_rules r
JOIN users u ON u.id = r.pro_user_id
WHERE u.email='bobpro@example.com' AND r.day_of_week BETWEEN 1 AND 5;

INSERT INTO availability_slots (rule_id, start_time, end_time)
SELECT r.id, '14:00', '18:00'
FROM availability_rules r
JOIN users u ON u.id = r.pro_user_id
WHERE u.email='bobpro@example.com' AND r.day_of_week BETWEEN 1 AND 5;

INSERT INTO posts (provider_user_id, media_url, description, category)
SELECT id, 'https://example.com/media1.jpg', 'Avant / après', 'Coiffure'
FROM users WHERE email='bobpro@example.com';

COMMIT;
