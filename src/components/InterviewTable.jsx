import { useState, useEffect } from "react";
import {
  CalendarDays,
  ChevronDown,
  Briefcase,
  Clock,
  Users,
  MapPin,
  X,
  Calendar,
  User,
  Link,
  FileText,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useAppointments } from "../hooks/useAppointment";
import { useCalendars } from "../hooks/useCalendars";
import LoadingOverlay from "../components/layout/LoadingOverlay";

export default function InterviewTable({ onRefresh }) {
  const { user, startAuth } = useAuth() || {};
  const {
    appointments = [],
    loading = false,
    fetchAppointments,
  } = useAppointments() || {};
  const { calendars = [] } = useCalendars() || {};

  const [selectedCalendar, setSelectedCalendar] = useState("primary");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user && fetchAppointments) {
      fetchAppointments(selectedCalendar);
    }
  }, [selectedCalendar, user]);

  useEffect(() => {
    if (onRefresh !== undefined && fetchAppointments) {
      fetchAppointments(selectedCalendar);
    }
  }, [onRefresh]);

  // Filter: only next 7 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(23, 59, 59, 999);

  const upcomingAppointments = appointments.filter((event) => {
    const startDate = new Date(event.start?.dateTime || event.start?.date);
    return startDate >= today && startDate <= nextWeek;
  });

  // Conflict Detection Function
  const detectConflicts = (events) => {
    const conflicts = new Map();
    
    for (let i = 0; i < events.length; i++) {
      const event1 = events[i];
      const start1 = new Date(event1.start?.dateTime || event1.start?.date);
      const end1 = new Date(event1.end?.dateTime || event1.end?.date);
      
      // Skip all-day events for conflict detection
      if (!event1.start?.dateTime) continue;
      
      for (let j = i + 1; j < events.length; j++) {
        const event2 = events[j];
        const start2 = new Date(event2.start?.dateTime || event2.start?.date);
        const end2 = new Date(event2.end?.dateTime || event2.end?.date);
        
        // Skip all-day events for conflict detection
        if (!event2.start?.dateTime) continue;
        
        // Check for time overlap
        if (start1 < end2 && start2 < end1) {
          // Calculate overlap duration
          const overlapStart = new Date(Math.max(start1, start2));
          const overlapEnd = new Date(Math.min(end1, end2));
          const overlapMinutes = (overlapEnd - overlapStart) / (1000 * 60);
          
          const conflictInfo = {
            conflictsWith: [event2.id],
            overlapMinutes,
            severity: overlapMinutes >= 30 ? 'high' : 'medium'
          };
          
          if (!conflicts.has(event1.id)) {
            conflicts.set(event1.id, conflictInfo);
          } else {
            conflicts.get(event1.id).conflictsWith.push(event2.id);
          }
          
          if (!conflicts.has(event2.id)) {
            conflicts.set(event2.id, {
              conflictsWith: [event1.id],
              overlapMinutes,
              severity: overlapMinutes >= 30 ? 'high' : 'medium'
            });
          } else {
            conflicts.get(event2.id).conflictsWith.push(event1.id);
          }
        }
      }
    }
    
    return conflicts;
  };

  const conflictMap = detectConflicts(upcomingAppointments);

  // Group by Date
  const eventsByDate = upcomingAppointments.reduce((acc, event) => {
    const dateKey = new Date(
      event.start?.dateTime || event.start?.date,
    ).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {});

  // Status functions
  const getEventStatus = (event) => {
    const now = new Date();
    const start = event.start?.dateTime
      ? new Date(event.start.dateTime)
      : new Date(event.start?.date);
    const end = event.end?.dateTime
      ? new Date(event.end.dateTime)
      : new Date(event.end?.date || start);

    if (start <= now && end > now) return "live";
    if (end < now) return "completed";
    if (start.toDateString() === now.toDateString()) return "today";
    return "upcoming";
  };

  const formatTime = (event) => {
    if (!event.start?.dateTime) return "All day";

    const start = new Date(event.start.dateTime);
    const end = event.end?.dateTime ? new Date(event.end.dateTime) : null;

    const startTime = start.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (end) {
      const endTime = end.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return `${startTime} - ${endTime}`;
    }

    return startTime;
  };

  function emailToName(emailOrSummary) {
    if (!emailOrSummary) return "";

    // Handle special calendar names
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

  // Enhanced Event Card Component with Conflict Detection
  const EnhancedEventCard = ({ event }) => {
    const status = getEventStatus(event);
    const hasConflict = conflictMap.has(event.id);
    const conflictInfo = conflictMap.get(event.id);

    const getBadgeStyles = (status) => {
      switch (status) {
        case "live":
          return "bg-red-50 text-red-700 border border-red-100";
        case "completed":
          return "bg-gray-50 text-gray-600 border border-gray-100";
        case "today":
          return "bg-green-50 text-green-700 border border-green-100";
        default:
          return "bg-blue-50 text-blue-700 border border-blue-100";
      }
    };

    const getBadgeText = (status) => {
      switch (status) {
        case "live":
          return "Live";
        case "completed":
          return "Completed";
        case "today":
          return "Today";
        default:
          return "Upcoming";
      }
    };

    const getStatusBarColor = (status, hasConflict) => {
      if (hasConflict) {
        return conflictInfo?.severity === 'high' ? "bg-red-500" : "bg-orange-500";
      }
      
      switch (status) {
        case "live":
          return "bg-red-500";
        case "completed":
          return "bg-gray-300";
        case "today":
          return "bg-green-500";
        default:
          return "bg-blue-500";
      }
    };

    const getConflictBadgeStyles = (severity) => {
      return severity === 'high' 
        ? "bg-red-50 text-red-700 border border-red-200"
        : "bg-orange-50 text-orange-700 border border-orange-200";
    };

    const handleCardClick = () => {
      setSelectedEvent(event);
      setShowModal(true);
    };

    return (
      <div
        onClick={handleCardClick}
        className={`group relative cursor-pointer rounded-2xl border p-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md ${
          hasConflict 
            ? conflictInfo?.severity === 'high'
              ? "border-red-200 bg-red-50/60 hover:shadow-red-500/10" 
              : "border-orange-200 bg-orange-50/60 hover:shadow-orange-500/10"
            : "border-teal-100/50 bg-white/60 hover:shadow-teal-500/10"
        }`}
      >
        {/* Status bar */}
        <div
          className={`absolute top-0 bottom-0 left-0 w-1 rounded-l-2xl ${getStatusBarColor(status, hasConflict)}`}
        />

        {/* Conflict indicator */}
        {hasConflict && (
          <div className="absolute -top-2 -right-2 z-10">
            <div className={`flex items-center justify-center h-6 w-6 rounded-full ${
              conflictInfo?.severity === 'high' ? 'bg-red-500' : 'bg-orange-500'
            } shadow-lg`}>
              {conflictInfo?.severity === 'high' ? (
                <AlertTriangle className="h-3 w-3 text-white" />
              ) : (
                <Zap className="h-3 w-3 text-white" />
              )}
            </div>
          </div>
        )}

        <div className="pl-3">
          {/* Header with title and badges */}
          <div className="mb-3 flex items-start justify-between">
            <h3 className={`line-clamp-2 text-sm font-semibold transition-colors group-hover:text-teal-700 ${
              hasConflict ? 'text-slate-900' : 'text-slate-800'
            }`}>
              {event.summary || "Untitled Interview"}
            </h3>
            <div className="ml-2 flex flex-col space-y-1">
              <span
                className={`rounded-md px-2 py-1 text-xs font-medium ${getBadgeStyles(status)}`}
              >
                {getBadgeText(status)}
              </span>
              {hasConflict && (
                <span
                  className={`rounded-md px-2 py-1 text-xs font-medium ${getConflictBadgeStyles(conflictInfo.severity)}`}
                >
                  {conflictInfo.severity === 'high' ? 'Conflict!' : 'Overlap'}
                </span>
              )}
            </div>
          </div>

          {/* Conflict warning */}
          {hasConflict && (
            <div className={`mb-3 rounded-lg border p-2 ${
              conflictInfo.severity === 'high' 
                ? 'border-red-200 bg-red-50' 
                : 'border-orange-200 bg-orange-50'
            }`}>
              <div className="flex items-center space-x-2">
                {conflictInfo.severity === 'high' ? (
                  <AlertTriangle className="h-3 w-3 text-red-600" />
                ) : (
                  <Zap className="h-3 w-3 text-orange-600" />
                )}
                <span className={`text-xs font-medium ${
                  conflictInfo.severity === 'high' ? 'text-red-700' : 'text-orange-700'
                }`}>
                  {conflictInfo.overlapMinutes >= 60 
                    ? `${Math.round(conflictInfo.overlapMinutes / 60)}h overlap`
                    : `${Math.round(conflictInfo.overlapMinutes)}min overlap`
                  } with {conflictInfo.conflictsWith.length} event{conflictInfo.conflictsWith.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Time */}
          <div className="mb-2 flex items-center text-xs text-slate-600">
            <Clock className="mr-2 h-3 w-3" />
            <span>{formatTime(event)}</span>
          </div>

          {/* Location */}
          {event.location && (
            <div className="mb-2 flex items-center text-xs text-slate-600">
              <MapPin className="mr-2 h-3 w-3" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {/* Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <div className="mt-3 flex items-center text-xs text-slate-500">
              <div className="mr-2 flex -space-x-1">
                {event.attendees.slice(0, 3).map((attendee, i) => (
                  <div
                    key={i}
                    className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-teal-400 to-teal-500 text-xs font-medium text-white"
                    title={attendee.email}
                  >
                    {attendee.displayName?.charAt(0) ||
                      attendee.email?.charAt(0) ||
                      "?"}
                  </div>
                ))}
                {event.attendees.length > 3 && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-xs font-medium text-slate-600">
                    +{event.attendees.length - 3}
                  </div>
                )}
              </div>
              <span>
                {event.attendees.length} participant
                {event.attendees.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Calculate stats
  const todayEvents = upcomingAppointments.filter((event) => {
    const eventDate = new Date(event.start?.dateTime || event.start?.date);
    return eventDate.toDateString() === today.toDateString();
  });

  const conflictingEvents = upcomingAppointments.filter(event => conflictMap.has(event.id));
  const thisWeekEvents = upcomingAppointments.length;

  const EventDetailsModal = ({ event, isOpen, onClose }) => {
    if (!isOpen || !event) return null;

    const status = getEventStatus(event);
    const hasConflict = conflictMap.has(event.id);
    const conflictInfo = conflictMap.get(event.id);

    const formatDetailedTime = (event) => {
      if (!event.start?.dateTime) return "All day event";

      const start = new Date(event.start.dateTime);
      const end = event.end?.dateTime ? new Date(event.end.dateTime) : null;

      const dateStr = start.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const startTime = start.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      if (end) {
        const endTime = end.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        return `${dateStr} • ${startTime} - ${endTime}`;
      }

      return `${dateStr} • ${startTime}`;
    };

    const getBadgeStyles = (status) => {
      switch (status) {
        case "live":
          return "bg-red-50 text-red-700 border border-red-100";
        case "completed":
          return "bg-gray-50 text-gray-600 border border-gray-100";
        case "today":
          return "bg-green-50 text-green-700 border border-green-100";
        default:
          return "bg-blue-50 text-blue-700 border border-blue-100";
      }
    };

    const getBadgeText = (status) => {
      switch (status) {
        case "live":
          return "Live Now";
        case "completed":
          return "Completed";
        case "today":
          return "Today";
        default:
          return "Upcoming";
      }
    };

    const getConflictingEvents = () => {
      if (!hasConflict) return [];
      return upcomingAppointments.filter(e => conflictInfo.conflictsWith.includes(e.id));
    };

    const conflictingEvents = getConflictingEvents();

    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-white/10 p-4 backdrop-blur-md"
        style={{ zIndex: 9999 }}
        onClick={onClose}
      >
        <div
          className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`relative rounded-t-2xl border-b border-gray-100 p-6 ${
            hasConflict 
              ? conflictInfo?.severity === 'high'
                ? 'bg-gradient-to-r from-red-50 to-red-100'
                : 'bg-gradient-to-r from-orange-50 to-orange-100'
              : 'bg-gradient-to-r from-teal-50 to-cyan-50'
          }`}>
            <button
              onClick={onClose}
              className="hover:bg-opacity-60 absolute top-4 right-4 rounded-full p-2 transition-colors hover:bg-white"
            >
              <X size={20} className="text-gray-500" />
            </button>

            <div className="flex items-start space-x-4 pr-12">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-lg ${
                hasConflict
                  ? conflictInfo?.severity === 'high'
                    ? 'bg-gradient-to-br from-red-500 to-red-600'
                    : 'bg-gradient-to-br from-orange-500 to-orange-600'
                  : 'bg-gradient-to-br from-teal-500 to-teal-600'
              }`}>
                {hasConflict && conflictInfo?.severity === 'high' ? (
                  <AlertTriangle className="h-6 w-6 text-white" />
                ) : hasConflict ? (
                  <Zap className="h-6 w-6 text-white" />
                ) : (
                  <Briefcase className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                  {event.summary || "Untitled Interview"}
                </h2>
                <div className="flex space-x-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getBadgeStyles(status)}`}
                  >
                    {getBadgeText(status)}
                  </span>
                  {hasConflict && (
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                        conflictInfo.severity === 'high'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-orange-50 text-orange-700 border border-orange-200'
                      }`}
                    >
                      {conflictInfo.severity === 'high' ? (
                        <>
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Schedule Conflict
                        </>
                      ) : (
                        <>
                          <Zap className="mr-1 h-3 w-3" />
                          Time Overlap
                        </>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6 p-6">
            {/* Conflict Warning */}
            {hasConflict && (
              <div className={`rounded-lg border p-4 ${
                conflictInfo.severity === 'high'
                  ? 'border-red-200 bg-red-50'
                  : 'border-orange-200 bg-orange-50'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                    conflictInfo.severity === 'high' ? 'bg-red-500' : 'bg-orange-500'
                  }`}>
                    {conflictInfo.severity === 'high' ? (
                      <AlertTriangle className="h-4 w-4 text-white" />
                    ) : (
                      <Zap className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className={`font-medium ${
                      conflictInfo.severity === 'high' ? 'text-red-900' : 'text-orange-900'
                    }`}>
                      {conflictInfo.severity === 'high' ? 'Schedule Conflict Detected' : 'Time Overlap Detected'}
                    </h4>
                    <p className={`mt-1 text-sm ${
                      conflictInfo.severity === 'high' ? 'text-red-700' : 'text-orange-700'
                    }`}>
                      This interview overlaps with {conflictingEvents.length} other event{conflictingEvents.length !== 1 ? 's' : ''} 
                      {' '}by {conflictInfo.overlapMinutes >= 60 
                        ? `${Math.round(conflictInfo.overlapMinutes / 60)} hour${Math.round(conflictInfo.overlapMinutes / 60) !== 1 ? 's' : ''}`
                        : `${Math.round(conflictInfo.overlapMinutes)} minute${Math.round(conflictInfo.overlapMinutes) !== 1 ? 's' : ''}`
                      }.
                    </p>
                    {conflictingEvents.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {conflictingEvents.map((conflictEvent, index) => (
                          <div key={index} className={`text-sm ${
                            conflictInfo.severity === 'high' ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            • {conflictEvent.summary || 'Untitled Event'} ({formatTime(conflictEvent)})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Date & Time */}
            <div className="flex items-start space-x-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-teal-100">
                <Calendar className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h3 className="mb-1 font-medium text-gray-900">Date & Time</h3>
                <p className="text-gray-600">{formatDetailedTime(event)}</p>
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="mb-1 font-medium text-gray-900">Location</h3>
                  <p className="text-gray-600">{event.location}</p>
                </div>
              </div>
            )}

            {/* Attendees */}
            {event.attendees && event.attendees.length > 0 && (
              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-green-100">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-3 font-medium text-gray-900">
                    Participants ({event.attendees.length})
                  </h3>
                  <div
                    className="max-h-48 space-y-2 overflow-y-auto pr-2"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "#10b981 #f3f4f6",
                    }}
                  >
                    <style jsx>{`
                      div::-webkit-scrollbar {
                        width: 6px;
                      }
                      div::-webkit-scrollbar-track {
                        background: #f1f5f9;
                        border-radius: 10px;
                      }
                      div::-webkit-scrollbar-thumb {
                        background: linear-gradient(180deg, #10b981, #059669);
                        border-radius: 10px;
                      }
                      div::-webkit-scrollbar-thumb:hover {
                        background: linear-gradient(180deg, #059669, #047857);
                      }
                    `}</style>
                    {event.attendees.map((attendee, index) => {
                      const getName = (attendee) => {
                        if (
                          attendee.displayName &&
                          attendee.displayName.trim()
                        ) {
                          return attendee.displayName.trim();
                        }
                        if (attendee.email) {
                          const emailName = attendee.email.split("@")[0];
                          return emailName
                            .replace(/[._-]/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase());
                        }
                        return "Unknown";
                      };

                      const getInitials = (name, email) => {
                        if (name && name !== "Unknown") {
                          return name
                            .split(" ")
                            .map((n) => n.charAt(0))
                            .join("")
                            .substring(0, 2);
                        }
                        if (email) {
                          return email.charAt(0).toUpperCase();
                        }
                        return "?";
                      };

                      const name = getName(attendee);
                      const initials = getInitials(name, attendee.email);

                      return (
                        <div
                          key={index}
                          className="flex items-center space-x-3"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-teal-500 text-sm font-medium text-white">
                            {initials}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {attendee.email}
                            </p>
                          </div>
                          {attendee.responseStatus && (
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${
                                attendee.responseStatus === "accepted"
                                  ? "bg-green-100 text-green-700"
                                  : attendee.responseStatus === "declined"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {attendee.responseStatus}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-purple-100">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 font-medium text-gray-900">
                    Description
                  </h3>
                  <div
                    className="prose prose-sm max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html: event.description
                        .replace(/<br\s*\/?>/gi, "<br/>")
                        .replace(/href="<\/a>/g, "")
                        .replace(/<\/a>\s*<\/a>/g, "</a>")
                        .replace(
                          /href="([^"]*)"([^>]*>)([^<]*)<\/a>/g,
                          (match, href, attrs, text) => {
                            return href && href.startsWith("http")
                              ? `href="${href}"${attrs}${text}</a>`
                              : text;
                          },
                        ),
                    }}
                  />
                </div>
              </div>
            )}

            {/* Meeting Link */}
            {event.hangoutLink && (
              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-cyan-100">
                  <Link className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="mb-2 font-medium text-gray-900">
                    Meeting Link
                  </h3>
                  <a
                    href={event.hangoutLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    Join Meeting
                  </a>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end border-t border-gray-100 pt-4">
              <button
                onClick={onClose}
                className="rounded-lg bg-gray-100 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50">
      {/* Enhanced Header with Teal Theme */}
      <div className="border-b border-teal-100/50 bg-white/80 backdrop-blur-sm">
        <div className="px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex items-center justify-between">
            {/* LEFT SIDE: Enhanced Title */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/25">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-800 sm:text-3xl">
                    Interview Dashboard
                  </h1>
                  <p className="text-sm text-slate-500">
                    Manage your upcoming interviews
                  </p>
                </div>
              </div>
              <div className="h-1 w-16 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"></div>
            </div>

            {/* RIGHT SIDE: Calendar Selector */}
            {user && calendars.length > 0 && (
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
        </div>
      </div>

      <main className="p-6 sm:p-8">
        {user ? (
          <>
            {/* Enhanced Stats Cards with Conflict Count */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-teal-100 bg-white/60 p-6 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:shadow-teal-500/10">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/25">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">
                      {todayEvents.length}
                    </p>
                    <p className="text-sm text-slate-500">Today's Interviews</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-100 bg-white/60 p-6 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:shadow-cyan-500/10">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/25">
                    <CalendarDays className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">
                      {thisWeekEvents}
                    </p>
                    <p className="text-sm text-slate-500">This Week</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-white/60 p-6 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:shadow-emerald-500/10">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">
                      {Object.keys(eventsByDate).length}
                    </p>
                    <p className="text-sm text-slate-500">Active Days</p>
                  </div>
                </div>
              </div>

              {/* New Conflict Stats Card */}
              <div className={`rounded-2xl border p-6 shadow-sm backdrop-blur-sm transition-all duration-200 ${
                conflictingEvents.length > 0 
                  ? 'border-red-200 bg-red-50/60 hover:shadow-md hover:shadow-red-500/10'
                  : 'border-green-100 bg-white/60 hover:shadow-md hover:shadow-green-500/10'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-lg ${
                    conflictingEvents.length > 0
                      ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/25'
                      : 'bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/25'
                  }`}>
                    {conflictingEvents.length > 0 ? (
                      <AlertTriangle className="h-6 w-6 text-white" />
                    ) : (
                      <Clock className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">
                      {conflictingEvents.length}
                    </p>
                    <p className={`text-sm ${
                      conflictingEvents.length > 0 ? 'text-red-600' : 'text-slate-500'
                    }`}>
                      {conflictingEvents.length > 0 ? 'Schedule Conflicts' : 'No Conflicts'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Content Section */}
            <div className="rounded-3xl border border-teal-100/50 bg-white/40 p-6 shadow-sm backdrop-blur-sm sm:p-8">
              <div className="mb-6 text-center">
                <h2 className="text-xl font-semibold text-slate-800">
                  Upcoming Interviews
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Next 7 days • {upcomingAppointments.length} interview
                  {upcomingAppointments.length !== 1 ? "s" : ""} scheduled
                  {conflictingEvents.length > 0 && (
                    <span className="text-red-600">
                      {" "}• {conflictingEvents.length} conflict{conflictingEvents.length !== 1 ? "s" : ""} detected
                    </span>
                  )}
                </p>
              </div>

              {/* Grouped Events */}
              <div className="space-y-8">
                {Object.keys(eventsByDate).length === 0 ? (
                  <div className="mx-auto max-w-md py-16 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100">
                      <CalendarDays className="h-10 w-10 text-teal-600" />
                    </div>
                    <h3 className="mb-3 text-xl font-medium text-slate-800">
                      No interviews scheduled
                    </h3>
                    <p className="text-slate-500">
                      You have no interviews in the next 7 days. Enjoy your free
                      time!
                    </p>
                  </div>
                ) : (
                  Object.keys(eventsByDate)
                    .sort((a, b) => new Date(a) - new Date(b))
                    .map((date) => {
                      const dayConflicts = eventsByDate[date].filter(event => conflictMap.has(event.id));
                      
                      return (
                        <div key={date} className="space-y-4">
                          {/* Enhanced Date Section with Conflict Indicator */}
                          <div className="flex items-center space-x-4">
                            <div className={`rounded-xl px-4 py-2 text-white shadow-md ${
                              dayConflicts.length > 0
                                ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/25'
                                : 'bg-gradient-to-r from-teal-500 to-cyan-500 shadow-teal-500/25'
                            }`}>
                              <h3 className="text-sm font-semibold">
                                {(() => {
                                  const currentDate = new Date(date);
                                  const today = new Date();
                                  const tomorrow = new Date();
                                  tomorrow.setDate(today.getDate() + 1);

                                  if (
                                    currentDate.toDateString() ===
                                    today.toDateString()
                                  ) {
                                    return "Today";
                                  } else if (
                                    currentDate.toDateString() ===
                                    tomorrow.toDateString()
                                  ) {
                                    return "Tomorrow";
                                  } else {
                                    return currentDate.toLocaleDateString(
                                      "en-US",
                                      {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                      },
                                    );
                                  }
                                })()}
                              </h3>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-slate-800">
                                {new Date(date).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </h4>
                              <p className="text-sm text-slate-500">
                                {eventsByDate[date].length} interview
                                {eventsByDate[date].length !== 1 ? "s" : ""} scheduled
                                {dayConflicts.length > 0 && (
                                  <span className="text-red-600">
                                    {" "}• {dayConflicts.length} conflict{dayConflicts.length !== 1 ? "s" : ""}
                                  </span>
                                )}
                              </p>
                            </div>
                            {dayConflicts.length > 0 && (
                              <div className="flex items-center space-x-1 rounded-full bg-red-100 px-3 py-1">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-medium text-red-700">
                                  {dayConflicts.length} conflict{dayConflicts.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {eventsByDate[date].map((event) => (
                              <EnhancedEventCard key={event.id} event={event} />
                            ))}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-md py-16 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100">
              <CalendarDays className="h-10 w-10 text-teal-600" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-slate-800">
              Welcome to Interview Dashboard
            </h3>
            <p className="mb-8 text-slate-600">
              Connect your Google account to view and manage your interviews.
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

      {loading && <LoadingOverlay message="Loading your interviews..." />}

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedEvent(null);
        }}
      />
    </div>
  );
}