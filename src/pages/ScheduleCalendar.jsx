import { useState, useEffect, useRef } from "react";
import {
  CalendarDays,
  LogOut,
  User,
  ChevronDown,
  Calendar,
  Bell,
  Search,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useAppointments } from "../hooks/useAppointment";
import { useCalendars } from "../hooks/useCalendars";
import { useNotifications } from "../hooks/useNotifications";
import { formatDate } from "../utils/dateUtils";

import LoadingOverlay from "../components/layout/LoadingOverlay";
import CustomCalendar from "../components/calendar/CustomCalendar";
import EventsList from "../components/events/EventsList";
import StatsCards from "../components/dashboard/StatsCard";
import {
  NotificationBell,
  NotificationDropdown,
} from "../components/notifications";

export default function ScheduleCalendar({ onRefresh }) {
  const { user, logout, startAuth } = useAuth();
  const { appointments, loading, fetchAppointments } = useAppointments();
  const { calendars } = useCalendars();
  const { todayAppointments, unreadCount, markAsRead, markAllAsRead } =
    useNotifications(appointments);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCalendar, setSelectedCalendar] = useState("primary");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // 🔍 NEW
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Initial fetch
  useEffect(() => {
    if (user) fetchAppointments(selectedCalendar);
  }, [selectedCalendar, user]);

  // Re-fetch on refresh
  useEffect(() => {
    if (onRefresh !== undefined) {
      fetchAppointments(selectedCalendar);
    }
  }, [onRefresh]);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleOutsideClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [showUserMenu]);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleOutsideClick(e) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    }

    if (showNotifications) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [showNotifications]);

  // All event dates for calendar highlighting
  const eventDates = appointments.map((event) =>
    event.start?.dateTime
      ? formatDate(new Date(event.start.dateTime))
      : formatDate(new Date(event.start.date)),
  );

  // 🔍 Filter appointments by search query (whole calendar)
  const filteredAppointments = appointments.filter((event) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const title = (event.summary || "").toLowerCase();
    const description = (event.description || "").toLowerCase();
    const location = (event.location || "").toLowerCase();

    return (
      title.includes(query) ||
      description.includes(query) ||
      location.includes(query)
    );
  });

  // Events for selected date (still filtered by search if present)
  const eventsForSelectedDate = filteredAppointments.filter((event) => {
    const eventDate = event.start?.dateTime
      ? formatDate(new Date(event.start.dateTime))
      : formatDate(new Date(event.start.date));
    return eventDate === formatDate(selectedDate);
  });

  const handleNotificationClick = (appointment) => {
    markAsRead(appointment.id);
    const appointmentDate = appointment.start?.dateTime
      ? new Date(appointment.start.dateTime)
      : new Date(appointment.start.date);
    setSelectedDate(appointmentDate);
    setShowNotifications(false); // Close notifications after clicking
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  function emailToName(emailOrSummary) {
    if (!emailOrSummary) return "";
    if (emailOrSummary.includes("@group.calendar.google.com")) {
      return "Talentscout Calendar";
    }
    if (emailOrSummary.toLowerCase().includes("talentscout")) {
      return "Talentscout";
    }
    const raw = emailOrSummary.includes("@")
      ? emailOrSummary.split("@")[0]
      : emailOrSummary;
    return raw
      .replace(/[._-]+/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50">
      {/* HEADER */}
      <div className="relative z-10 border-b border-teal-100/50 bg-white/80 backdrop-blur-sm">
        <div className="px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex items-center justify-between">
            {/* LEFT SIDE: Title */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/25">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-800 sm:text-3xl">
                    Calendar
                  </h1>
                  <p className="text-sm text-slate-500">
                    Manage your schedule and appointments
                  </p>
                </div>
              </div>
              <div className="h-1 w-16 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500" />
            </div>

            {/* RIGHT SIDE */}
            {user && (
              <div className="flex items-center space-x-6">
                {/* Notifications */}
                <div className="relative z-50" ref={notificationRef}>
                  <NotificationBell
                    unreadCount={unreadCount}
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      if (!showNotifications) {
                        markAllAsRead();
                      }
                    }}
                    className="rounded-xl bg-teal-50 p-3 text-teal-600 shadow-sm transition-all duration-200 hover:bg-teal-100 hover:shadow-md hover:shadow-teal-500/20"
                  />
                  {showNotifications && (
                    <NotificationDropdown
                      todayAppointments={todayAppointments}
                      onClose={() => setShowNotifications(false)}
                      onNotificationClick={handleNotificationClick}
                    />
                  )}
                </div>

                {/* Avatar Dropdown */}
                <div className="relative z-40" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu((prev) => !prev)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-sm font-medium text-white shadow-md"
                    aria-haspopup="true"
                    aria-expanded={showUserMenu}
                    type="button"
                  >
                    {user.name?.charAt(0) || <User size={16} />}
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-lg font-medium text-white shadow-md">
                          {user.name?.charAt(0) || <User size={18} />}
                        </div>
                        <p className="text-sm font-medium text-slate-800">
                          {user.name}
                        </p>
                        <p className="mb-3 text-xs text-slate-500">
                          {user.email}
                        </p>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                          type="button"
                        >
                          <LogOut size={14} />
                          Disconnect Calendar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Calendar Selector */}
                {calendars.length > 0 && (
                  <div className="space-y-2">
                    <label
                      htmlFor="calendarSelect"
                      className="text-xs font-medium tracking-wide text-slate-500 uppercase"
                    >
                      Calendar Source
                    </label>
                    <div className="relative">
                      <select
                        id="calendarSelect"
                        value={selectedCalendar}
                        onChange={(e) => setSelectedCalendar(e.target.value)}
                        className="block w-full min-w-52 appearance-none border-0 border-b-2 border-teal-200 bg-transparent px-0 py-2 pr-8 text-sm font-medium text-slate-800 transition-all duration-200 hover:border-teal-400 focus:border-teal-600 focus:ring-0 focus:outline-none"
                      >
                        {calendars.map((cal) => (
                          <option
                            key={cal.id}
                            value={cal.id}
                            className="bg-white text-slate-800"
                          >
                            {emailToName(cal.summary)}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                        <ChevronDown className="h-4 w-4 text-teal-400" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <main className="p-6 sm:p-8">
        {user ? (
          <>
            {/* Stats Cards */}
            <div className="mb-8">
              <StatsCards appointments={appointments} />
            </div>

            {/* Layout */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              {/* Calendar Section */}
              <div className="lg:col-span-3">
                <div className="rounded-3xl border border-teal-100/50 bg-white/60 p-6 shadow-sm backdrop-blur-sm sm:p-8">
                  <CustomCalendar
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    eventDates={eventDates}
                    loading={loading}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Selected Date Card */}
                {/* <div className="rounded-2xl border border-teal-100 bg-white/60 p-6 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:shadow-teal-500/10">
                  <div className="mb-3 flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 shadow-md shadow-teal-500/25">
                      <CalendarDays className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      Selected Date
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div> */}

                {/* 🔍 Search box */}
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search all events..."
                      className="w-full rounded-lg border border-teal-200 bg-white px-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-400 focus:ring-0 focus:outline-none"
                    />
                    <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-teal-400" />
                  </div>
                </div>

                {/* Events List */}
                <div className="rounded-2xl border border-teal-100/50 bg-white/40 p-6 shadow-sm backdrop-blur-sm">
                  <div className="mb-4 flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-md shadow-cyan-500/25">
                      <Bell className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      {searchQuery ? "Search Results" : "Events"}
                    </h3>
                  </div>
                  <EventsList
                    events={
                      searchQuery ? filteredAppointments : eventsForSelectedDate
                    }
                    loading={loading}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-md py-16 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100">
              <CalendarDays className="h-10 w-10 text-teal-600" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-slate-800">
              Welcome to Calendar
            </h3>
            <p className="mb-8 text-slate-600">
              Connect your Google account to view and manage your appointments.
            </p>
            <button
              onClick={startAuth}
              disabled={loading}
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-3 text-base font-medium text-white shadow-lg shadow-teal-500/25 transition-all duration-200 hover:from-teal-600 hover:to-teal-700 hover:shadow-xl hover:shadow-teal-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Get Started
            </button>
          </div>
        )}
      </main>

      {loading && <LoadingOverlay message="Loading your calendar..." />}
    </div>
  );
}