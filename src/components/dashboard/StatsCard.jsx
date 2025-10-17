import {
  CalendarDays,
  Clock,
  Bell,
  Calendar,
  BarChart3,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

// Mock utilities (replace with your actual imports)
const formatDate = (date) => date.toLocaleDateString();
const startOfWeek = (date) => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(start.setDate(diff));
};
const endOfWeek = (date) => {
  const start = startOfWeek(date);
  return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
};
const format = (date, formatStr) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  if (formatStr === "EEEE") return days[date.getDay()];
  return date.toLocaleDateString();
};

// Simple StatCard with teal icons only
function StatCard({ icon: Icon, label, value, subtext }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 transition hover:shadow-md">
      <div className="flex items-center">
        <div className="rounded-lg bg-teal-100 p-2">
          <Icon className="h-5 w-5 text-teal-600" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

// Helper: Weekly stats
function getWeeklyStats(appointments) {
  const start = startOfWeek(new Date());
  const end = endOfWeek(new Date());

  const weeklyEvents = appointments.filter((event) => {
    const date = new Date(event.start?.dateTime || event.start?.date);
    return date >= start && date <= end;
  });

  const byDay = {};
  weeklyEvents.forEach((event) => {
    const day = format(
      new Date(event.start?.dateTime || event.start?.date),
      "EEEE",
    );
    byDay[day] = (byDay[day] || 0) + 1;
  });

  const busiestDay =
    Object.entries(byDay).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  return { total: weeklyEvents.length, busiestDay };
}

export default function StatsCards({ appointments = [] }) {
  const today = formatDate(new Date());
  const now = new Date();

  // Sample data for demonstration
  const sampleAppointments =
    appointments.length > 0
      ? appointments
      : [
          {
            start: { dateTime: "2024-09-18T09:00:00" },
            end: { dateTime: "2024-09-18T10:00:00" },
          },
          {
            start: { dateTime: "2024-09-18T14:00:00" },
            end: { dateTime: "2024-09-18T15:00:00" },
          },
          {
            start: { dateTime: "2024-09-17T11:00:00" },
            end: { dateTime: "2024-09-17T12:00:00" },
          },
          {
            start: { dateTime: "2024-09-19T16:00:00" },
            end: { dateTime: "2024-09-19T17:00:00" },
          },
          {
            start: { dateTime: "2024-09-20T10:00:00" },
            end: { dateTime: "2024-09-20T11:00:00" },
          },
          {
            start: { dateTime: "2024-09-15T15:00:00" },
            end: { dateTime: "2024-09-15T16:00:00" },
          },
          {
            start: { dateTime: "2024-09-14T13:00:00" },
            end: { dateTime: "2024-09-14T14:00:00" },
          },
        ];

  // Calculate stats
  const doneEvents = sampleAppointments.filter((event) => {
    const eventEnd = new Date(event.end?.dateTime || event.end?.date);
    return eventEnd < now;
  }).length;

  const todaysEvents = sampleAppointments.filter((event) => {
    const eventDate = event.start?.dateTime
      ? formatDate(new Date(event.start.dateTime))
      : formatDate(new Date(event.start.date));
    return eventDate === today;
  }).length;

  const upcomingEvents = sampleAppointments.filter((event) => {
    const eventDate = new Date(event.start?.dateTime || event.start?.date);
    return eventDate > now;
  }).length;

  const thisMonthEvents = sampleAppointments.filter((event) => {
    const eventDate = new Date(event.start?.dateTime || event.start?.date);
    return (
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const { total: weeklyTotal, busiestDay } = getWeeklyStats(sampleAppointments);

  return (
    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-5">
      <StatCard
        icon={Clock}
        label="Today's Events"
        value={todaysEvents}
        variant="secondary"
      />
      <StatCard
        icon={BarChart3}
        label="This Week"
        value={weeklyTotal}
        subtext={`Busiest: ${busiestDay}`}
        variant="secondary"
      />
      <StatCard icon={Calendar} label="This Month" value={thisMonthEvents} />

      <StatCard icon={Bell} label="Upcoming" value={upcomingEvents} />
      <StatCard
        icon={CheckCircle}
        label="Completed Events"
        value={doneEvents}
        variant="primary"
      />
    </div>
  );
}
