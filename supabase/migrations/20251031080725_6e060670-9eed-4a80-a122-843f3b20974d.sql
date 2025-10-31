-- Add posting_webhook_url column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS posting_webhook_url TEXT;