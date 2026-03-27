-- INVENTIA Admin Schema
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies
CREATE TABLE IF NOT EXISTS public.companies (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT UNIQUE,
  name         TEXT NOT NULL,
  owner_email  TEXT NOT NULL,
  owner_name   TEXT,
  plan         TEXT NOT NULL DEFAULT 'free',
  status       TEXT NOT NULL DEFAULT 'active',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Platform users (synced from Firebase)
CREATE TABLE IF NOT EXISTS public.platform_users (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT UNIQUE NOT NULL,
  company_id   UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  email        TEXT NOT NULL,
  display_name TEXT,
  role         TEXT NOT NULL DEFAULT 'admin',
  status       TEXT NOT NULL DEFAULT 'active',
  last_login   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin profiles (Supabase auth users)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Company modules (feature flags)
CREATE TABLE IF NOT EXISTS public.company_modules (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  enabled    BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, module_key)
);

-- Audit log
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id    UUID REFERENCES auth.users(id),
  action      TEXT NOT NULL,
  target_type TEXT,
  target_id   TEXT,
  payload     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: all tables blocked from direct client access (service_role bypasses RLS)
ALTER TABLE public.companies         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_modules   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles    ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_platform_users_company ON public.platform_users(company_id);
CREATE INDEX IF NOT EXISTS idx_platform_users_firebase ON public.platform_users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);
CREATE INDEX IF NOT EXISTS idx_company_modules_company ON public.company_modules(company_id);

-- Insert initial modules for demo company
-- (Run after creating companies via the admin panel)
