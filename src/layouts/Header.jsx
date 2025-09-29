import { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import { FaBell } from "react-icons/fa6";
import api from "../services/api";
import useUserStore from "../context/userStore";

export default function Header({ onSelectView, onToggleSidebar, onToggleATSHealthcheck, selectedView }) {
  const [currentView, setCurrentView] = useState("applicants");
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isNotificationRead, setIsNotificationRead] = useState(
    JSON.parse(localStorage.getItem("isNotificationRead")) || false
  );
  const [titlePage, setTitlePage] = useState("");
  const [isHovering, setIsHovering] = useState(false);

  const { hasFeature } = useUserStore();
  const canViewNotifications = hasFeature("Notification");

  // Statuses that should not show in notifications (same as ATSHealthcheck)
  const hiddenStatuses = [
    "FOR_JOB_OFFER",
    "JOB_OFFER_REJECTED", 
    "JOB_OFFER_ACCEPTED",
    "FOR_FUTURE_POOLING",
    "WITHDREW_APPLICATION",
    "BLACKLISTED",
    "GHOSTED",
    "NOT_FIT"
  ];

  useEffect(() => {
    if (selectedView === "applicants") {
      setTitlePage("Applicants");
    } else if (selectedView === "analytics") {
      setTitlePage("Analytics");
    } else if (selectedView === "jobs") {
      setTitlePage("Jobs");
    } else if (selectedView === "config") {
      setTitlePage("Configurations");
    }
  }, [selectedView]);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        setLoading(true);
        const response = await api.get("/notification");
        const data = response.data;

        if (!data) {
          setNotificationCount(0);
          return;
        }

        let totalCount = 0;

        // Count general notifications - use same filtering as ATSHealthcheck
        if (data.general && Array.isArray(data.general)) {
          const validGeneralNotifications = data.general.filter(applicant => {
            // Skip applicants with hidden statuses (same as ATSHealthcheck)
            return !hiddenStatuses.includes(applicant.status);
          });
          totalCount += validGeneralNotifications.length;
        }

        // Count ATS notifications - use same filtering as ATSHealthcheck
        if (data.ats && Array.isArray(data.ats)) {
          const validATSNotifications = data.ats.filter(applicant => {
            // Skip applicants with hidden statuses (same as ATSHealthcheck)
            if (hiddenStatuses.includes(applicant.status)) {
              return false;
            }
            
            // Check if notification is recent (within 30 days) - same as ATSHealthcheck
            const dateToCheck = applicant.date_created || applicant.updated_at;
            if (!dateToCheck) return true;
            
            const notificationDate = new Date(dateToCheck);
            const now = new Date();
            const diffInDays = Math.floor((now - notificationDate) / (1000 * 60 * 60 * 24));
            return diffInDays <= 30; // Only count recent notifications by default
          });
          
          totalCount += validATSNotifications.length;
        }

        setNotificationCount(totalCount);
        
        // Auto-mark as read if no notifications
        if (totalCount === 0) {
          setIsNotificationRead(true);
        } else {
          setIsNotificationRead(false);
        }
      } catch (err) {
        console.error("Error fetching notification count:", err);
        setNotificationCount(0);
        setIsNotificationRead(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationCount();
    
    // Refresh notification count every 2 minutes (more frequent for better UX)
    const interval = setInterval(fetchNotificationCount, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("isNotificationRead", JSON.stringify(isNotificationRead));
  }, [isNotificationRead]);

  const handleSelectView = (view) => {
    setCurrentView(view);
    onSelectView(view);
  };

  const handleNotificationClick = () => {
    setIsNotificationRead(true);
    // Don't reset count to 0 here - let the count update naturally from the API
    onToggleATSHealthcheck();
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const getNotificationTooltip = () => {
    if (loading) return "Loading notifications...";
    if (notificationCount === 0) return "No new notifications";
    return `${notificationCount} notification${notificationCount !== 1 ? 's' : ''} require attention`;
  };

  return (
    <header className="top-0 flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="text-gray-dark focus:outline-none md:hidden">
          <FaBars size={24} />
        </button>
        <p className="display text-gray-dark block md:hidden">ATS</p>
        <p className="text-2xl font-bold text-gray-dark hidden md:block">{titlePage}</p>
      </div>
      <div className="flex items-center gap-4">
        {canViewNotifications && (
          <div 
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`
                rounded-full p-3 transition-all duration-200 ease-in-out relative cursor-pointer
                ${notificationCount > 0 && !isNotificationRead 
                  ? "text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700" 
                  : "text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-700"
                }
                ${isHovering ? "scale-110 shadow-md" : "scale-100 shadow-sm"}
              `}
              onClick={handleNotificationClick}
              aria-label={getNotificationTooltip()}
              title={getNotificationTooltip()}
            >
              <FaBell className="h-5 w-5 md:h-6 md:w-6 transition-transform duration-200" />
              
              {notificationCount > 0 && !isNotificationRead && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center">
                  <span className={`
                    flex items-center justify-center text-white text-xs font-bold rounded-full h-5 w-5 min-w-[20px] shadow-lg
                    ${notificationCount > 9 ? "px-1 text-[10px]" : ""}
                    transition-all duration-200
                    ${isHovering ? "bg-red-600 scale-110" : "bg-red-500 scale-100"}
                  `}>
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                </span>
              )}
            </button>

            {/* Pulse animation for new notifications */}
            {notificationCount > 0 && !isNotificationRead && (
              <span className="absolute -top-1 -right-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              </span>
            )}

            {/* Loading indicator */}
            {loading && (
              <div className="absolute -top-1 -right-1">
                <div className="h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}