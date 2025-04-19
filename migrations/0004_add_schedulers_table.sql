-- Create schedulers table
CREATE TABLE IF NOT EXISTS schedulers (
    id UUID PRIMARY KEY,
    user_address TEXT NOT NULL REFERENCES users(address) ON DELETE CASCADE,
    trigger_running_id TEXT,
    current_day INTEGER,
    total_days INTEGER,
    content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Remove old fields from users table (only if they exist)
ALTER TABLE users DROP COLUMN IF EXISTS quiz_current_day;
ALTER TABLE users DROP COLUMN IF EXISTS quiz_total_days;
ALTER TABLE users DROP COLUMN IF EXISTS quiz_content;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_schedulers_user_address ON schedulers(user_address);
