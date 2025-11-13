-- apps/api/scripts/create-schema.sql
-- Creates base schema for the task-management app.
-- Run this with the apply-schema.js script or with psql.

-- Enable pgcrypto extension for gen_random_uuid() if not present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create or ensure the application schema exists. We'll create a dedicated schema
-- so the app objects live under `task_management` instead of the default public schema.
CREATE SCHEMA IF NOT EXISTS task_management;

-- Use the application schema first so subsequent CREATE TABLE statements
-- create objects inside `task_management`.
SET search_path = task_management, public;

-- Organization table
CREATE TABLE IF NOT EXISTS organization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  "parentId" uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Users table
CREATE TABLE IF NOT EXISTS "user" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  email text,
  "passwordHash" text,
  role text NOT NULL DEFAULT 'user',
  "organizationId" uuid REFERENCES organization(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tasks table (owned by organization)
CREATE TABLE IF NOT EXISTS task (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status integer NOT NULL DEFAULT 0,
  "ownerId" uuid REFERENCES organization(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Audit table
CREATE TABLE IF NOT EXISTS audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  meta jsonb NULL,
  "actorId" uuid REFERENCES "user"(id) ON DELETE SET NULL,
  "orgId" uuid REFERENCES organization(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes that may improve list queries
CREATE INDEX IF NOT EXISTS idx_user_org ON "user" ("organizationId");
CREATE INDEX IF NOT EXISTS idx_task_owner ON task ("ownerId");
CREATE INDEX IF NOT EXISTS idx_audit_org ON audit ("orgId");
