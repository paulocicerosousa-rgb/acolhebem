CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  guest_name TEXT NOT NULL,
  room TEXT NOT NULL,
  checkin DATE NOT NULL,
  checkout DATE NOT NULL,
  status TEXT NOT NULL,
  source_updated_at TIMESTAMPTZ,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reservations_dates_idx ON reservations (checkin, checkout);
