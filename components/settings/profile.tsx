'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

interface ProfileSettingsProps {
  user?: any
  settings?: any
}

export function ProfileSettings({ user, settings }: ProfileSettingsProps) {
  const updateProfile = useMutation(api.settings.updateProfile)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    location: '',
    phone: '',
    timezone: 'Asia/Calcutta',
  })

  useEffect(() => {
    const parts = (user?.name ?? '').split(' ')
    setForm({
      firstName: parts[0] ?? '',
      lastName: parts.slice(1).join(' '),
      email: user?.email ?? '',
      bio: settings?.bio ?? '',
      location: settings?.location ?? '',
      phone: settings?.phone ?? '',
      timezone: user?.timezone ?? 'Asia/Calcutta',
    })
  }, [settings, user])

  async function handleSave() {
    await updateProfile({
      name: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email || undefined,
      bio: form.bio || undefined,
      location: form.location || undefined,
      phone: form.phone || undefined,
      timezone: form.timezone,
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Public Profile</CardTitle>
          <CardDescription>
            This information will be visible to clients.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-border ring-2 ring-background">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback>{`${form.firstName[0] ?? ''}${form.lastName[0] ?? ''}` || 'FO'}</AvatarFallback>
              </Avatar>
              <button className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold">Profile Picture</h3>
              <p className="text-xs text-muted-foreground">
                Managed by Clerk for now.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={form.firstName} onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={form.lastName} onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell clients about yourself..."
              className="min-h-[120px]"
              value={form.bio}
              onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t border-border pt-6">
          <Button onClick={handleSave}>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
