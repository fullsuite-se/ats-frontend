import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Mock constants - replace with your actual imports
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CustomCalendar({
  selectedDate = new Date(),
  onDateChange = () => {},
  eventDates = ["2024-12-15", "2024-12-22", "2024-12-25", "2024-12-31"],
  loading = false,
}) {
  const today = new Date();

  // ✅ Split the state: view month vs picked date
  const [viewDate, setViewDate] = useState(selectedDate);
  const [pickedDate, setPickedDate] = useState(today); // default select today

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // First day of the month (0=Sun, 6=Sat)
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  // Build calendar grid
  const days = [];
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentYear, currentMonth, i));
  }

  // Helper functions
  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const formatDate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate(),
    ).padStart(2, "0")}`;

  const isToday = (date) => isSameDay(date, today);

  // Navigation functions
  const goToPreviousMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={goToPreviousMonth}
          disabled={loading}
          className="rounded-md p-1 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>

        <h3 className="text-lg font-semibold text-gray-900">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h3>

        <button
          onClick={goToNextMonth}
          disabled={loading}
          className="rounded-md p-1 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Next month"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-gray-500">
        {WEEKDAYS.map((day) => (
          <div key={day} className="flex h-10 items-center justify-center">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="mt-2 grid grid-cols-7 gap-2 text-center text-sm">
        {days.map((date, idx) => {
          if (!date) return <div key={idx} className="h-10"></div>;

          const isSelected = pickedDate ? isSameDay(date, pickedDate) : false;
          const isEventDay = eventDates.includes(formatDate(date));
          const isTodayDate = isToday(date);

          // Normalize "today" to midnight for fair comparison
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);

          // ✅ Check if this event is today or future
          const isFutureOrTodayEvent = isEventDay && date >= todayStart;

          return (
            <button
              key={idx}
              onClick={() => {
                setPickedDate(date);
                onDateChange(date);
              }}
              disabled={loading}
              className={`focus:ring-teal relative flex h-10 w-full items-center justify-center rounded-full font-medium transition-all duration-150 hover:bg-blue-50 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${isSelected ? "bg-teal text-white" : ""} ${!isSelected && isTodayDate ? "bg-blue-100 font-semibold text-teal" : ""} ${!isSelected && !isTodayDate ? "text-gray-700" : ""} ${isFutureOrTodayEvent && !isSelected ? "bg-blue-50" : ""} /* ✅ past events won't add background color */`}
            >
              {date.getDate()}

              {/* Event indicator dot (only for today or future events) */}
              {isFutureOrTodayEvent && !isSelected && (
                <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"></div>
          <span className="ml-2 text-sm text-gray-600">Loading...</span>
        </div>
      )}
    </div>
  );
}