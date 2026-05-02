'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Check, Mail, MapPin, Calendar, Phone } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface ClientHeaderProps {
  name: string
  email: string
  phone: string
  location: string
  status: 'active' | 'inactive' | 'archived'
  joinDate: string
  avatar: string
  onNameChange?: (newName: string) => void
}

export function ClientHeader({
  name,
  email,
  phone,
  location,
  status,
  joinDate,
  avatar: _avatar,
  onNameChange,
}: ClientHeaderProps) {
  void _avatar
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(name)

  const handleNameSave = () => {
    setIsEditingName(false)
    if (editedName !== name && onNameChange) {
      onNameChange(editedName)
    }
  }

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const statusConfig = {
    active: { label: 'Active', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
    archived: { label: 'Archived', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  }

  return (
    <div className="mb-8 pb-6 border-b border-border">
      <div className="flex items-start gap-4">
        <Avatar className="w-16 h-16">
          <AvatarFallback className="text-lg bg-muted">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input 
                    value={editedName} 
                    onChange={(e) => setEditedName(e.target.value)} 
                    className="text-xl font-bold h-9 w-64"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNameSave()
                      if (e.key === 'Escape') {
                        setIsEditingName(false)
                        setEditedName(name)
                      }
                    }}
                    onBlur={handleNameSave}
                  />
                  <button onClick={handleNameSave} className="text-green-600 hover:text-green-700">
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <h1 
                  className="text-2xl font-bold cursor-text hover:bg-muted px-1 -ml-1 rounded transition-colors"
                  onClick={() => setIsEditingName(true)}
                  title="Click to edit"
                >
                  {name}
                </h1>
              )}
              <Badge className={statusConfig[status].className}>{statusConfig[status].label}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <a href={`mailto:${email}`} className="hover:text-foreground">
                {email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {location}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <a href={`tel:${phone}`} className="hover:text-foreground">
                {phone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Joined {joinDate}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
