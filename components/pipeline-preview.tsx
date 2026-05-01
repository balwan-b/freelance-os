import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PipelineColumn {
  id: string
  name: string
  count: number
  items: Array<{
    id: string
    label: string
  }>
  color: string
}

interface PipelinePreviewProps {
  columns: PipelineColumn[]
}

export function PipelinePreview({ columns }: PipelinePreviewProps) {
  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="text-base">Pipeline Overview</CardTitle>
        <CardDescription>Current stage distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max">
            {columns.map((column) => (
              <div key={column.id} className="flex flex-col gap-3 min-w-[180px]">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{column.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {column.count}
                  </Badge>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {column.items.length > 0 ? (
                    column.items.map((item) => (
                      <div
                        key={item.id}
                        className={`p-2 rounded-lg border border-border text-xs font-medium truncate cursor-pointer hover:bg-muted transition-colors ${column.color}`}
                      >
                        {item.label}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
