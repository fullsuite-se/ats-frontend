import { formatTime } from "../../utils/notificationUtils";

export default function NotificationItem({ appointment, onClick, badge }) {
  return (
    <div
      onClick={() => onClick(appointment)}
      className="p-4 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {appointment.summary || "No Title"}
            </p>
            {badge && <div>{badge}</div>}
          </div>

          {appointment.start?.dateTime && (
            <p className="text-xs text-gray-500 mt-1">
              {formatTime(appointment.start.dateTime)}
              {appointment.end?.dateTime &&
                ` - ${formatTime(appointment.end.dateTime)}`}
            </p>
          )}
          {appointment.location && (
            <p className="text-xs text-gray-500 mt-1">
              📍 {appointment.location}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}