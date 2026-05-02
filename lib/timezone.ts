export type TimeParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

function getFormatter(timeZone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export function getZonedParts(date: Date, timeZone: string): TimeParts {
  const parts = getFormatter(timeZone).formatToParts(date)
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
    hour: Number(lookup.hour),
    minute: Number(lookup.minute),
    second: Number(lookup.second),
  }
}

function getOffsetMilliseconds(date: Date, timeZone: string) {
  const zoned = getZonedParts(date, timeZone)
  const asUtc = Date.UTC(
    zoned.year,
    zoned.month - 1,
    zoned.day,
    zoned.hour,
    zoned.minute,
    zoned.second,
  )
  return asUtc - date.getTime()
}

export function zonedDateTimeToUtc(date: string, time: string, timeZone: string) {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0))
  const offset = getOffsetMilliseconds(guess, timeZone)
  return new Date(guess.getTime() - offset)
}

export function utcToZonedDateTimeParts(date: Date, timeZone: string) {
  const zoned = getZonedParts(date, timeZone)
  return {
    date: `${String(zoned.year).padStart(4, '0')}-${String(zoned.month).padStart(2, '0')}-${String(zoned.day).padStart(2, '0')}`,
    time: `${String(zoned.hour).padStart(2, '0')}:${String(zoned.minute).padStart(2, '0')}`,
  }
}

export function getDateKeyInTimeZone(date: Date, timeZone: string) {
  return utcToZonedDateTimeParts(date, timeZone).date
}

export function getWeekdayFromDateKey(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

export function compareTimeStrings(left: string, right: string) {
  return left.localeCompare(right)
}

export function addMinutesToTime(time: string, minutesToAdd: number) {
  const [hours, minutes] = time.split(':').map(Number)
  const total = hours * 60 + minutes + minutesToAdd
  const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60)
  const nextHour = Math.floor(normalized / 60)
  const nextMinute = normalized % 60
  return `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`
}

export function buildHourlySlots(startTime: string, endTime: string) {
  const slots: string[] = []
  let cursor = startTime
  while (compareTimeStrings(cursor, endTime) < 0) {
    slots.push(cursor)
    cursor = addMinutesToTime(cursor, 60)
  }
  return slots
}

export function formatTimeZoneLabel(timeZone: string) {
  const sample = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'short',
  }).formatToParts(new Date())
  const zonePart = sample.find((part) => part.type === 'timeZoneName')?.value
  return zonePart ? `${timeZone} (${zonePart})` : timeZone
}
