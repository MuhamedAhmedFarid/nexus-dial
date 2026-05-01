import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { CustomersTab } from './CustomersTab'
import { InvoicesTab } from './InvoicesTab'

export function BillingView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage customers and invoices</p>
      </div>
      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices" className="mt-4"><InvoicesTab /></TabsContent>
        <TabsContent value="customers" className="mt-4"><CustomersTab /></TabsContent>
      </Tabs>
    </div>
  )
}
