-- Q1: Lister les pros (avec profil) par ville
SELECT u.id, u.name, u.email, p.business_name, p.city
FROM users u
JOIN pro_profiles p ON p.user_id = u.id
WHERE u.role = 'pro'
ORDER BY p.city, u.name;

-- Q2: Rechercher des pros à Paris
SELECT u.id, u.name, p.business_name, p.status, p.experience
FROM pro_profiles p
JOIN users u ON u.id = p.user_id
WHERE p.city ILIKE 'paris%'
ORDER BY p.business_name;

-- Q3: Services d’un pro (Bob) triés par prix
SELECT s.id, s.name, s.price, s.duration_min
FROM services s
JOIN users u ON u.id = s.pro_user_id
WHERE u.email = 'bobpro@example.com'
ORDER BY s.price DESC;

-- Q4: Feed posts (derniers posts) avec auteur + compte likes/favorites
SELECT
  po.id,
  po.created_at,
  u.id AS provider_id,
  u.name AS provider_name,
  po.category,
  po.description,
  (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = po.id) AS likes_count,
  (SELECT COUNT(*) FROM post_favorites pf WHERE pf.post_id = po.id) AS favorites_count
FROM posts po
JOIN users u ON u.id = po.provider_user_id
ORDER BY po.created_at DESC
LIMIT 10 OFFSET 0;

-- Q5: Vérifier les disponibilités d’un pro (Bob) par jour + slots
SELECT
  ar.day_of_week,
  ar.enabled,
  aslot.start_time,
  aslot.end_time
FROM availability_rules ar
JOIN users u ON u.id = ar.pro_user_id
LEFT JOIN availability_slots aslot ON aslot.rule_id = ar.id
WHERE u.email = 'bobpro@example.com'
ORDER BY ar.day_of_week, aslot.start_time;

-- Q6: Nombre de services par pro
SELECT u.id, u.name, COUNT(s.id) AS services_count
FROM users u
LEFT JOIN services s ON s.pro_user_id = u.id
WHERE u.role = 'pro'
GROUP BY u.id, u.name
ORDER BY services_count DESC, u.name;

-- Q7: Top pros par nombre de followers
SELECT
  u.id,
  u.name,
  COUNT(f.follower_id) AS followers_count
FROM users u
LEFT JOIN follows f ON f.followee_id = u.id
WHERE u.role = 'pro'
GROUP BY u.id, u.name
ORDER BY followers_count DESC, u.name
LIMIT 10;

-- Q8: Requête "public profile" (user + pro_profile + catégories)
SELECT
  u.id,
  u.name,
  u.city,
  p.business_name,
  p.status,
  p.experience,
  ARRAY_REMOVE(ARRAY_AGG(DISTINCT c.label), NULL) AS categories
FROM users u
JOIN pro_profiles p ON p.user_id = u.id
LEFT JOIN pro_profile_categories c ON c.pro_profile_id = p.id
WHERE u.id = (SELECT id FROM users WHERE email = 'bobpro@example.com')
GROUP BY u.id, u.name, u.city, p.business_name, p.status, p.experience;

-- Q9: Démonstration d’intégrité référentielle (réservations orphelines inexistantes)
SELECT r.*
FROM reservations r
LEFT JOIN users u1 ON u1.id = r.client_user_id
LEFT JOIN users u2 ON u2.id = r.pro_user_id
WHERE u1.id IS NULL OR u2.id IS NULL;

-- Q10: Pagination pros (page 1, limit 5)
SELECT u.id, u.name, p.business_name, p.city
FROM users u
JOIN pro_profiles p ON p.user_id = u.id
WHERE u.role = 'pro'
ORDER BY u.id
LIMIT 5 OFFSET 0;

-- Q11: Exemple de filtre sur statut de réservation (pour listes pro/client)
SELECT id, pro_user_id, client_user_id, status, start_at
FROM reservations
WHERE status IN ('pending','accepted','confirmed')
ORDER BY start_at DESC
LIMIT 20;

-- Q12: Vérifier l’index anti double booking exact (afficher index)
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname='public' AND tablename='reservations';
