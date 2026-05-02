import { query } from "./_generated/server";
import { requireCurrentUser, currentMonthKey } from "./lib/auth";
import { getSubscriptionForUser, getUsageCounter } from "./lib/billing";

function toRelativeLabel(dateString?: string) {
  if (!dateString) return "No recent activity";
  const source = new Date(dateString);
  const now = new Date();
  const diff = Math.max(0, now.getTime() - source.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes || 1}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const overview = query({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireCurrentUser(ctx);
    const today = new Date().toISOString().slice(0, 10);

    // Use bounded .take() to avoid hitting Convex read limits
    const todaysBookings = await ctx.db
      .query("bookings")
      .withIndex("by_userId_and_date", (q) => q.eq("userId", user._id).eq("date", today))
      .take(20);

    const allTasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId_and_dueDate", (q) => q.eq("userId", user._id))
      .take(200);

    const upcomingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_userId_and_status", (q) =>
        q.eq("userId", user._id).eq("status", "upcoming"),
      )
      .take(50);

    // Fetch only the last 20 activity events (index is ordered by occurredOn asc)
    const recentActivityRaw = await ctx.db
      .query("activityEvents")
      .withIndex("by_userId_and_occurredOn", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);

    // Pipeline: run 4 stage queries in parallel
    const stages = [
      { id: "new", name: "New Inquiries", color: "bg-blue-50 dark:bg-blue-950" },
      { id: "contacted", name: "Contacted", color: "bg-purple-50 dark:bg-purple-950" },
      { id: "qualified", name: "Qualified", color: "bg-amber-50 dark:bg-amber-950" },
      { id: "rejected", name: "Rejected", color: "bg-slate-50 dark:bg-slate-900" },
    ] as const;

    const pipelineResults = await Promise.all(
      stages.map((stage) =>
        ctx.db
          .query("inquiries")
          .withIndex("by_userId_and_stage", (q) =>
            q.eq("userId", user._id).eq("stage", stage.id),
          )
          .take(50),
      ),
    );

    const pipelineColumns = stages.map((stage, i) => {
      const items = pipelineResults[i];
      const active = items.filter((item) => !item.convertedClientId);
      return {
        id: stage.id,
        name: stage.name,
        count: active.length,
        color: stage.color,
        items: active.slice(0, 3).map((item) => ({ id: item._id, label: item.service })),
      };
    });

    // Active clients — bounded; count used from usageCounters for stats
    const activeClients = await ctx.db
      .query("clients")
      .withIndex("by_userId_and_status", (q) =>
        q.eq("userId", user._id).eq("status", "active"),
      )
      .take(200);

    // Completed bookings this month for revenue calculation
    const monthStart = today.slice(0, 7) + "-01"; // e.g. "2026-05-01"
    const completedBookingsThisMonth = await ctx.db
      .query("bookings")
      .withIndex("by_userId_and_status_and_date", (q) =>
        q.eq("userId", user._id).eq("status", "completed").gte("date", monthStart),
      )
      .take(500);

    const monthlyRevenue = completedBookingsThisMonth.reduce(
      (sum, booking) => sum + (booking.amountCents ?? 0),
      0,
    );

    const usage = await getUsageCounter(ctx, user._id, currentMonthKey());
    const subscription = await getSubscriptionForUser(ctx, user._id);

    return {
      todayBookings: todaysBookings
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .slice(0, 4),
      tasksDueToday: allTasks
        .filter((task) => task.dueDate === today && !task.completed)
        .slice(0, 5),
      overdueTasks: allTasks
        .filter((task) => !task.completed && task.dueDate && task.dueDate < today)
        .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
        .slice(0, 5),
      upcomingBookings: upcomingBookings
        .filter((booking) => booking.date >= today)
        .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))
        .slice(0, 5),
      pipelineColumns,
      recentActivities: recentActivityRaw
        .slice(0, 7)
        .map((activity) => ({
          ...activity,
          time: toRelativeLabel(activity.occurredOn),
        })),
      stats: {
        monthlyRevenue,
        conversionRate: activeClients.length
          ? Math.round((todaysBookings.length / Math.max(activeClients.length, 1)) * 100)
          : 0,
        activeInquiries: pipelineColumns.reduce((sum, col) => sum + col.count, 0),
        activeClients: activeClients.length,
        // Revenue this week (not month) — uses correct 7-day window
        revenueThisWeek: completedBookingsThisMonth
          .filter((booking) => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return booking.date >= weekAgo.toISOString().slice(0, 10);
          })
          .reduce((sum, booking) => sum + (booking.amountCents ?? 0), 0),
      },
      subscription,
      usage,
      onboardingComplete: user.onboardingCompleted,
    };
  },
});
