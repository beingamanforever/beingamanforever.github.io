-- Supabase Database Schema for Visitor Analytics
-- Run this in your Supabase SQL Editor

-- Create visitors table
CREATE TABLE IF NOT EXISTS visitors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    geo_source VARCHAR(16), -- 'gps' | 'ip'
    geo_accuracy_m INTEGER,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    screen_resolution VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id VARCHAR(255),
    ip_hash VARCHAR(64) -- Hashed for privacy
);

-- Backfill-safe migrations for existing tables
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS geo_source VARCHAR(16);
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS geo_accuracy_m INTEGER;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_visitors_timestamp ON visitors(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_page ON visitors(page);
CREATE INDEX IF NOT EXISTS idx_visitors_country ON visitors(country);

-- Enable Row Level Security (RLS)
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for tracking)
CREATE POLICY "Allow public inserts" ON visitors
    FOR INSERT TO anon
    WITH CHECK (true);

-- Create policy to allow authenticated reads (for dashboard)
CREATE POLICY "Allow authenticated reads" ON visitors
    FOR SELECT TO authenticated
    USING (true);

-- Create view for analytics summary
CREATE OR REPLACE VIEW visitor_analytics AS
SELECT 
    DATE(timestamp) as date,
    COUNT(*) as total_visits,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT country) as countries,
    page,
    country,
    city,
    device_type,
    browser
FROM visitors
GROUP BY DATE(timestamp), page, country, city, device_type, browser
ORDER BY date DESC;
