-- BeautyConnect - PostgreSQL schema
-- 001_init.sql

BEGIN;

CREATE EXTENSION IF NOT EXISTS citext;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('client', 'pro');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pro_status') THEN
    CREATE TYPE pro_status AS ENUM ('salon', 'freelance');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pro_experience') THEN
    CREATE TYPE pro_experience AS ENUM ('<1 an', '1 an', '2+ ans', '5+ ans');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_category') THEN
    CREATE TYPE post_category AS ENUM ('Coiffure', 'Esthetique', 'Tatouage', 'Maquillage', 'Autre');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status') THEN
    CREATE TYPE reservation_status AS ENUM ('pending','accepted','rejected','cancelled','confirmed','completed');
  END IF;
END$$;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL CHECK (length(trim(name)) > 0),
  email         CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  phone         TEXT NOT NULL DEFAULT '',
  role          user_role NOT NULL DEFAULT 'client',
  active_role   user_role NOT NULL DEFAULT 'client',

  city          TEXT NOT NULL DEFAULT '',
  country       TEXT NOT NULL DEFAULT '',
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,

  avatar_client TEXT NOT NULL DEFAULT '',
  avatar_pro    TEXT NOT NULL DEFAULT '',

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- PRO PROFILES
CREATE TABLE IF NOT EXISTS pro_profiles (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  business_name   TEXT NOT NULL DEFAULT '',
  siret           TEXT NOT NULL DEFAULT '',
  status          pro_status NOT NULL DEFAULT 'freelance',
  experience      pro_experience NOT NULL DEFAULT '<1 an',
  header_image    TEXT NOT NULL DEFAULT '',

  city            TEXT NOT NULL DEFAULT '',
  country         TEXT NOT NULL DEFAULT '',
  address         TEXT NOT NULL DEFAULT '',
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pro_profiles_city ON pro_profiles(city);

CREATE TABLE IF NOT EXISTS pro_profile_categories (
  pro_profile_id BIGINT NOT NULL REFERENCES pro_profiles(id) ON DELETE CASCADE,
  label          TEXT NOT NULL,
  PRIMARY KEY (pro_profile_id, label)
);

CREATE TABLE IF NOT EXISTS pro_profile_exercise_types (
  pro_profile_id BIGINT NOT NULL REFERENCES pro_profiles(id) ON DELETE CASCADE,
  label          TEXT NOT NULL,
  PRIMARY KEY (pro_profile_id, label)
);

-- FOLLOW
CREATE TABLE IF NOT EXISTS follows (
  follower_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followee_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id),
  CONSTRAINT chk_no_self_follow CHECK (follower_id <> followee_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_followee ON follows(followee_id);

-- SERVICES
CREATE TABLE IF NOT EXISTS services (
  id           BIGSERIAL PRIMARY KEY,
  pro_user_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL CHECK (length(trim(name)) > 0),
  price        NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  duration_min INT NOT NULL CHECK (duration_min >= 1),
  description  TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_services_pro ON services(pro_user_id);

-- AVAILABILITY
CREATE TABLE IF NOT EXISTS availability_rules (
  id          BIGSERIAL PRIMARY KEY,
  pro_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  enabled     BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (pro_user_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS availability_slots (
  id         BIGSERIAL PRIMARY KEY,
  rule_id    BIGINT NOT NULL REFERENCES availability_rules(id) ON DELETE CASCADE,
  start_time TIME NOT NULL,
  end_time   TIME NOT NULL,
  CONSTRAINT chk_slot_time CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_availability_slots_rule ON availability_slots(rule_id);

-- POSTS
CREATE TABLE IF NOT EXISTS posts (
  id               BIGSERIAL PRIMARY KEY,
  provider_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_url        TEXT NOT NULL,
  description      TEXT NOT NULL DEFAULT '' CHECK (length(description) <= 500),
  category         post_category NOT NULL DEFAULT 'Autre',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_provider_created ON posts(provider_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS post_likes (
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_favorites (
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_favorites_user ON post_favorites(user_id);

-- RESERVATIONS
CREATE TABLE IF NOT EXISTS reservations (
  id             BIGSERIAL PRIMARY KEY,
  client_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pro_user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id     BIGINT REFERENCES services(id) ON DELETE SET NULL,

  service_name   TEXT NOT NULL,
  price          NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  duration_min   INT NOT NULL CHECK (duration_min >= 1),

  start_at       TIMESTAMPTZ NOT NULL,
  location       TEXT,
  notes          TEXT NOT NULL DEFAULT '',
  status         reservation_status NOT NULL DEFAULT 'pending',

  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reservations_pro_start ON reservations(pro_user_id, start_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_client_start ON reservations(client_user_id, start_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

-- Anti double-booking exact (même pro + même start_at) sur statuts actifs
CREATE UNIQUE INDEX IF NOT EXISTS uq_reservations_pro_start_exact
ON reservations(pro_user_id, start_at)
WHERE status IN ('pending','accepted','confirmed');

COMMIT;
