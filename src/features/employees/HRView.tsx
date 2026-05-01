import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { EmployeesTab } from './EmployeesTab'
import { TimeOffTab } from './TimeOffTab'

export function HRView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Human Resources</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage employees and time off</p>
      </div>
      <Tabs defaultValue="employees">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="timeoff">Time Off</TabsTrigger>
        </TabsList>
        <TabsContent value="employees" className="mt-4"><EmployeesTab /></TabsContent>
        <TabsContent value="timeoff" className="mt-4"><TimeOffTab /></TabsContent>
      </Tabs>
    </div>
  )
}
