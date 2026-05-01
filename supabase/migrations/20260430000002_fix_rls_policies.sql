-- ============================================================
-- RLS Policy Fix: replace recursive subqueries with
-- SECURITY DEFINER helper functions to avoid infinite recursion
-- when public.users policies query the same table.
-- ============================================================

-- Helper functions (bypass RLS on public.users when called)
CREATE OR REPLACE FUNCTION public._is_superadmin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT COALESCE((SELECT is_superadmin FROM public.users WHERE auth_user_id = auth.uid()), false)
$$;

CREATE OR REPLACE FUNCTION public._my_tenant_id()
RETURNS UUID LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public._my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT role FROM public.users WHERE auth_user_id = auth.uid()
$$;

-- ── public.users ─────────────────────────────────────────────
DROP POLICY IF EXISTS "tenant_users_select"      ON public.users;
DROP POLICY IF EXISTS "superadmin_users_all"     ON public.users;
DROP POLICY IF EXISTS "own_user_insert"          ON public.users;

CREATE POLICY "users_self_select" ON public.users FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "users_tenant_select" ON public.users FOR SELECT
  USING (public._is_superadmin() OR tenant_id = public._my_tenant_id());

CREATE POLICY "users_superadmin_all" ON public.users FOR ALL
  USING (public._is_superadmin());

CREATE POLICY "users_insert_authenticated" ON public.users FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "users_self_update" ON public.users FOR UPDATE
  USING (auth_user_id = auth.uid());

-- ── public.tenants ───────────────────────────────────────────
DROP POLICY IF EXISTS "superadmin_all_tenants" ON public.tenants;

CREATE POLICY "tenants_own_or_superadmin" ON public.tenants FOR SELECT
  USING (public._is_superadmin() OR id = public._my_tenant_id());

CREATE POLICY "tenants_superadmin_write" ON public.tenants FOR ALL
  USING (public._is_superadmin());

-- ── public.employees ─────────────────────────────────────────
DROP POLICY IF EXISTS "employees_tenant" ON public.employees;
CREATE POLICY "employees_tenant" ON public.employees FOR ALL
  USING (
    public._is_superadmin()
    OR (tenant_id = public._my_tenant_id() AND public._my_role() IN ('OWNER','ADMIN','HR'))
  );

-- ── public.time_off_requests ─────────────────────────────────
DROP POLICY IF EXISTS "time_off_tenant" ON public.time_off_requests;
CREATE POLICY "time_off_tenant" ON public.time_off_requests FOR ALL
  USING (public._is_superadmin() OR tenant_id = public._my_tenant_id());

-- ── public.customers ─────────────────────────────────────────
DROP POLICY IF EXISTS "customers_tenant" ON public.customers;
CREATE POLICY "customers_tenant" ON public.customers FOR ALL
  USING (
    public._is_superadmin()
    OR (tenant_id = public._my_tenant_id() AND public._my_role() IN ('OWNER','ADMIN','BILLING'))
  );

-- ── public.invoices ──────────────────────────────────────────
DROP POLICY IF EXISTS "invoices_tenant" ON public.invoices;
CREATE POLICY "invoices_tenant" ON public.invoices FOR ALL
  USING (
    public._is_superadmin()
    OR (tenant_id = public._my_tenant_id() AND public._my_role() IN ('OWNER','ADMIN','BILLING'))
  );

-- ── public.payroll_entries ───────────────────────────────────
DROP POLICY IF EXISTS "payroll_entries_tenant" ON public.payroll_entries;
CREATE POLICY "payroll_entries_tenant" ON public.payroll_entries FOR ALL
  USING (
    public._is_superadmin()
    OR (tenant_id = public._my_tenant_id() AND public._my_role() IN ('OWNER','ADMIN','PAYROLL'))
  );

-- ── public.payment_batches ───────────────────────────────────
DROP POLICY IF EXISTS "payment_batches_tenant" ON public.payment_batches;
CREATE POLICY "payment_batches_tenant" ON public.payment_batches FOR ALL
  USING (
    public._is_superadmin()
    OR (tenant_id = public._my_tenant_id() AND public._my_role() IN ('OWNER','ADMIN','PAYROLL'))
  );

-- ── public.agent_performance_daily ──────────────────────────
DROP POLICY IF EXISTS "perf_tenant" ON public.agent_performance_daily;
CREATE POLICY "perf_tenant" ON public.agent_performance_daily FOR ALL
  USING (public._is_superadmin() OR tenant_id = public._my_tenant_id());

-- ── public.audit_log ─────────────────────────────────────────
DROP POLICY IF EXISTS "audit_tenant" ON public.audit_log;
DROP POLICY IF EXISTS "audit_insert" ON public.audit_log;
CREATE POLICY "audit_tenant" ON public.audit_log FOR SELECT
  USING (
    public._is_superadmin()
    OR (tenant_id = public._my_tenant_id() AND public._my_role() IN ('OWNER','ADMIN'))
  );
CREATE POLICY "audit_insert" ON public.audit_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ── public.sync_failures ─────────────────────────────────────
DROP POLICY IF EXISTS "sync_failures_tenant" ON public.sync_failures;
CREATE POLICY "sync_failures_tenant" ON public.sync_failures FOR ALL
  USING (
    public._is_superadmin()
    OR (tenant_id = public._my_tenant_id() AND public._my_role() IN ('OWNER','ADMIN'))
  );
