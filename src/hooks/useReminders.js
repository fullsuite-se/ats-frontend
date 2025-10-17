import { useEffect } from "react";

export function useReminders(appointments) {
  useEffect(() => {
    if (!("Notification" in window)) return;

    Notification.requestPermission();

    const interval = setInterval(() => {
      const now = new Date();
      appointments.forEach((event) => {
        const eventTime = new Date(event.start.dateTime || event.start.date);
        const diffMinutes = (eventTime - now) / 1000 / 60;

        if (diffMinutes > 9 && diffMinutes < 11) {
          new Notification("Upcoming Event", {
            body: `${event.summary} starts at ${eventTime.toLocaleTimeString()}`,
            icon: "/calendar-icon.png",
          });
        }
      });
    }, 60000); // check every minute

    return () => clearInterval(interval);
  }, [appointments]);
}