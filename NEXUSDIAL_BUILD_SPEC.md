# NexusDial Portal — Build Specification

> **For Claude Code:** This document is the complete spec for bootstrapping
> the NexusDial operations portal. Read top-to-bottom before writing any
> code. The build sequence in §10 is the order to actually execute.

---

## 0. TL;DR

Build a multi-module operations portal for **Nexus Dial** (an Elite Virtual
Assistant Agency). The portal provides HR, Billing, Payroll, and a Team
Performance Dashboard, with a foundation laid for connecting a dialer
later (vendor TBD).

**Tech stack:** Vite + React 19 + TypeScript + Tailwind + shadcn/ui +
Supabase (Postgres + Auth + Edge Functions + Storage) + Vercel (frontend
hosting). Optional Railway-hosted Python workers if needed for cron.

**Design language:** Dark navy + vibrant green (extracted from
nexuxdial.netlify.app — see §3). Modern SaaS aesthetic, Inter typeface,
high-contrast, minimal.

**Architecture:** Multi-portal pattern with shared base layouts and
role-gated routing. Edge functions own all privileged operations; the
client never sees a service role key.

**This spec is derived from a sister project** (Sunflower Solar Portal)
that has 30+ session-hours of hard-earned lessons baked in. The
"Patterns to copy" (§7) and "Anti-patterns to avoid" (§8) sections are
the highest-leverage parts of this document — they will save weeks of
debugging.

---

## 1. Project Context

**Client:** Nexus Dial — an Elite Virtual Assistant Agency
**Product:** Internal operations portal for the team
**Initial scope (MVP):** HR · Billing · Payroll · Team Dashboard
**Future scope:** Dialer integration (vendor TBD), client portal, SMS reminders

**Tenancy decision (REQUIRED CLARIFICATION FROM USER):**
Single-tenant (one Nexus Dial company) OR multi-tenant (Nexus Dial agency
manages multiple sub-clients with isolated data)? **Default: single-tenant**.
If multi-tenant, every domain table needs an `org_id` foreign key and RLS
policies that scope to it. Adding this later is painful — decide day 1.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Build tool | Vite 5+ | Fast HMR, ESM-native |
| UI library | React 19 | Latest stable, Suspense improvements |
| Language | TypeScript (strict) | No `any` unless commented why |
| Styling | Tailwind CSS 3+ | Utility-first, with shadcn theme |
| UI primitives | shadcn/ui | Copy-paste components, Radix-based |
| Icons | lucide-react | Match Sunflower's conventions |
| Toasts | sonner | Same library, same patterns |
| Forms | React Hook Form + Zod | Optional — start with controlled state, upgrade later |
| Backend | Supabase | Postgres, Auth, Edge Functions (Deno), Storage |
| Frontend hosting | Vercel | Auto-deploy from `main` branch |
| Cron / workers | Railway (Python) | Only if needed; Supabase pg_cron covers a lot |
| Auth method | Supabase Auth | Email + password OR magic-link OR OAuth |
| Date library | date-fns | Avoid moment.js (deprecated, heavy) |
| Tables | TanStack Table v8 | Use only when you need sorting/pagination/filtering at scale |

---

## 3. Brand & Design System (extracted from live site)

### Color tokens (use these in `tailwind.config.js`)

```js
// tailwind.config.js — extend.colors
{
  // Primary brand
  primary: {
    DEFAULT: '#22c55e',  // Tailwind green-500 — CTAs, focus rings, links
    foreground: '#0a1628',
  },
  // Surfaces (dark mode primary)
  background: '#0a1628',  // page background — deep navy
  card:       '#0f2040',  // cards, modals, surfaces
  secondary:  '#162952',  // hover state, secondary surfaces
  // Borders
  border:     'rgba(255,255,255,0.1)',  // 10% white — subtle dividers
  input:      'rgba(255,255,255,0.1)',
  // Text
  foreground:       '#ffffff',
  'muted-foreground': '#94a3b8',  // slate-400
  // Accent — for highlights, badges
  accent: {
    DEFAULT: '#dcfce7',  // green-100 — light backgrounds for badges
    foreground: '#14532d', // green-900 — text on light accent
  },
  // Destructive
  destructive: '#ef4444',  // Tailwind red-500
  // Focus ring
  ring: '#22c55e',
}
```

### Typography

- **Font:** `Inter, sans-serif` (system fallback)
- **Weights used:** 400 / 500 / 600 / 700 / 800
- **Line heights:** tight (1.25), snug (1.375), relaxed (1.625)

### Component conventions

- **Border radius:** `0.75rem` (12px) for cards, `0.6rem` for buttons
- **Shadows:** subtle (`shadow-md` for cards, `shadow-xl` for modals)
- **Transitions:** 150ms ease (Tailwind default `transition-colors`, `transition-all`)
- **Backdrop blur:** 12px on modal overlays (`backdrop-blur-[12px]`)

### Design mood

Dark-mode primary, modern SaaS. Think Vercel/Linear/Anthropic console
aesthetic. High contrast, subtle borders, vibrant green CTAs against
deep navy. Cards have a slight elevation via `bg-card` (lighter than
background) rather than a heavy shadow.

---

## 4. Project Structure

Mirror Sunflower's layout but simpler at start:

```
nexusdial/
├── src/
│   ├── auth/                    # AuthContext, login pages, route guards
│   ├── components/
│   │   └── ui/                  # shadcn components (button, card, dialog, etc.)
│   ├── portals/
│   │   ├── shared/              # Components used by 2+ portals (LeadsTab pattern)
│   │   ├── admin/               # Admin/owner portal (full access)
│   │   ├── hr/                  # HR-only portal
│   │   ├── billing/             # Billing-only portal
│   │   ├── payroll/             # Payroll-only portal
│   │   └── agent/               # Agent (frontline) portal — sees own data only
│   ├── features/
│   │   ├── dashboard/           # Team performance dashboard
│   │   ├── employees/           # HR module: employee CRUD
│   │   ├── invoices/            # Billing module
│   │   ├── payroll/             # Payroll module
│   │   └── dialer/              # Dialer abstraction layer (no real connection yet)
│   ├── ui/                      # App-level shell components (Layout, Sidebar)
│   ├── utils/                   # Pure functions (timezone, formatters)
│   ├── lib/                     # supabase client, cn() helper, etc.
│   ├── types/                   # Shared TypeScript types
│   ├── App.tsx
│   └── index.tsx
├── supabase/
│   ├── functions/               # Edge functions, one folder per function
│   │   └── admin-actions/
│   │       └── index.ts
│   └── migrations/              # SQL migrations, timestamp-prefixed
├── public/
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── .env.example                 # SUPABASE_URL, SUPABASE_ANON_KEY (no secrets)
```

**Path alias:** Use `@/...` to point at `src/`. Configure in both
`tsconfig.json` (`paths`) and `vite.config.ts` (`resolve.alias`).

---

## 5. Database Schema (initial)

Apply via Supabase migrations (`supabase/migrations/<timestamp>_<name>.sql`).

### Core tables

```sql
-- USERS (extends Supabase Auth — links to auth.users via auth_user_id)
CREATE TABLE public.users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT,
  name         TEXT NOT NULL,
  alias        TEXT,                    -- public-facing display name
  role         TEXT NOT NULL,           -- enum-like, see CHECK below
  is_active    BOOLEAN DEFAULT TRUE,
  agent_id     TEXT,                    -- dialer-side agent ID (when integrated)
  phone        TEXT,
  hourly_rate  NUMERIC(10,2) DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),

  CHECK (role IN ('OWNER', 'ADMIN', 'HR', 'BILLING', 'PAYROLL', 'AGENT'))
);

-- EMPLOYEES (HR-managed records — may or may not have a portal login)
CREATE TABLE public.employees (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES public.users(id) ON DELETE SET NULL,
  full_name         TEXT NOT NULL,
  email             TEXT,
  phone             TEXT,
  position          TEXT,
  department        TEXT,
  hire_date         DATE,
  termination_date  DATE,
  hourly_rate       NUMERIC(10,2),
  payment_method    TEXT,             -- 'BANK', 'WIRE', 'PAYPAL', etc.
  payment_details   JSONB,            -- account info, encrypted client-side ideally
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- TIME OFF REQUESTS
CREATE TABLE public.time_off_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  name          TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  address       TEXT,
  billing_email TEXT,
  notes         TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- INVOICES (Billing)
CREATE TABLE public.invoices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID REFERENCES public.customers(id) ON DELETE RESTRICT,
  invoice_number TEXT UNIQUE NOT NULL,    -- e.g. "INV-2026-0042"
  amount_usd    NUMERIC(12,2) NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'USD',
  status        TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','SENT','PAID','OVERDUE','CANCELLED')),
  due_date      DATE,
  sent_at       TIMESTAMPTZ,
  paid_at       TIMESTAMPTZ,
  notes         TEXT,
  line_items    JSONB,                    -- [{description, qty, unit_price, total}]
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- PAYROLL ENTRIES
CREATE TABLE public.payroll_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID REFERENCES public.employees(id) ON DELETE RESTRICT,
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  hours_worked    NUMERIC(10,2),
  hourly_rate     NUMERIC(10,2),
  base_pay        NUMERIC(12,2),
  bonus           NUMERIC(12,2) DEFAULT 0,
  deduction       NUMERIC(12,2) DEFAULT 0,
  net_owed        NUMERIC(12,2),
  is_paid         BOOLEAN DEFAULT FALSE,
  paid_at         TIMESTAMPTZ,
  batch_id        UUID,                  -- groups entries paid together
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENT BATCHES (groups payroll_entries paid in one go)
CREATE TABLE public.payment_batches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_name    TEXT NOT NULL,
  total_amount  NUMERIC(12,2),
  egp_rate      NUMERIC(10,4),           -- if paying internationally; nullable
  status        TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PAID','CANCELLED')),
  notes         TEXT,
  created_by    UUID REFERENCES public.users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  paid_at       TIMESTAMPTZ
);

-- AGENT PERFORMANCE (dialer-side metrics — synced from external dialer later)
CREATE TABLE public.agent_performance_daily (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id     TEXT NOT NULL,           -- dialer-side ID
  sync_date    DATE NOT NULL,
  calls        INT DEFAULT 0,
  talk_seconds INT DEFAULT 0,
  wait_seconds INT DEFAULT 0,
  meetings_booked INT DEFAULT 0,
  dispos       JSONB,                    -- {"NI": 5, "CB": 3, "SET": 2}
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (agent_id, sync_date)
);

-- AUDIT LOG (every privileged action)
CREATE TABLE public.audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES public.users(id),
  action      TEXT NOT NULL,            -- e.g. 'employee.create', 'invoice.send'
  target_type TEXT,                     -- e.g. 'employee', 'invoice'
  target_id   UUID,
  payload     JSONB,                    -- before/after diff, free-form context
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS policies (turn ON for every table)

- **Default deny:** `ALTER TABLE x ENABLE ROW LEVEL SECURITY;` then add explicit policies.
- **Owner / Admin:** full access.
- **HR role:** read+write `employees`, `time_off_requests`. Read `users`. No payroll/billing access.
- **Billing role:** read+write `customers`, `invoices`. No HR/payroll.
- **Payroll role:** read+write `payroll_entries`, `payment_batches`. Read `employees`. No billing/HR-write.
- **Agent role:** read OWN row in `users`, OWN rows in `agent_performance_daily`, OWN `time_off_requests`. Nothing else.

Use `SECURITY DEFINER` Postgres functions for any cross-role action (e.g.,
"approve a time-off request" — needs to read employee + write request +
log audit, all atomically). Don't try to do this from the client.

---

## 6. Edge Functions (initial)

Mirror Sunflower's pattern: edge functions for any privileged action so
the service role key never reaches the browser.

| Function | Purpose |
|---|---|
| `admin-actions` | Catch-all for owner/admin actions: create user, toggle active, delete, edit. Same shape as Sunflower's. |
| `send-invoice` | Generate PDF, email customer, mark as sent, audit. |
| `payroll-batch` | Create a payment batch from selected entries, mark them as batched. |
| `dialer-webhook` | Receives webhooks from dialer (when integrated), upserts agent_performance_daily. Stub for now. |

**Auth on every edge function:**
```ts
const { data: { user }, error } = await userClient.auth.getUser();
if (error || !user) return json({ error: 'Unauthorized' }, 401);
const { data: profile } = await adminClient.from('users')
  .select('role, is_active').eq('auth_user_id', user.id).single();
if (!profile || !profile.is_active) return json({ error: 'Forbidden' }, 403);
// Then check role for the specific action.
```

---

## 7. Patterns to COPY from the sister project

These are battle-tested. Copy the patterns, not necessarily the code.

### a) Single timezone constant

```ts
// utils/timezone.ts
export const PORTAL_TZ = 'America/Los_Angeles'; // or Africa/Cairo, or UTC
export function formatPortalDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: PORTAL_TZ,
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }) + ' PT';
}
```
**Display all customer-facing times in PORTAL_TZ.** Storage is always UTC ISO.
Mirror this constant inside every edge function (Deno can't share modules
with the React app).

### b) Saga-pattern lite for multi-system writes

When an action touches Supabase + an external system (e.g., dialer + email):
1. Write to Supabase first (source of truth).
2. Fan out external writes IN PARALLEL.
3. Audit row records what succeeded/failed (`fanout_errors JSONB`).
4. If externals fail, the SoT is correct and a retry UI in admin can re-fire.

### c) Tolerant matching for external IDs

- **Phone numbers:** use `LIKE '%' || last10` not `eq('phone', x)`. Different sources
  have different formats (`+13135551212` vs `3135551212` vs `(313) 555-1212`).
- **Status labels from external systems:** lowercase + trim before comparing.
  Don't `eq('Status', 'Sold')` — use a normalized lookup map keyed by
  `'sold'`.

### d) Z-index hierarchy (commit to it day 1)

```
sticky headers, sidebars     z-10 to z-30
standard modals              z-50
"modal on top of modal"      z-[60]
layout drawers               z-[100]
date pickers / popovers IN modals    z-[200]
selects nested in popovers   z-[210]
```

### e) Defensive deploy = source = local

Every time you deploy an edge function, the local file should match the
deployed version exactly. We hit this twice: deployed via MCP, didn't
update local source, the next git push undid the fix. **Discipline:**
edit local → deploy from local → don't deploy ad-hoc patches.

### f) Audit + retry tables for every external integration

```sql
CREATE TABLE public.sync_failures (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source      TEXT NOT NULL,         -- 'invoice_send', 'dialer_sync', etc.
  target_id   UUID,                  -- the resource being synced
  error_text  TEXT NOT NULL,
  retried_at  TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  payload     JSONB,                 -- enough to retry
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```
Surface in admin portal as a "Sync Failures" tab with retry buttons.

### g) Portal switching via `viewMode` prop

Where reasonable, let one component serve multiple views via a prop
(`viewMode: 'LEDGER' | 'BATCHER'`). DRY > separate-files-per-view when
the data + columns are 80% the same.

### h) Memory/CONTEXT.md file for future sessions

Maintain a top-level `CONTEXT.md` that captures architectural decisions,
pinned facts (Monday TZ, GHL location ID, etc.), and "gotchas". Future
Claude sessions read it as system context. **Update it as you learn.**

---

## 8. Anti-patterns to AVOID (paid in tuition by Sunflower)

### a) Don't strict-`eq` on phone/email — always tolerant

`leads.phone_digits` was stored as 11 digits, function searched 10. Silent 404s for weeks.

### b) Don't pin external-system TZ to one user's account

Monday's API caller TZ leaked into every monday-write. When the user
switched accounts, the data corrupted. Always have a code-side default
and fetch the API user's TZ programmatically if it matters.

### c) Don't add "protect terminal stages from being overwritten" guards in mirrors

If your SoT is external (Monday, dialer, etc.), the mirror MUST NOT have
"protective" logic that refuses certain updates. It silently traps stale
data forever. Either accept SoT-wins, or build a separate manual-override
flow.

### d) Don't deploy edge functions ad-hoc without updating local source

See §7e.

### e) Don't skip exception handling in long-running workers

```python
# BAD:
schedule.every(15).minutes.do(run_cycle)
while True: schedule.run_pending(); time.sleep(1)

# GOOD:
def safe_cycle():
    try: run_cycle()
    except Exception as e: logger.error(f"Cycle failed: {e}")
schedule.every(15).minutes.do(safe_cycle)
```
A single DNS blip will otherwise crash the worker, hit Railway's
restart-retry limit, and stop the service entirely.

### f) Don't assume Vercel/Vite HMR will pick up every change

Some changes (deleted files, schema drift between local and node_modules)
require a hard restart of `npm run dev`. Document that in the README so
future devs don't chase ghost bugs.

### g) Don't mix GHL/external API versions inside one function

If `Version: 2021-04-15` works for create and `2021-07-28` for list,
EITHER use `2021-07-28` everywhere OR document the per-endpoint variance
clearly. Inline mixing is a footgun.

### h) Don't put modal-only popovers at default z-50

shadcn defaults all popovers to `z-50`, but app-level modals stack
higher. Date pickers inside modals will render BEHIND the modal. Set
the global PopoverContent to `z-[200]` for modals support.

### i) Don't expose `service_role` key to the client. Ever.

Use anon key on the client + edge functions for privileged ops. The
anon key is fine in the bundle; the service role key is not.

### j) Don't build "quick" Python scripts that bypass edge functions

If a worker calls `supabase.table('users').delete()` directly with the
service role key, RLS bypass is fine, but you've lost the role-check
your edge functions enforce. Future "we changed roles, why did the
worker still write?" bugs trace back to this.

---

## 9. Build Sequence (the order to actually do things)

**Sprint 0 — Foundation (Day 1)**
1. `npm create vite@latest nexusdial -- --template react-ts`
2. Install: `tailwindcss postcss autoprefixer @supabase/supabase-js sonner lucide-react date-fns clsx tailwind-merge class-variance-authority`
3. `npx tailwindcss init -p`
4. Configure Tailwind colors per §3.
5. Set up shadcn/ui: `npx shadcn-ui@latest init` → answer dark mode = yes, base color = neutral.
6. Add components: `npx shadcn-ui@latest add button card dialog input label select toast popover calendar dropdown-menu` (etc., add as needed).
7. Configure path alias `@/*` → `src/*` in both `tsconfig.json` and `vite.config.ts`.
8. Configure dark mode default in `<html class="dark">` in `index.html`.

**Sprint 1 — Auth + Layout (Day 1-2)**
1. Create Supabase project. Get `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Put in `.env.local`.
2. `lib/supabase.ts` — client singleton.
3. `auth/AuthContext.tsx` — exposes `user`, `session`, `loading`, `signIn`, `signOut`.
4. `auth/LoginPage.tsx` — email/password form with brand styling.
5. `App.tsx` — wrap in `<AuthProvider>`, gate routes by auth state.
6. Apply migration: create `users` table per §5.
7. After signup, trigger creates a `public.users` row (default role: `AGENT`, owner promotes manually).
8. `ui/SidebarLayout.tsx` — left sidebar with module nav, top header, main content area. Dark theme by default.

**Sprint 2 — Dashboard skeleton (Day 2-3)**
1. `features/dashboard/DashboardView.tsx` — KPI cards (total employees, active invoices, pending payroll, calls today).
2. Use mock data first; wire real queries last.
3. Charts: skip for MVP; add later with `recharts` or `tremor`.

**Sprint 3 — HR module (Day 3-4)**
1. Apply migration: `employees`, `time_off_requests`.
2. `features/employees/EmployeesTab.tsx` — list + search + add.
3. `features/employees/EmployeeForm.tsx` — create/edit modal.
4. `features/employees/TimeOffTab.tsx` — list pending requests, approve/deny actions.
5. Edge function `admin-actions` action: `create_employee`, `terminate_employee`.

**Sprint 4 — Billing module (Day 4-5)**
1. Apply migration: `customers`, `invoices`.
2. `features/invoices/InvoicesTab.tsx` — list + status filter.
3. `features/invoices/InvoiceForm.tsx` — line items, totals, customer picker.
4. Edge function `send-invoice` — stub for now (just mark as SENT). PDF generation + email is a later sprint.

**Sprint 5 — Payroll module (Day 5-6)**
1. Apply migration: `payroll_entries`, `payment_batches`.
2. `features/payroll/LedgerView.tsx` — list payroll entries with status pills.
3. `features/payroll/BatcherView.tsx` — multi-select unpaid entries → create batch.
4. Edge function `payroll-batch` — atomic batch creation + audit log.

**Sprint 6 — Dialer foundation (Day 6-7)**
1. Apply migration: `agent_performance_daily`.
2. `features/dialer/DialerStub.tsx` — UI placeholder showing "Connect a dialer" CTA.
3. Edge function `dialer-webhook` — receives webhook payload (vendor TBD), upserts `agent_performance_daily`. For now, document the expected payload shape and return 200 on any input.
4. Build the foundation but don't connect a real dialer yet — the user said vendor is TBD.

**Sprint 7 — Polish + role-based portals (Day 7+)**
- Split admin/HR/billing/payroll/agent portals if the user wants role-isolated views.
- Or keep one admin portal with role-gated tabs (simpler).

---

## 10. Step-by-step prompts to give to Claude Code

Copy/paste these in order. After each, verify the result before moving on.

### Prompt 1 — Bootstrap

```
You are building NexusDial — an internal operations portal for an Elite
Virtual Assistant Agency. Read the spec at NEXUSDIAL_BUILD_SPEC.md and:

1. Bootstrap a new Vite + React 19 + TypeScript project named `nexusdial`.
2. Install the dependencies listed in §2 (Tech Stack).
3. Configure Tailwind with the brand colors from §3.
4. Configure path alias `@/*` → `src/*`.
5. Initialize shadcn/ui with dark mode enabled.
6. Add the shadcn components listed in §9 Sprint 0 step 6.
7. Set the page background to `#0a1628` and apply Inter as the default font.
8. Show me a "Hello NexusDial" page that uses Tailwind classes from the
   new color palette (button + card example) so I can verify the brand
   palette is wired correctly.

Don't proceed to auth or any other sprint until I confirm the bootstrap is right.
```

### Prompt 2 — Supabase + Auth

```
Now wire up Supabase. I have a project ready; I'll provide URL and anon key.

1. Create `src/lib/supabase.ts` — singleton client.
2. Create `src/auth/AuthContext.tsx` — exposes `user`, `session`, `loading`,
   `signIn(email, password)`, `signOut()`. Use Supabase's `onAuthStateChange`.
3. Create `src/auth/LoginPage.tsx` — branded email/password form.
4. In `App.tsx`, render `<LoginPage />` if no user, otherwise the (empty for now)
   main app shell.
5. Apply migration `001_create_users.sql` from §5 (just the `users` table).
6. Add a Postgres trigger that creates a `public.users` row on `auth.users`
   INSERT (default role = 'AGENT'). I'll manually promote myself to OWNER
   via SQL after signing up.

Show me the working login flow + a confirmation that signing up creates a
matching `public.users` row.
```

### Prompt 3 — Layout shell

```
Build the app shell:

1. `src/ui/SidebarLayout.tsx` — left sidebar (collapsible), top header, main area.
2. Sidebar nav items: Dashboard, Employees, Invoices, Payroll, Dialer, Settings.
3. Header: logo placeholder, current user's name + role pill on the right,
   sign-out button.
4. Apply the brand palette throughout.
5. Add basic routing — for now, each nav item just renders a placeholder
   `<h1>X coming soon</h1>` page.

The sidebar should hide nav items based on the user's role (per §5 RLS
policies, but check role in the React layer too — RLS is the security
boundary, role-based UI is just polish).
```

### Prompt 4 — Dashboard

```
Build the dashboard at `/dashboard`:

1. 4 KPI cards in a grid: Total Employees, Active Invoices, Pending Payroll,
   Calls Today.
2. Use mock data first.
3. Then wire each card to a real Supabase query (count(*) from each table).
4. Below cards, a "Recent Activity" feed pulling from `audit_log` (latest 10).
5. Use the same dark navy + green palette throughout.
6. Loading states: skeleton placeholders for each card while data fetches.

Done when each card shows real data from Supabase and refreshes on page
reload.
```

### Prompt 5 — HR module

```
Build the HR module:

1. Apply migrations for `employees` and `time_off_requests`.
2. `src/features/employees/EmployeesTab.tsx` — list with search + filter by department.
3. `src/features/employees/EmployeeForm.tsx` — modal for create + edit.
4. `src/features/employees/TimeOffTab.tsx` — list pending requests, approve/deny.
5. Wire all writes through an `admin-actions` edge function (don't write
   to the DB directly from the client for privileged ops).
6. Update `audit_log` on every create/update/delete.

Done when I can: add an employee, edit them, request time off (via a
"Request Time Off" button on the employee row), and approve/deny it.
```

### Prompt 6 — Billing module

```
Build the Billing module (similar pattern to HR):

1. Apply migrations for `customers` and `invoices`.
2. `src/features/customers/CustomersTab.tsx` — list + search + add.
3. `src/features/invoices/InvoicesTab.tsx` — list with status filter
   (Draft / Sent / Paid / Overdue).
4. `src/features/invoices/InvoiceForm.tsx` — customer picker, line items
   (description / qty / unit_price), auto-calculated total.
5. Edge function `send-invoice` — for now just marks the invoice as SENT
   and returns success. PDF + email comes later.
6. "Mark as Paid" button on Sent invoices.

Done when I can create a customer, send them an invoice, and mark it paid.
```

### Prompt 7 — Payroll module

```
Build the Payroll module — this is the most complex because of the
"Batcher" pattern from the sister project.

1. Apply migrations for `payroll_entries` and `payment_batches`.
2. `src/features/payroll/LedgerView.tsx` — list of entries with status pills,
   filterable by employee + period.
3. `src/features/payroll/BatcherView.tsx` — multi-select unpaid entries
   (checkboxes), pick a name + optional notes, click "Create Batch".
   On success: entries get `batch_id` set, batch row created, all atomic
   via an edge function.
4. Active batches shown with a "Mark as Paid" button — sets `is_paid=true`
   on every entry in the batch + sets batch's `paid_at`.
5. Use ONE shared component for Ledger + Batcher (toggle via `viewMode` prop)
   like the sister project did. The only diff is checkboxes appear in
   batcher mode.

Done when I can: see a list of payroll entries, multi-select unpaid ones,
create a batch, see it under "Active Batches", and mark it paid.
```

### Prompt 8 — Dialer foundation

```
Lay the groundwork for a future dialer integration. We don't have a vendor
picked yet, so build the abstraction:

1. Apply migration for `agent_performance_daily`.
2. `src/features/dialer/DialerView.tsx` — placeholder UI:
   - "Not connected" state with a "Configure dialer" CTA (no-op for now).
   - Show a static example of what live agent status will look like
     (cards with agent name, current status, time-on-call).
   - List of `agent_performance_daily` rows for today (will be empty for now).
3. Edge function `dialer-webhook` — accepts POST with body shape:
   ```
   {
     agent_id: string,
     calls: number,
     talk_seconds: number,
     wait_seconds: number,
     dispos: { [code]: number }
   }
   ```
   Upserts into `agent_performance_daily` keyed on (agent_id, sync_date=today).
   Returns 200.
4. Document the webhook URL + expected payload in a README so the dialer
   vendor (when picked) can be configured.

Done when the dialer page renders, the webhook function deploys cleanly,
and a manual `curl` POST upserts a row I can see in the dashboard.
```

### Prompt 9 — Polish

```
Final pass before handoff:

1. Add a "Sync Failures" tab in the admin portal — lists rows from a
   `sync_failures` table with retry buttons. (Even if empty for now, the
   UI is there for when integrations start failing.)
2. Add an "Audit Log" tab — paginated view of `audit_log` rows, filterable
   by actor + action.
3. Add proper toast notifications (sonner) on every action — success +
   failure.
4. Verify dark mode looks good throughout (no white-on-white text edge cases).
5. Verify mobile responsive: sidebar collapses to a hamburger menu under
   768px.

Done when the portal feels production-grade for the MVP scope.
```

---

## 11. Things to clarify with the user before starting

- [ ] **Tenancy:** single-tenant or multi-tenant? (See §1.)
- [ ] **Auth method:** email/password OR magic-link OR OAuth? Default: email/password.
- [ ] **Currency:** USD only, or international (EGP/USD like Sunflower)?
- [ ] **Hosting:** Vercel for frontend (recommended) — confirm.
- [ ] **Domain:** any custom domain ready, or use the auto Vercel URL initially?
- [ ] **Brand assets:** logo SVG / PNG available? Or use a placeholder?
- [ ] **Dialer vendor preference:** any leaning yet (ViciDial / Twilio Flex / GHL / RingCentral)?

---

## 12. Hand-off checklist (after Sprint 7)

- [ ] All 9 prompts completed and verified.
- [ ] README written with setup instructions (`npm install`, `.env.local` template, `npm run dev`).
- [ ] Supabase migrations checked into `supabase/migrations/`.
- [ ] Edge functions deploy via Supabase CLI or MCP.
- [ ] `CONTEXT.md` started — capture every architectural decision made during build.
- [ ] First user (the friend) has OWNER role; can promote others.
- [ ] Manual smoke test: log in, add an employee, create an invoice, run a payroll batch.
- [ ] Production deploy: Vercel project connected to GitHub, auto-deploys on `main` push.
- [ ] Domain (if applicable) configured.
- [ ] Hand-off video / doc explaining how to add new features.

---

## 13. Reference: lessons file from sister project

The sister project (Sunflower Solar) has a `MEMORY.md` capturing similar
context — encourage the same practice here. The goal: a future developer
(or future Claude session) reading `CONTEXT.md` should be able to pick up
where the previous one left off without 30 minutes of "wait, why did we
do this?" questions.

Examples of what to capture:
- "PORTAL_TZ is set to America/New_York because most agents are EST" (or whatever).
- "Invoice numbers are formatted INV-YYYY-NNNN, monotonic per year."
- "The dialer-webhook expects field names matching ViciDial's export CSV
  because that's the vendor we're starting with."
- "RLS is enforced at the DB level; the role gating in the sidebar is
  cosmetic (don't trust the client)."

---

## END

This spec is the input. Pick a spot to start, send Prompt 1 to Claude
Code, and iterate. Each prompt is small enough to verify within a few
minutes — don't batch them, because catching a brand-color mismatch
in Prompt 1 is much cheaper than catching it after Sprint 5.
