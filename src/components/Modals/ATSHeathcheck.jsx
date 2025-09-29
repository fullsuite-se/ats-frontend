import { useState, useEffect } from "react";
import api from "../../services/api";
import { startCase } from "lodash";

export default function ATSHealthcheck({ onSelectApplicant }) {
  const [activeTab, setActiveTab] = useState("general");
  const [notifications, setNotifications] = useState({
    general: [],
    needsAttention: []
  });
  const [allNotifications, setAllNotifications] = useState({
    general: [],
    needsAttention: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [hoveredTab, setHoveredTab] = useState(null);

  // Statuses that should not show in notifications
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
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await api.get("/notification");
        const data = response.data;
        if (!data) {
          throw new Error("No data received from server");
        }

        // Format ATS notifications
        const generalNotifications = [];
        const needsAttentionNotifications = [];
        const allGeneralNotifications = [];
        const allNeedsAttentionNotifications = [];

        // Process ATS applicants - filter out hidden statuses
        if (data.ats && Array.isArray(data.ats)) {
          data.ats.forEach(applicant => {
            // Skip applicants with hidden statuses
            if (hiddenStatuses.includes(applicant.status)) {
              return;
            }

            const notificationItem = {
              id: applicant.applicant_id,
              name: `${applicant.first_name} ${applicant.last_name}`,
              position: applicant.title,
              timeAgo: getTimeAgo(applicant.date_created || applicant.updated_at),
              // Store the actual date for sorting
              date: new Date(applicant.date_created || applicant.updated_at),
              applicantData: applicant,
              status: getFormattedStatus(applicant.status, applicant.stage),
              isRecent: isNotificationRecent(applicant.date_created || applicant.updated_at),
            };

            // Add to all notifications
            allNeedsAttentionNotifications.push({
              ...notificationItem,
            });

            // Add to recent notifications only if recent
            if (isNotificationRecent(applicant.date_created || applicant.updated_at)) {
              needsAttentionNotifications.push({
                ...notificationItem,
              });
            }
          });
        }

        // Process general notifications - filter out hidden statuses
        if (data.general && Array.isArray(data.general)) {
          data.general.forEach(applicant => {
            // Skip applicants with hidden statuses
            if (hiddenStatuses.includes(applicant.status)) {
              return;
            }

            const notificationItem = {
              id: applicant.applicant_id,
              name: `${applicant.first_name} ${applicant.last_name}`,
              position: applicant.title,
              timeAgo: getTimeAgo(applicant.date_applied || applicant.created_at),
              // Store the actual date for sorting
              date: new Date(applicant.date_applied || applicant.created_at),
              applicantData: applicant,
              status: getFormattedStatus(applicant.status, applicant.stage),
              notification_type: startCase(applicant.notification_type?.toLowerCase() || 'general'),
              isRecent: isNotificationRecent(applicant.date_applied || applicant.created_at),
            };

            // Add to all notifications
            allGeneralNotifications.push({
              ...notificationItem,
            });

            // Add to recent notifications only if recent
            if (isNotificationRecent(applicant.date_applied || applicant.created_at)) {
              generalNotifications.push({
                ...notificationItem,
              });
            }
          });
        }

        // Sort all arrays by date (newest first)
        const sortByDateDesc = (a, b) => new Date(b.date) - new Date(a.date);
        
        setAllNotifications({
          general: allGeneralNotifications.sort(sortByDateDesc),
          needsAttention: allNeedsAttentionNotifications.sort(sortByDateDesc)
        });

        setNotifications({
          general: generalNotifications.sort(sortByDateDesc),
          needsAttention: needsAttentionNotifications.sort(sortByDateDesc)
        });
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Helper function to check if notification is recent (within 30 days)
  const isNotificationRecent = (dateString, maxDays = 30) => {
    if (!dateString) return true;
    
    const notificationDate = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - notificationDate) / (1000 * 60 * 60 * 24));
    return diffInDays <= maxDays;
  };

  // Helper function to get time ago text from date
  const getTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInDays === 1) {
      return "1 day ago";
    } else if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    } else if (diffInMonths === 1) {
      return "1 month ago";
    } else {
      return `${diffInMonths} months ago`;
    }
  };

  // Helper function to format status display
  const getFormattedStatus = (status, stage) => {
    if (!status) return "Pending";
    
    if (status === "FIRST_INTERVIEW") return "First Interview Stage";
    if (status === "SECOND_INTERVIEW") return "Second Interview Stage";
    if (status === "THIRD_INTERVIEW") return "Third Interview Stage";
    if (status === "FOURTH_INTERVIEW") return "Fourth Interview Stage";
    if (status === "FOLLOW_UP_INTERVIEW") return "Follow-up Interview Stage";
    if (status === "FOR_JOB_OFFER" || status === "JOB_OFFER_ACCEPTED" ||
      status === "JOB_OFFER_REJECTED") return "Job Offer";
    if (status === "TEST_SENT") return "Test Sent";

    // Fallback to stage if status not recognized
    if (stage === "JOB_OFFER") return "Job Offer";
    if (stage === "INTERVIEW_SCHEDULE") return "Interview Scheduled";

    return status.replace(/_/g, " ");
  };

  const handleApplicantClick = async (applicant) => {
    try {
      const response = await api.delete(`/notification/remove/${applicant.applicant_id}`);
      if (response.status === 200) {
        onSelectApplicant(applicant);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Failed to remove notification:', error);
    }
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  const handleTabHover = (tabName) => {
    setHoveredTab(tabName);
  };

  const handleTabLeave = () => {
    setHoveredTab(null);
  };

  // Get tooltip content based on tab and showAll state
  const getTooltipContent = (tabName) => {
    if (tabName === "general") {
      return showAll 
        ? "Shows all applicants that have applied, including older ones"
        : "Shows recent applicants that have applied within the last 30 days";
    } else if (tabName === "needsAttention") {
      return showAll
        ? "Shows all applicants that haven't had status updates, including older ones"
        : "Applicants that haven't had a status update for more than 3 days";
    }
    return "";
  };

  // Get notifications to display based on showAll state
  const getNotificationsToDisplay = () => {
    if (showAll) {
      return allNotifications;
    }
    return notifications;
  };

  const displayNotifications = getNotificationsToDisplay();

  // If not open, return null to hide the component
  if (!isOpen) {
    return null;
  }

  return (
    <div className="flex items-center justify-center body-regular text-gray-dark">
      <div className="rounded-lg w-full max-w-md overflow-hidden relative">
        <div className="">
          <div className="flex justify-between items-center">
            <h2 className="headline">Notification</h2>
            <button
              onClick={toggleShowAll}
              className={`text-sm px-3 py-1 rounded border ${
                showAll 
                  ? "bg-teal text-white border-teal" 
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {showAll ? "Show Recent" : "Show All"}
            </button>
          </div>
          <div className="flex border-b border-gray-200 mt-3 relative">
            <button
              className={`p-1 px-4 hover:bg-gray-light/50 cursor-pointer relative flex-1 text-center ${
                activeTab === "general" 
                  ? "text-teal border-b border-teal font-medium" 
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("general")}
              onMouseEnter={() => handleTabHover("general")}
              onMouseLeave={handleTabLeave}
            >
              General
            </button>
            <button
              className={`p-1 px-4 hover:bg-gray-light/50 cursor-pointer relative flex-1 text-center ${
                activeTab === "needsAttention"
                  ? "text-teal border-b border-teal font-medium"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("needsAttention")}
              onMouseEnter={() => handleTabHover("needsAttention")}
              onMouseLeave={handleTabLeave}
            >
              Needs Attention
            </button>

            {/* Tooltip for General tab */}
            {hoveredTab === "general" && (
              <div className="absolute top-full left-0 mt-1 z-10 bg-gray-900 text-white text-xs rounded py-1 px-2 w-48 transform -translate-x-0">
                {getTooltipContent("general")}
              </div>
            )}

            {/* Tooltip for Needs Attention tab */}
            {hoveredTab === "needsAttention" && (
              <div className="absolute top-full right-0 mt-1 z-10 bg-gray-900 text-white text-xs rounded py-1 px-2 w-48 transform translate-x-0">
                {getTooltipContent("needsAttention")}
              </div>
            )}
          </div>
        </div>

        <div className="max-h-[500px] overflow-y-auto p-2">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading notifications...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : (
            <>
              {activeTab === "general" && displayNotifications.general.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  {showAll ? "No notifications" : "No recent notifications"}
                </div>
              )}

              {activeTab === "general" &&
                displayNotifications.general.map((notification, index) => (
                  <div
                    key={notification.id || index}
                    className={`flex items-center justify-between p-2 border rounded-xl mb-3 cursor-pointer hover:bg-gray-light/50 ${
                      !notification.isRecent ? "border-amber-200 bg-amber-50" : "border-gray-200"
                    }`}
                    onClick={() => handleApplicantClick(notification.applicantData)}
                  >
                    <div className="flex items-center">
                      <div>
                        <div className="body-bold">{notification.name}</div>
                        <div className="text-gray-dark/50 body-tiny">{notification.position}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`body-bold`}>{notification.status}</div>
                      <div className={`text-teal body-tiny`}>
                        {notification.timeAgo.includes('Applied') 
                          ? notification.timeAgo 
                          : `Applied ${notification.timeAgo}`}
                      </div>
                      <div className="px-2 py-1 text-xs font-bold text-teal-600 capitalize">
                        {notification.notification_type}
                      </div>
                      {!notification.isRecent && (
                        <div className="text-xs text-amber-600 mt-1">Older</div>
                      )}
                    </div>
                  </div>
                ))}

              {activeTab === "needsAttention" && displayNotifications.needsAttention.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  {showAll ? "No items need attention" : "No recent items need attention"}
                </div>
              )}

              {activeTab === "needsAttention" &&
                displayNotifications.needsAttention.map((notification, index) => (
                  <div
                    key={notification.id || index}
                    className={`flex items-center justify-between p-2 border rounded-xl mb-3 cursor-pointer hover:bg-gray-light/50 ${
                      !notification.isRecent ? "border-amber-200 bg-amber-50" : "border-gray-200"
                    }`}
                    onClick={() => handleApplicantClick(notification.applicantData)}
                  >
                    <div className="flex items-center">
                      <div>
                        <div className="body-bold">{notification.name}</div>
                        <div className="text-gray-dark/50 body-tiny">{notification.position}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`body-bold`}>{notification.status}</div>
                      <div className={`text-teal body-tiny`}>{notification.timeAgo}</div>
                      {!notification.isRecent && (
                        <div className="text-xs text-amber-600 mt-1">Older</div>
                      )}
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}