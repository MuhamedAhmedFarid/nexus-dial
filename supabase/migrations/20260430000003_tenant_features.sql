-- Per-tenant feature flags: SuperAdmin can enable/disable modules per client.
-- Default: all features enabled.
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS features JSONB NOT NULL
  DEFAULT '{"hr":true,"billing":true,"payroll":true,"dialer":true}'::jsonb;

UPDATE public.tenants
SET features = '{"hr":true,"billing":true,"payroll":true,"dialer":true}'::jsonb
WHERE features IS NULL;
