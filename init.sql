-- Initialize database for SensiLog
-- This script creates basic extensions and initial setup

-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create basic indexes that might be helpful
-- (The actual schema will be created by Drizzle migrations)