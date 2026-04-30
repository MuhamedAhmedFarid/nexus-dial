export type UserRole = 'OWNER' | 'ADMIN' | 'HR' | 'BILLING' | 'PAYROLL' | 'AGENT' | 'RECRUITER'
export type FeatureKey = 'hr' | 'billing' | 'payroll' | 'dialer' | 'recruitment'
export type CandidateStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected'

export interface TenantFeatures {
  hr: boolean
  billing: boolean
  payroll: boolean
  dialer: boolean
  recruitment: boolean
}

export const ALL_FEATURES_ON: TenantFeatures = { hr: true, billing: true, payroll: true, dialer: true, recruitment: true }
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
export type TimeOffStatus = 'PENDING' | 'APPROVED' | 'DENIED'
export type BatchStatus = 'PENDING' | 'PAID' | 'CANCELLED'

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: Tenant
        Insert: Omit<Tenant, 'id' | 'created_at'>
        Update: Partial<Omit<Tenant, 'id' | 'created_at'>>
      }
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      }
      employees: {
        Row: Employee
        Insert: Omit<Employee, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Employee, 'id' | 'created_at'>>
      }
      time_off_requests: {
        Row: TimeOffRequest
        Insert: Omit<TimeOffRequest, 'id' | 'created_at'>
        Update: Partial<Omit<TimeOffRequest, 'id' | 'created_at'>>
      }
      customers: {
        Row: Customer
        Insert: Omit<Customer, 'id' | 'created_at'>
        Update: Partial<Omit<Customer, 'id' | 'created_at'>>
      }
      invoices: {
        Row: Invoice
        Insert: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Invoice, 'id' | 'created_at'>>
      }
      payroll_entries: {
        Row: PayrollEntry
        Insert: Omit<PayrollEntry, 'id' | 'created_at'>
        Update: Partial<Omit<PayrollEntry, 'id' | 'created_at'>>
      }
      payment_batches: {
        Row: PaymentBatch
        Insert: Omit<PaymentBatch, 'id' | 'created_at'>
        Update: Partial<Omit<PaymentBatch, 'id' | 'created_at'>>
      }
      agent_performance_daily: {
        Row: AgentPerformanceDaily
        Insert: Omit<AgentPerformanceDaily, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<AgentPerformanceDaily, 'id' | 'created_at'>>
      }
      audit_log: {
        Row: AuditLog
        Insert: Omit<AuditLog, 'id' | 'created_at'>
        Update: never
      }
      sync_failures: {
        Row: SyncFailure
        Insert: Omit<SyncFailure, 'id' | 'created_at'>
        Update: Partial<Omit<SyncFailure, 'id' | 'created_at'>>
      }
    }
  }
}

export interface Tenant {
  id: string
  name: string
  slug: string
  is_active: boolean
  created_at: string
  suspended_at: string | null
  notes: string | null
  features: TenantFeatures
}

export interface User {
  id: string
  auth_user_id: string | null
  tenant_id: string
  email: string | null
  name: string
  alias: string | null
  role: UserRole
  is_active: boolean
  is_superadmin: boolean
  agent_id: string | null
  phone: string | null
  hourly_rate: number
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  tenant_id: string
  user_id: string | null
  full_name: string
  email: string | null
  phone: string | null
  position: string | null
  department: string | null
  hire_date: string | null
  termination_date: string | null
  hourly_rate: number | null
  payment_method: string | null
  payment_details: Record<string, unknown> | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface TimeOffRequest {
  id: string
  tenant_id: string
  employee_id: string
  start_date: string
  end_date: string
  reason: string | null
  status: TimeOffStatus
  approved_by: string | null
  approved_at: string | null
  created_at: string
}

export interface Customer {
  id: string
  tenant_id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  billing_email: string | null
  notes: string | null
  is_active: boolean
  created_at: string
}

export interface InvoiceLineItem {
  description: string
  qty: number
  unit_price: number
  total: number
}

export interface Invoice {
  id: string
  tenant_id: string
  customer_id: string
  invoice_number: string
  amount_usd: number
  currency: string
  status: InvoiceStatus
  due_date: string | null
  sent_at: string | null
  paid_at: string | null
  notes: string | null
  line_items: InvoiceLineItem[] | null
  created_at: string
  updated_at: string
}

export interface PayrollEntry {
  id: string
  tenant_id: string
  employee_id: string
  period_start: string
  period_end: string
  hours_worked: number | null
  hourly_rate: number | null
  base_pay: number | null
  bonus: number
  deduction: number
  net_owed: number | null
  is_paid: boolean
  paid_at: string | null
  batch_id: string | null
  notes: string | null
  created_at: string
}

export interface PaymentBatch {
  id: string
  tenant_id: string
  batch_name: string
  total_amount: number | null
  egp_rate: number | null
  status: BatchStatus
  notes: string | null
  created_by: string | null
  created_at: string
  paid_at: string | null
}

export interface AgentPerformanceDaily {
  id: string
  tenant_id: string
  user_id: string
  agent_id: string
  sync_date: string
  calls: number
  talk_seconds: number
  wait_seconds: number
  meetings_booked: number
  dispos: Record<string, number> | null
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  tenant_id: string | null
  actor_id: string | null
  action: string
  target_type: string | null
  target_id: string | null
  payload: Record<string, unknown> | null
  created_at: string
}

export interface SyncFailure {
  id: string
  tenant_id: string
  source: string
  target_id: string | null
  error_text: string
  retried_at: string | null
  resolved_at: string | null
  payload: Record<string, unknown> | null
  created_at: string
}

export interface Candidate {
  id: string
  tenant_id: string
  created_by: string | null
  name: string
  position: string
  email: string | null
  phone: string | null
  vocaroo_url: string | null
  resume_url: string | null
  rating: number | null
  rating_notes: string | null
  status: CandidateStatus
  notes: string | null
  created_at: string
  updated_at: string
}
