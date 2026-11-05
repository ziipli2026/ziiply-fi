CREATE TABLE IF NOT EXISTS guide_accounts (
 username text PRIMARY KEY,
 password_salt text NOT NULL,
 password_hash text NOT NULL,
 role text NOT NULL CHECK (role IN ('media','beta')),
 enabled boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS guide_sessions (
 token_hash text PRIMARY KEY,
 username text NOT NULL REFERENCES guide_accounts(username) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS guide_sessions_expires_idx ON guide_sessions(expires_at);

CREATE TABLE IF NOT EXISTS guide_login_limits (
 username text PRIMARY KEY,
 attempts integer NOT NULL DEFAULT 0,
 window_start timestamptz NOT NULL DEFAULT now(),
 locked_until timestamptz
);
CREATE INDEX IF NOT EXISTS guide_login_limits_locked_idx ON guide_login_limits(locked_until);

CREATE TABLE IF NOT EXISTS guide_assets (
 asset_name text PRIMARY KEY,
 mime_type text NOT NULL CHECK (mime_type IN ('image/png','image/jpeg','image/webp','image/gif')),
 contents bytea NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guide_pages (
 page_key text PRIMARY KEY,
 html text NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now()
);
