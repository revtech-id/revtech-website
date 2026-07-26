-- Migration: Upgrade admin_activity_logs table for severity
ALTER TABLE public.admin_activity_logs
  ADD COLUMN IF NOT EXISTS severity TEXT NOT NULL DEFAULT 'INFO';
