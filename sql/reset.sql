BEGIN;

TRUNCATE TABLE
  post_favorites,
  post_likes,
  posts,
  reservations,
  availability_slots,
  availability_rules,
  services,
  follows,
  pro_profile_categories,
  pro_profile_exercise_types,
  pro_profiles,
  users
RESTART IDENTITY CASCADE;

COMMIT;
