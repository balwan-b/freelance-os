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

    const todaysBookings = await ctx.db
      .query("bookings")
      .withIndex("by_userId_and_date", (q) => q.eq("userId", user._id).eq("date", today))
      .collect();
    const allTasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId_and_dueDate", (q) => q.eq("userId", user._id))
      .collect();
    const recentActivity = await ctx.db
      .query("activityEvents")
      .withIndex("by_userId_and_occurredOn", (q) => q.eq("userId", user._id))
      .collect();

    const stages = [
      { id: "new", name: "New Inquiries", color: "bg-blue-50 dark:bg-blue-950" },
      { id: "contacted", name: "Contacted", color: "bg-purple-50 dark:bg-purple-950" },
      { id: "qualified", name: "Qualified", color: "bg-amber-50 dark:bg-amber-950" },
      { id: "rejected", name: "Rejected", color: "bg-slate-50 dark:bg-slate-900" },
    ] as const;

    const pipelineColumns = [];
    for (const stage of stages) {
      const items = await ctx.db
        .query("inquiries")
        .withIndex("by_userId_and_stage", (q) =>
          q.eq("userId", user._id).eq("stage", stage.id),
        )
        .collect();
      const filtered = items.filter((item) => !item.convertedClientId).slice(0, 3);
      pipelineColumns.push({
        id: stage.id,
        name: stage.name,
        count: items.filter((item) => !item.convertedClientId).length,
        color: stage.color,
        items: filtered.map((item) => ({ id: item._id, label: item.service })),
      });
    }

    const activeClients = await ctx.db
      .query("clients")
      .withIndex("by_userId_and_status", (q) =>
        q.eq("userId", user._id).eq("status", "active"),
      )
      .collect();
    const bookingsThisMonth = await ctx.db
      .query("bookings")
      .withIndex("by_userId_and_status", (q) =>
        q.eq("userId", user._id).eq("status", "completed"),
      )
      .collect();
    const revenueThisWeek = bookingsThisMonth
      .filter((booking) => (booking.date ?? today) >= today.slice(0, 8) + "01")
      .reduce((sum, booking) => sum + (booking.amountCents ?? 0), 0);

    const usage = await getUsageCounter(ctx, user._id, currentMonthKey());
    const subscription = await getSubscriptionForUser(ctx, user._id);

    return {
      todayBookings: todaysBookings
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .slice(0, 3),
      tasksDueToday: allTasks.filter((task) => task.dueDate === today).slice(0, 5),
      pipelineColumns,
      recentActivities: recentActivity
        .sort((a, b) => b.occurredOn.localeCompare(a.occurredOn))
        .slice(0, 5)
        .map((activity) => ({
          ...activity,
          time: toRelativeLabel(activity.occurredOn),
        })),
      stats: {
        revenueThisWeek,
        conversionRate: activeClients.length
          ? Math.round((todaysBookings.length / Math.max(activeClients.length, 1)) * 100)
          : 0,
        activeInquiries: pipelineColumns.reduce((sum, col) => sum + col.count, 0),
        activeClients: activeClients.length,
        monthlyRevenue: bookingsThisMonth.reduce(
          (sum, booking) => sum + (booking.amountCents ?? 0),
          0,
        ),
      },
      subscription,
      usage,
      onboardingComplete: user.onboardingCompleted,
    };
  },
});
