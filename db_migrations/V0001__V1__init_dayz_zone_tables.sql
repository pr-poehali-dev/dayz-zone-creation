CREATE TABLE IF NOT EXISTS t_p72153263_dayz_zone_creation.users (
  id TEXT PRIMARY KEY,
  discord_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  email TEXT DEFAULT '',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p72153263_dayz_zone_creation.sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

CREATE TABLE IF NOT EXISTS t_p72153263_dayz_zone_creation.news (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tag TEXT NOT NULL DEFAULT 'Новость',
  color TEXT NOT NULL DEFAULT '#00ff88',
  author_name TEXT DEFAULT 'Admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p72153263_dayz_zone_creation.orders (
  id TEXT PRIMARY KEY,
  client_id TEXT,
  client_name TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  budget TEXT DEFAULT '',
  deadline TEXT DEFAULT '',
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p72153263_dayz_zone_creation.order_reports (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Admin',
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p72153263_dayz_zone_creation.tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  client_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p72153263_dayz_zone_creation.ticket_replies (
  id SERIAL PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
