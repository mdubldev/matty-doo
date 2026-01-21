import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-border p-4 flex flex-col shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-muted-foreground">Spaces</h2>
      </div>

      <div className="flex-1 overflow-auto">
        <p className="text-sm text-muted-foreground py-8 text-center">
          No spaces yet
        </p>
      </div>

      <Button variant="outline" className="w-full gap-2" disabled>
        <Plus className="h-4 w-4" />
        Add Space
      </Button>
    </aside>
  )
}
