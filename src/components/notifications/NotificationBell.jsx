import { Bell } from "lucide-react";

export default function NotificationBell({ unreadCount, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>
  );
}