import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth } from './auth/RequireAuth'
import { LoginPage } from './auth/LoginPage'
import { SidebarLayout } from './ui/SidebarLayout'
import { DashboardView } from './features/dashboard/DashboardView'
import { HRView } from './features/employees/HRView'
import { BillingView } from './features/billing/BillingView'
import { PayrollView } from './features/payroll/PayrollView'
import { DialerView } from './features/dialer/DialerView'
import { SettingsView } from './features/settings/SettingsView'
import { SuperAdminView } from './features/superadmin/SuperAdminView'
import { RecruiterView } from './features/recruitment/RecruiterView'
import { ClientCandidatesView } from './features/recruitment/ClientCandidatesView'
import type { FeatureKey } from './types/database'

function PortalLayout({ children, feature }: { children: React.ReactNode; feature?: FeatureKey }) {
  return (
    <RequireAuth feature={feature}>
      <SidebarLayout>{children}</SidebarLayout>
    </RequireAuth>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" theme="dark" richColors />
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/dashboard" element={<PortalLayout><DashboardView /></PortalLayout>} />
          <Route path="/employees" element={<PortalLayout feature="hr"><HRView /></PortalLayout>} />
          <Route path="/invoices"  element={<PortalLayout feature="billing"><BillingView /></PortalLayout>} />
          <Route path="/payroll"   element={<PortalLayout feature="payroll"><PayrollView /></PortalLayout>} />
          <Route path="/dialer"    element={<PortalLayout feature="dialer"><DialerView /></PortalLayout>} />
          <Route path="/settings"   element={<PortalLayout><SettingsView /></PortalLayout>} />
          <Route path="/candidates" element={<PortalLayout feature="recruitment"><ClientCandidatesView /></PortalLayout>} />
          <Route path="/recruiter"  element={<PortalLayout><RecruiterView /></PortalLayout>} />

          {/* SuperAdmin — completely separate, no sidebar */}
          <Route
            path="/superadmin"
            element={
              <RequireAuth requireSuperAdmin>
                <SuperAdminView />
              </RequireAuth>
            }
          />

          <Route path="/" element={<Navigate to="/candidates" replace />} />
          <Route path="*" element={<Navigate to="/candidates" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
