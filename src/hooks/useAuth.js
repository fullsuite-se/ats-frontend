import { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get(`${API}/auth/me`, { withCredentials: true })
      .then((res) => {
        if (res.data?.authenticated) {
          setUser(res.data.user);
        }
      })
      .catch(() => {});
  }, []);

  const logout = async () => {
    await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    setUser(null);
  };

  const startAuth = async () => {
    try {
      const res = await axios.get(`${API}/auth/url`);
      window.location.href = res.data.url;
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  return { user, setUser, logout, startAuth };
}