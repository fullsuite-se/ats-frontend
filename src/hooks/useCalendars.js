import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export function useCalendars() {
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCalendars = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/calendar/calendars`, {
        credentials: "include",
      });
      const data = await res.json();
      console.log("Fetched calendars:", data);
      setCalendars(data.calendars || []);
    } catch (err) {
      console.error("Error fetching calendars:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendars();
  }, []);

  return { calendars, loading, error, fetchCalendars };
}