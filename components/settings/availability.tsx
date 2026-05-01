'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

interface AvailabilitySettingsProps {
  availability?: Array<{
    dayOfWeek: number
    enabled: boolean
    startTime: string
    endTime: string
  }>
}

export function AvailabilitySettings({ availability = [] }: AvailabilitySettingsProps) {
  const updateAvailability = useMutation(api.settings.updateAvailability)
  const [rules, setRules] = useState(
    DAYS.map((_, index) => ({
      dayOfWeek: (index + 1) % 7,
      enabled: index < 5,
      startTime: '09:00',
      endTime: '17:00',
    })),
  )

  useEffect(() => {
    if (!availability.length) return
    const ordered = [...availability].sort((a, b) => ((a.dayOfWeek + 6) % 7) - ((b.dayOfWeek + 6) % 7))
    setRules(ordered)
  }, [availability])

  async function handleSave() {
    await updateAvailability({ rules })
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <h3 className="text-xl font-bold">Weekly Hours</h3>
          <p className="text-sm text-muted-foreground">
            Set your regular working hours to manage booking slots.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {DAYS.map((day, index) => (
              <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                  <Switch
                    id={`switch-${day}`}
                    checked={rules[index]?.enabled ?? false}
                    onCheckedChange={(checked) =>
                      setRules((prev) =>
                        prev.map((rule, ruleIndex) =>
                          ruleIndex === index ? { ...rule, enabled: Boolean(checked) } : rule,
                        ),
                      )
                    }
                  />
                  <Label htmlFor={`switch-${day}`} className="font-bold uppercase tracking-wider text-xs">
                    {day}
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={rules[index]?.startTime ?? '09:00'}
                    onValueChange={(value) =>
                      setRules((prev) =>
                        prev.map((rule, ruleIndex) =>
                          ruleIndex === index ? { ...rule, startTime: value } : rule,
                        ),
                      )
                    }
                  >
                    <SelectTrigger className="w-24 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="08:00">08:00 AM</SelectItem>
                      <SelectItem value="09:00">09:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground">to</span>
                  <Select
                    value={rules[index]?.endTime ?? '17:00'}
                    onValueChange={(value) =>
                      setRules((prev) =>
                        prev.map((rule, ruleIndex) =>
                          ruleIndex === index ? { ...rule, endTime: value } : rule,
                        ),
                      )
                    }
                  >
                    <SelectTrigger className="w-24 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="17:00">05:00 PM</SelectItem>
                      <SelectItem value="18:00">06:00 PM</SelectItem>
                      <SelectItem value="19:00">07:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t border-border pt-6">
          <Button onClick={handleSave}>Save Schedule</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
