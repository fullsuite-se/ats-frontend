import { Clock, User, Calendar } from "lucide-react";
import { formatTime } from "../../utils/dateUtils";
import { stripHTML } from "../../utils/htmlUtils";

export default function EventCard({ event }) {
  // Enhanced organizer name processing
  const getOrganizerName = (organizer) => {
    if (!organizer) return "Unknown";
    
    if (organizer.displayName) {
      return organizer.displayName;
    }
    
    if (organizer.email) {
      // Handle special cases like Talentscout
      if (organizer.email.toLowerCase().includes("talentscout")) {
        return "Talentscout";
      }
      
      // Extract name from email
      const name = organizer.email.split("@")[0];
      return name
        .replace(/[._-]+/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    }
    
    return "Unknown";
  };

  // Clean event title
  const cleanTitle = (title) => {
    if (!title) return "Untitled Event";
    return title.replace(/[()]/g, "").trim();
  };

  // Get event type color based on content
  const getEventTypeColor = (event) => {
    const title = event.summary?.toLowerCase() || "";
    const description = event.description?.toLowerCase() || "";
    
    if (title.includes("interview") || description.includes("interview")) {
      return "from-emerald-500 to-emerald-600";
    }
    if (title.includes("meeting") || description.includes("meeting")) {
      return "from-blue-500 to-blue-600";
    }
    if (title.includes("call") || description.includes("call")) {
      return "from-purple-500 to-purple-600";
    }
    return "from-teal-500 to-teal-600"; // default
  };

  const eventColorClass = getEventTypeColor(event);
  const organizerName = getOrganizerName(event.organizer);

  return (
    <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-teal-100/50 bg-white/60 p-3 sm:p-4 lg:p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 hover:scale-[1.01] sm:hover:scale-[1.02]">
      {/* Gradient accent bar */}
      <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${eventColorClass}`}></div>
      
      {/* Header with icon */}
      <div className="mb-2 sm:mb-3 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="mb-1 text-sm sm:text-base font-semibold leading-snug text-slate-800 group-hover:text-slate-900 transition-colors line-clamp-2">
            {cleanTitle(event.summary)}
          </h4>
        </div>
        <div className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${eventColorClass} shadow-md ml-2 sm:ml-3`}>
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <div className="mb-3 rounded-lg bg-slate-50/50 p-3">
          <p className="text-sm leading-relaxed text-slate-600">
            {stripHTML(event.description).substring(0, 120)}
            {stripHTML(event.description).length > 120 && "..."}
          </p>
        </div>
      )}

      {/* Organizer section */}
      <div className="mb-3 flex items-center space-x-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300">
          <User className="h-3.5 w-3.5 text-slate-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-700">
            Organized by {organizerName}
          </p>
          {event.organizer?.email && organizerName !== event.organizer.email && (
            <p className="text-xs text-slate-500 truncate">
              {event.organizer.email}
            </p>
          )}
        </div>
      </div>

      {/* Time section */}
      <div className="flex items-center space-x-2 rounded-lg bg-teal-50/80 p-2.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-500 shadow-sm">
          <Clock className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-teal-700">
            {event.start?.dateTime
              ? formatTime(event.start.dateTime)
              : "All day"}
            {event.end?.dateTime && (
              <span className="text-teal-600"> - {formatTime(event.end.dateTime)}</span>
            )}
          </p>
          {event.start?.dateTime && (
            <p className="text-xs text-teal-600">
              {new Date(event.start.dateTime).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric"
              })}
            </p>
          )}
        </div>
      </div>

      {/* Subtle hover effect overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/0 to-cyan-500/0 transition-all duration-300 group-hover:from-teal-500/5 group-hover:to-cyan-500/5"></div>
    </div>
  );
}