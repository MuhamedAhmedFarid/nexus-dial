-- ============================================================
-- NexusDial — Initial Schema (Multi-Tenant)
-- ============================================================

-- TENANTS
CREATE TABLE public.tenants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  notes         TEXT,
  suspended_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- USERS (portal logins — extends auth.users)
CREATE TABLE public.users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id     UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  email         TEXT,
  name          TEXT NOT NULL,
  alias         TEXT,
  role          TEXT NOT NULL CHECK (role IN ('OWNER','ADMIN','HR','BILLING','PAYROLL','AGENT')),
  is_active     BOOLEAN DEFAULT TRUE,
  is_superadmin BOOLEAN DEFAULT FALSE,
  agent_id      TEXT,
  phone         TEXT,
  hourly_rate   NUMERIC(10,2) DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- EMPLOYEES (HR-managed — may have portal login or not)
CREATE TABLE public.employees (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES public.users(id) ON DELETE SET NULL,
  full_name         TEXT NOT NULL,
  email             TEXT,
  phone             TEXT,
  position          TEXT,
  department        TEXT,
  hire_date         DATE,
  termination_date  DATE,
  hourly_rate       NUMERIC(10,2),
  payment_method    TEXT,
  payment_details   JSONB,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- TIME OFF REQUESTS
CREATE TABLE public.time_off_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id  UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  reason       TEXT,
  status       TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','DENIED')),
  approved_by  UUID REFERENCES public.users(id),
  approved_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- CUSTOMERS (Billing)
CREATE TABLE public.customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  address       TEXT,
  billing_email TEXT,
  notes         TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- INVOICES
CREATE TABLE public.invoices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  customer_id    UUID REFERENCES public.customers(id) ON DELETE RESTRICT,
  invoice_number TEXT NOT NULL,
  amount_usd     NUMERIC(12,2) NOT NULL,
  currency       TEXT NOT NULL DEFAULT 'USD',
  status         TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','SENT','PAID','OVERDUE','CANCELLED')),
  due_date       DATE,
  sent_at        TIMESTAMPTZ,
  paid_at        TIMESTAMPTZ,
  notes          TEXT,
  line_items     JSONB,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, invoice_number)
);

-- PAYROLL ENTRIES
CREATE TABLE public.payroll_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id  UUID REFERENCES public.employees(id) ON DELETE RESTRICT,
  period_start DATE NOT NULL,
  period_end   DATE NOT NULL,
  hours_worked NUMERIC(10,2),
  hourly_rate  NUMERIC(10,2),
  base_pay     NUMERIC(12,2),
  bonus        NUMERIC(12,2) DEFAULT 0,
  deduction    NUMERIC(12,2) DEFAULT 0,
  net_owed     NUMERIC(12,2),
  is_paid      BOOLEAN DEFAULT FALSE,
  paid_at      TIMESTAMPTZ,
  batch_id     UUID,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENT BATCHES
CREATE TABLE public.payment_batches (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  batch_name   TEXT NOT NULL,
  total_amount NUMERIC(12,2),
  egp_rate     NUMERIC(10,4),
  status       TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PAID','CANCELLED')),
  notes        TEXT,
  created_by   UUID REFERENCES public.users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  paid_at      TIMESTAMPTZ
);

-- AGENT PERFORMANCE DAILY
CREATE TABLE public.agent_performance_daily (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id        TEXT NOT NULL,
  sync_date       DATE NOT NULL,
  calls           INT DEFAULT 0,
  talk_seconds    INT DEFAULT 0,
  wait_seconds    INT DEFAULT 0,
  meetings_booked INT DEFAULT 0,
  dispos          JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, agent_id, sync_date)
);

-- AUDIT LOG
CREATE TABLE public.audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID REFERENCES public.tenants(id),
  actor_id    UUID REFERENCES public.users(id),
  action      TEXT NOT NULL,
  target_type TEXT,
  target_id   UUID,
  payload     JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- SYNC FAILURES
CREATE TABLE public.sync_failures (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  source      TEXT NOT NULL,
  target_id   UUID,
  error_text  TEXT NOT NULL,
  retried_at  TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  payload     JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Enable RLS on every table
-- ============================================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_performance_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_failures ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper: get current user's profile row
-- ============================================================
CREATE OR REPLACE FUNCTION public.current_user_profile()
RETURNS public.users
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT * FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- ============================================================
-- RLS Policies
-- ============================================================

-- TENANTS: only superadmin can see all; regular users see their own
CREATE POLICY "superadmin_all_tenants" ON public.tenants FOR ALL
  USING ((SELECT is_superadmin FROM public.users WHERE auth_user_id = auth.uid()));

-- USERS: see own tenant's users OR superadmin sees all
CREATE POLICY "tenant_users_select" ON public.users FOR SELECT
  USING (
    (SELECT is_superadmin FROM public.users WHERE auth_user_id = auth.uid())
    OR tenant_id = (SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "superadmin_users_all" ON public.users FOR ALL
  USING ((SELECT is_superadmin FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "own_user_insert" ON public.users FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- EMPLOYEES: HR/OWNER/ADMIN of same tenant, or superadmin
CREATE POLICY "employees_tenant" ON public.employees FOR ALL
  USING (
    (SELECT is_superadmin FROM public.users WHERE auth_user_id = auth.uid())
    OR (
      tenant_id = (SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid())
      AND (SELECT role FROM public.users WHERE auth_user_id = auth.uid()) IN ('OWNER','ADMIN','HR')
    )
  );

-- TIME OFF: HR/ADMIN/OWNER of same tenant can see all; AGENT sees own
CREATE POLICY "time_off_tenant" ON public.time_off_requests FOR ALL
  USING (
    (SELECT is_superadmin FROM public.users WHERE auth_user_id = auth.uid())
    OR tenant_id = (SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid())
  );

-- CUSTOMERS: BILLING/ADMIN/OWNER of same tenant
CREATE POLICY "customers_tenant" ON public.customers FOR ALL
  USING (
    (SELECT is_superadmin FROM public.users WHERE auth_user_id = auth.uid())
    OR (
      tenant_id = (SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid())
      AND (SELECT role FROM public.users WHERE auth_user_id = auth.uid()) IN ('OWNER','ADMIN','BILLING')
    )
  );

-- INVOICES: BILLING/ADMIN/OWNER of same tenant
CREATE POLICY "invoices_tenant" ON public.invoices FOR ALL
  USING (
    (SELECT is_superadmin FROM public.users WHERE auth_user_id = auth.uid())
    OR (
      tenant_id = (SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid())
      AND (SELECT role FROM public.users WHERE auth_user_id = auth.uid()) IN ('OWNER','ADMIN','BILLING')
    )
  );

-- PAYROLL: PAYROLL/ADMIN/OWNER of same tenant
CREATE POLICY "payroll_entries_tenant" ON public.payroll_entries FOR ALL
  USING (
    (SELECT is_superadmin FROM public.users WHERE auth_user_id = auth.uid())
    OR (
      tenant_id = (SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid())
      AND (SELECT role FROM public.users WHERE auth_user_id = auth.uid()) IN ('OWNER','ADMIN','PAYROLL')
    )
  );

CREATE POLICY "payment_batches_tenant" ON public.payment_batches FOR ALL
  USING (
    (SELECT is_superadmin FROM public.users WHERE auth_user_id = auth.uid())
    OR (
      tenant_id = (SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid())
      AND (SELECT role FROM public.users WHERE auth_user_id = auth.uid()) IN ('OWNER','ADMIN','PAYROLL')
    )
  );

-- AGENT PERFORMANCE: all can see own tenant's
CREATE POLICY "perf_tenant" ON public.agent_performance_daily FOR ALL
  USING (
    (SELECT is_superadmin FROM public.users WHERE auth_user_id = auth.uid())
    OR tenant_id = (SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid())
  );

-- AUDIT LOG: ADMIN/OWNER of same tenant
CREATE POLICY "audit_tenant" ON public.audit_log FOR SELECT
  USING (
    (SELECT is_superadmin FROM public.users WHERE auth_user_id = auth.uid())
    OR (
      tenant_id = (SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid())
      AND (SELECT role FROM public.users WHERE auth_user_id = auth.uid()) IN ('OWNER','ADMIN')
    )
  );

CREATE POLICY "audit_insert" ON public.audit_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- SYNC FAILURES: ADMIN/OWNER of same tenant
CREATE POLICY "sync_failures_tenant" ON public.sync_failures FOR ALL
  USING (
    (SELECT is_superadmin FROM public.users WHERE auth_user_id = auth.uid())
    OR (
      tenant_id = (SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid())
      AND (SELECT role FROM public.users WHERE auth_user_id = auth.uid()) IN ('OWNER','ADMIN')
    )
  );

-- ============================================================
-- Trigger: auto-create public.users on auth.users signup
-- (role defaults to AGENT; promote manually via SQL or SuperAdmin)
-- NOTE: disabled for now since we use invite-only flow.
-- Enable if you want auto-provisioning on first OAuth login.
-- ============================================================
-- CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
-- RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
-- BEGIN
--   INSERT INTO public.users (auth_user_id, name, email, role, tenant_id)
--   VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), NEW.email, 'AGENT', NULL)
--   ON CONFLICT (auth_user_id) DO NOTHING;
--   RETURN NEW;
-- END;
-- $$;
-- CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER agent_perf_updated_at BEFORE UPDATE ON public.agent_performance_daily FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
