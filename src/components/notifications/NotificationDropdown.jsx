import { X, Calendar, Clock } from "lucide-react";

export default function NotificationDropdown({
  todayAppointments,
  onClose,
  onNotificationClick,
}) {
  // Format time nicely
  const formatTime = (event) => {
    if (!event.start?.dateTime) return "All day";
    const start = new Date(event.start.dateTime);
    return start.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Return live / today / done / upcoming
  const getStatus = (event) => {
    const now = new Date();
    const start = event.start?.dateTime
      ? new Date(event.start.dateTime)
      : new Date(event.start?.date);
    const end = event.end?.dateTime
      ? new Date(event.end.dateTime)
      : new Date(event.end?.date || start);

    // 1. live if ongoing now
    if (start <= now && end > now) return "live";
    // 2. done if already ended
    if (end < now) return "done";
    // 3. today if same-day but not yet started
    if (start.toDateString() === now.toDateString()) return "today";
    // 4. upcoming otherwise
    return "upcoming";
  };

  // Sort: live > today > upcoming > done
  const sortedAppointments = [...todayAppointments].sort((a, b) => {
    const statusOrder = { live: 0, today: 1, upcoming: 2, done: 3 };
    return statusOrder[getStatus(a)] - statusOrder[getStatus(b)];
  });

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-xl shadow-black/5 z-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100/80">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            <span className="text-sm font-semibold text-gray-900">Today</span>
            <span className="text-xs text-gray-500 ml-1">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-150"
          >
            <X size={14} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-72 overflow-y-auto py-2">
          {sortedAppointments.length > 0 ? (
            sortedAppointments.map((appointment) => {
              const status = getStatus(appointment);

              // choose badge color & text
              let badgeClasses = "";
              let badgeText = "";
              switch (status) {
                case "live":
                  badgeClasses =
                    "bg-red-50 text-red-700 border border-red-100";
                  badgeText = "Live";
                  break;
                case "today":
                  badgeClasses =
                    "bg-green-50 text-green-700 border border-green-100";
                  badgeText = "Today";
                  break;
                case "done":
                  badgeClasses =
                    "bg-gray-50 text-gray-600 border border-gray-100";
                  badgeText = "Completed";
                  break;
                default:
                  badgeClasses =
                    "bg-blue-50 text-blue-700 border border-blue-100";
                  badgeText = "Upcoming";
                  break;
              }

              return (
                <div
                  key={appointment.id}
                  className="group mx-2 mb-1 last:mb-2 p-3 rounded-xl hover:bg-gray-50/80 cursor-pointer transition-all duration-200"
                  onClick={() => onNotificationClick(appointment)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-1 h-12 rounded-full flex-shrink-0 ${
                            status === "live"
                              ? "bg-red-500"
                              : status === "today"
                              ? "bg-green-500"
                              : status === "done"
                              ? "bg-gray-300"
                              : "bg-blue-500"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 break-words group-hover:text-gray-700">
                            {appointment.summary || "Untitled Event"}
                          </p>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1.5" />
                            <span>{formatTime(appointment)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-md ${badgeClasses}`}
                    >
                      {badgeText}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gray-50 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No events today</p>
              <p className="text-xs text-gray-400 mt-1">Enjoy your free time</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}