PRAGMA foreign_keys = ON;

BEGIN;

-- === Company ===
CREATE TABLE IF NOT EXISTS company (
  id           INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  address      TEXT
);

-- === User ===
-- 'role' is modeled as TEXT here (enum in ERD). You can later convert it to a lookup table if desired.
CREATE TABLE IF NOT EXISTS user (
  id             INTEGER PRIMARY KEY,
  name           TEXT NOT NULL,
  role           TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  phone_number   TEXT,
  password_hash  TEXT NOT NULL,
  company_id     INTEGER,
  job_title      TEXT,
  FOREIGN KEY (company_id) REFERENCES company(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

-- Useful index for queries by company
CREATE INDEX IF NOT EXISTS idx_user_company ON user(company_id);

-- === Team ===
CREATE TABLE IF NOT EXISTS team (
  id       INTEGER PRIMARY KEY,
  name     TEXT NOT NULL,
  lead_id  INTEGER,
  member_ids TEXT NOT NULL DEFAULT '[]', -- JSON array of user IDs
  FOREIGN KEY (lead_id) REFERENCES user(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

-- === Room ===
CREATE TABLE IF NOT EXISTS room (
  id          INTEGER PRIMARY KEY,
  capacity    INTEGER,
  location    TEXT,
  company_id  INTEGER NOT NULL,
  FOREIGN KEY (company_id) REFERENCES company(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_room_company ON room(company_id);

-- === Event ===
-- Date/time values are stored as ISO 8601 TEXT; CHECK uses julianday for validity.
CREATE TABLE IF NOT EXISTS event (
  id            INTEGER PRIMARY KEY,
  start_time    TEXT NOT NULL,  -- ISO 8601 e.g. '2025-11-07 09:00:00'
  end_time      TEXT NOT NULL,
  description   TEXT,
  name          TEXT NOT NULL,
  organizer_id  INTEGER,
  attendee_ids  TEXT NOT NULL DEFAULT '[]', -- JSON array of user IDs
  room_ids      TEXT NOT NULL DEFAULT '[]', -- JSON array of room IDs
  CHECK (julianday(end_time) >= julianday(start_time)),
  FOREIGN KEY (organizer_id) REFERENCES user(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_event_organizer ON event(organizer_id);
CREATE INDEX IF NOT EXISTS idx_event_start_time ON event(start_time);

COMMIT;
