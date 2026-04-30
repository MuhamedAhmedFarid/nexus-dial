import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PayrollLedger } from './PayrollLedger'
import { BatchesTab } from './BatchesTab'

export function PayrollView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payroll</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage payroll entries and payment batches</p>
      </div>
      <Tabs defaultValue="ledger">
        <TabsList>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
          <TabsTrigger value="batcher">Batcher</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
        </TabsList>
        <TabsContent value="ledger" className="mt-4"><PayrollLedger viewMode="LEDGER" /></TabsContent>
        <TabsContent value="batcher" className="mt-4"><PayrollLedger viewMode="BATCHER" /></TabsContent>
        <TabsContent value="batches" className="mt-4"><BatchesTab /></TabsContent>
      </Tabs>
    </div>
  )
}
