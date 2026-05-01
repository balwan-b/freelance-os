'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'

interface Note {
  id: string
  content: string
  date: string
  author?: string
}

interface NotesPanelProps {
  notes: Note[]
  onAddNote?: () => void
}

export function NotesPanel({ notes, onAddNote }: NotesPanelProps) {
  return (
    <Card className="border border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Notes</CardTitle>
            <CardDescription>{notes.length} notes</CardDescription>
          </div>
          <Button size="sm" variant="outline" className="gap-2" onClick={onAddNote}>
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No notes yet. Add one to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
                <p className="text-sm leading-relaxed mb-2">{note.content}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{note.date}</span>
                  {note.author && <span>{note.author}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
