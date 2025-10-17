import { useState, useMemo } from "react";
import { formatDate } from "../utils/dateUtils";

export function useNotifications(appointments = []) {
  const [readNotifications, setReadNotifications] = useState(new Set());

  const todayAppointments = useMemo(
    () =>
      appointments.filter((event) => {
        const eventDate = event.start?.dateTime
          ? formatDate(new Date(event.start.dateTime))
          : formatDate(new Date(event.start.date));
        return eventDate === formatDate(new Date());
      }),
    [appointments],
  );

  const unreadCount = todayAppointments.filter(
    (appt) => !readNotifications.has(appt.id),
  ).length;

  const markAsRead = (id) =>
    setReadNotifications((prev) => new Set(prev).add(id));

  const markAllAsRead = () =>
    setReadNotifications(
      (prev) => new Set([...prev, ...todayAppointments.map((a) => a.id)]),
    );

  return {
    todayAppointments,
    unreadCount,
    markAsRead,
    markAllAsRead,
    readNotifications,
  };
}