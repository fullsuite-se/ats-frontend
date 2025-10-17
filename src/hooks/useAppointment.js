import { useState } from "react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async (calendarId = "primary") => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/api/calendar/appointments?calendarId=${calendarId}`,
        {
          method: "GET",  
          credentials: "include",
        },
      );
      const data = await res.json();
      setAppointments(data.events || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  return { appointments, setAppointments, loading, fetchAppointments };
}