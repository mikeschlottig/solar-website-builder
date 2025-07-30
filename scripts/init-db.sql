-- Solar Website Builder - Database Initialization
-- This file is automatically run when PostgreSQL container starts

-- Create development database if not exists
SELECT 'CREATE DATABASE solar_dev' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'solar_dev')\gexec

-- Connect to solar_dev database
\c solar_dev;

-- Create basic schema (tables will be created by application)
CREATE SCHEMA IF NOT EXISTS public;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE solar_dev TO "user";
GRANT ALL PRIVILEGES ON SCHEMA public TO "user";

-- Log initialization
SELECT 'Solar Website Builder database initialized successfully' as status;