import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import {
  addMinutesToTime,
  compareTimeStrings,
  getWeekdayFromDateKey,
  zonedDateTimeToUtc,
} from "./timezone";

type AvailabilityRule = {
  dayOfWeek: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
};

type BookingCandidate = {
  date: string;
  startTime: string;
  endTime?: string;
};

type ExistingBooking = Pick<
  Doc<"bookings">,
  "_id" | "date" | "startTime" | "endTime" | "status" | "startsAtUtc" | "endsAtUtc" | "bookingTimezone"
>;

export function getDefaultEndTime(startTime: string) {
  return addMinutesToTime(startTime, 60);
}

function rangesOverlap(
  leftStart: Date,
  leftEnd: Date,
  rightStart: Date,
  rightEnd: Date,
) {
  return leftStart < rightEnd && leftEnd > rightStart;
}

export async function getAvailabilityRules(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
) {
  const rules = await ctx.db
    .query("availabilityRules")
    .withIndex("by_userId_and_dayOfWeek", (q) => q.eq("userId", userId))
    .collect();

  return rules.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}

function getRuleForDate(rules: AvailabilityRule[], date: string) {
  const weekday = getWeekdayFromDateKey(date);
  return rules.find((rule) => rule.dayOfWeek === weekday);
}

function assertWithinAvailability(
  candidate: BookingCandidate,
  rules: AvailabilityRule[],
) {
  const rule = getRuleForDate(rules, candidate.date);
  if (!rule || !rule.enabled) {
    throw new Error("This time is outside your working availability.");
  }

  const endTime = candidate.endTime ?? getDefaultEndTime(candidate.startTime);
  if (
    compareTimeStrings(candidate.startTime, rule.startTime) < 0 ||
    compareTimeStrings(endTime, rule.endTime) > 0 ||
    compareTimeStrings(candidate.startTime, endTime) >= 0
  ) {
    throw new Error("This booking falls outside the hours in your availability settings.");
  }
}

async function getPotentiallyConflictingBookings(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  date: string,
) {
  return await ctx.db
    .query("bookings")
    .withIndex("by_userId_and_date", (q) => q.eq("userId", userId).eq("date", date))
    .collect();
}

export async function assertBookingAvailability(
  ctx: QueryCtx | MutationCtx,
  user: Doc<"users">,
  candidate: BookingCandidate,
  existingBookingId?: Id<"bookings">,
) {
  const bookingTimeZone = user.timezone || "UTC";
  const endTime = candidate.endTime ?? getDefaultEndTime(candidate.startTime);
  const rules = await getAvailabilityRules(ctx, user._id);

  assertWithinAvailability({ ...candidate, endTime }, rules);

  const requestedStart = zonedDateTimeToUtc(candidate.date, candidate.startTime, bookingTimeZone);
  const requestedEnd = zonedDateTimeToUtc(candidate.date, endTime, bookingTimeZone);
  const existingBookings = await getPotentiallyConflictingBookings(ctx, user._id, candidate.date);

  for (const booking of existingBookings) {
    if (booking._id === existingBookingId || booking.status === "cancelled") {
      continue;
    }

    const existingTimeZone = booking.bookingTimezone || bookingTimeZone;
    const existingStart =
      booking.startsAtUtc !== undefined
        ? new Date(booking.startsAtUtc)
        : zonedDateTimeToUtc(booking.date, booking.startTime, existingTimeZone);
    const existingEnd =
      booking.endsAtUtc !== undefined
        ? new Date(booking.endsAtUtc)
        : zonedDateTimeToUtc(booking.date, booking.endTime, existingTimeZone);

    if (rangesOverlap(requestedStart, requestedEnd, existingStart, existingEnd)) {
      throw new Error("This booking conflicts with another confirmed slot on your calendar.");
    }
  }

  return {
    bookingTimeZone,
    endTime,
    startsAtUtc: requestedStart.getTime(),
    endsAtUtc: requestedEnd.getTime(),
    rules,
  };
}

export function getAvailableSlotsForDate(
  date: string,
  rules: AvailabilityRule[],
  bookings: ExistingBooking[],
  timeZone: string,
) {
  const rule = getRuleForDate(rules, date);
  if (!rule || !rule.enabled) {
    return [];
  }

  const slots: string[] = [];
  let cursor = rule.startTime;
  while (compareTimeStrings(cursor, rule.endTime) < 0) {
    const end = getDefaultEndTime(cursor);
    if (compareTimeStrings(end, rule.endTime) > 0) {
      break;
    }

    const slotStart = zonedDateTimeToUtc(date, cursor, timeZone);
    const slotEnd = zonedDateTimeToUtc(date, end, timeZone);
    const hasConflict = bookings.some((booking) => {
      if (booking.status === "cancelled") return false;
      const existingTimeZone = booking.bookingTimezone || timeZone;
      const existingStart =
        booking.startsAtUtc !== undefined
          ? new Date(booking.startsAtUtc)
          : zonedDateTimeToUtc(booking.date, booking.startTime, existingTimeZone);
      const existingEnd =
        booking.endsAtUtc !== undefined
          ? new Date(booking.endsAtUtc)
          : zonedDateTimeToUtc(booking.date, booking.endTime, existingTimeZone);
      return rangesOverlap(slotStart, slotEnd, existingStart, existingEnd);
    });

    if (!hasConflict) {
      slots.push(cursor);
    }
    cursor = end;
  }

  return slots;
}
