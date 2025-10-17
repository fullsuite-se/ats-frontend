import { useState, useEffect, useMemo } from "react";
import { Clock, CalendarDays } from "lucide-react";
import { formatTime } from "../../utils/dateUtils";

export default function EventsList({ events = [], loading }) {
  const [page, setPage] = useState(1);
  const eventsPerPage = 2;

  const getEventStatus = (event) => {
    const now = new Date();
    const start = event.start?.dateTime
      ? new Date(event.start.dateTime)
      : new Date(event.start?.date);
    const end = event.end?.dateTime
      ? new Date(event.end.dateTime)
      : new Date(event.end?.date || event.start?.date);

    if (end < now) return "past";
    if (start.toDateString() === now.toDateString()) return "today";
    return "upcoming";
  };

  const getOrganizerName = (organizer) => {
    if (!organizer) return null;
    const displayName = organizer.displayName?.trim();
    const email = organizer.email?.trim();
    const isWeirdEmail =
      email &&
      email.startsWith("c_") &&
      email.endsWith("@group.calendar.google.com");
    if (displayName) return displayName;
    if (email && !isWeirdEmail) return email;
    return null;
  };

  const formatEventDate = (event) => {
    const start = event.start?.dateTime
      ? new Date(event.start.dateTime)
      : new Date(event.start?.date);

    return start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const sortedByStart = useMemo(() => {
    return [...events].sort((a, b) => {
      const startA = new Date(a.start?.dateTime || a.start?.date).getTime();
      const startB = new Date(b.start?.dateTime || b.start?.date).getTime();
      return startA - startB;
    });
  }, [events]);

  const statusOrder = { today: 0, upcoming: 1, past: 2 };

  const visibleEvents = useMemo(() => {
    return [...sortedByStart].sort((a, b) => {
      const sa = getEventStatus(a);
      const sb = getEventStatus(b);
      const orderDiff = statusOrder[sa] - statusOrder[sb];
      if (orderDiff !== 0) return orderDiff;
      const startA = new Date(a.start?.dateTime || a.start?.date).getTime();
      const startB = new Date(b.start?.dateTime || b.start?.date).getTime();
      return startA - startB;
    });
  }, [sortedByStart]);

  const totalPages = Math.ceil(visibleEvents.length / eventsPerPage) || 0;

  useEffect(() => setPage(1), [events]);
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(Math.max(1, totalPages));
    }
  }, [totalPages, page]);

  const paginatedEvents = visibleEvents.slice(
    (page - 1) * eventsPerPage,
    page * eventsPerPage,
  );

  const getBadgeColor = (status) => {
    switch (status) {
      case "today":
        return "bg-green-100 text-green-700";
      case "past":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-gray-200 bg-white px-3 py-3 shadow-sm sm:px-4 sm:py-4 md:px-6"
          >
            <div className="mb-2 h-4 w-32 rounded bg-gray-300 sm:w-40"></div>
            <div className="h-3 w-24 rounded bg-gray-200 sm:w-28"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Events List */}
      {!visibleEvents.length ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-8 text-center shadow-sm sm:py-10 md:py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 shadow-inner sm:h-14 sm:w-14 md:h-16 md:w-16">
            <CalendarDays className="h-6 w-6 text-gray-400 sm:h-7 sm:w-7 md:h-8 md:w-8" />
          </div>
          <p className="mt-4 text-sm font-normal text-gray-600 sm:text-base">
            No events scheduled for this date.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2.5 sm:space-y-3">
            {paginatedEvents.map((event) => {
              const status = getEventStatus(event);
              const organizerText = getOrganizerName(event.organizer);
              const eventDate = formatEventDate(event);

              return (
                <div
                  key={event.id}
                  className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-sm transition hover:shadow-md sm:px-4 sm:py-3 md:px-6 md:py-4"
                >
                  {/* Top row: title + badge */}
                  <div className="xs:flex-row xs:items-start xs:justify-between flex flex-col gap-1.5 sm:gap-2">
                    <p className="text-xs leading-tight font-semibold break-words whitespace-normal text-gray-900 sm:text-sm md:text-base">
                      {(event.summary || "Untitled Event")
                        .replace(/[()]/g, "")
                        .trim()}
                    </p>
                    <span
                      className={`inline-flex shrink-0 items-center self-start rounded-full px-2 py-0.5 text-[10px] font-medium sm:text-xs ${getBadgeColor(
                        status,
                      )}`}
                    >
                      {status === "today"
                        ? "Today"
                        : status === "past"
                          ? "Past"
                          : "Upcoming"}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="mt-1 flex items-center text-[10px] font-medium text-teal-600 sm:text-xs">
                    <CalendarDays
                      size={10}
                      className="mr-1 shrink-0 sm:h-3 sm:w-3"
                    />
                    <span>{eventDate}</span>
                  </div>

                  {/* Organizer */}
                  {organizerText && (
                    <p className="mt-1 text-[10px] break-words whitespace-normal text-gray-600 sm:text-xs md:text-sm">
                      Booked by{" "}
                      <span className="font-medium text-gray-800">
                        {organizerText}
                      </span>
                    </p>
                  )}

                  {/* Time */}
                  <div className="mt-1.5 flex flex-wrap items-center text-[10px] break-words whitespace-normal text-gray-500 sm:mt-2 sm:text-xs md:text-sm">
                    <Clock
                      size={10}
                      className="mr-1 shrink-0 text-gray-400 sm:h-3 sm:w-3"
                    />
                    <span>
                      {event.start?.dateTime
                        ? formatTime(event.start.dateTime)
                        : "All day"}
                    </span>
                    {event.end?.dateTime && (
                      <span className="ml-1">
                        – {formatTime(event.end.dateTime)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="xs:flex-row xs:items-center xs:justify-between flex flex-col gap-2 border-t border-gray-200 pt-3 sm:gap-3 sm:pt-4">
              <div className="xs:justify-start xs:w-auto flex w-full justify-between gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="xs:flex-none flex-1 rounded-md border border-gray-300 px-2.5 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:py-1.5 sm:text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="xs:flex-none flex-1 rounded-md border border-gray-300 px-2.5 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:py-1.5 sm:text-sm"
                >
                  Next
                </button>
              </div>
              <span className="xs:text-right xs:w-auto w-full text-center text-[10px] text-gray-500 sm:text-xs md:text-sm">
                Page {page} of {totalPages}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}