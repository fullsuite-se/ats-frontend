import {
  FaSignOutAlt,
  FaTimesCircle,
  FaTable,
  FaUsers,
  FaChartBar,
  FaBriefcase,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { FaUserGear } from "react-icons/fa6";
import { NavLink } from "react-router-dom";
import { FaGear } from "react-icons/fa6";
import useUserStore from "../context/userStore";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import profileUser from "../assets/profile-user.png";

export default function Sidebar({ isOpen, onToggleSidebar, onSelectView, selectedView, isCollapsed, onToggleCollapse }) {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const hasFeature = useUserStore((state) => state.hasFeature);
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState(selectedView || "dashboard");

  useEffect(() => {
    if (selectedView && selectedView !== currentView) {
      setCurrentView(selectedView);
    }
  }, [selectedView]);

  const handleSelectView = (view) => {
    setCurrentView(view);
    onSelectView(view);
    if (window.innerWidth < 768) {
      onToggleSidebar();
    }
    navigate(`/${view}`);
  };

  const handleLogout = () => {
    Cookies.remove("token");
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach((cookieName) => {
      Cookies.remove(cookieName);
    });
    localStorage.removeItem("tabs");
    localStorage.removeItem("isNotificationRead");
    sessionStorage.clear();
    setUser(null);
    navigate("/login");
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        } md:hidden`}
        onClick={onToggleSidebar}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col justify-between bg-white shadow-xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isCollapsed ? "w-20 px-3 py-5" : "w-72 px-5 py-6"
        } ${isOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 md:shadow-sm`}
      >
        {/* Close Button (mobile only) */}
        <button
          className="absolute top-5 right-5 p-1 text-gray-400 hover:text-gray-600 transition-colors md:hidden"
          onClick={onToggleSidebar}
          aria-label="Close sidebar"
        >
          <FaTimesCircle className="h-5 w-5" />
        </button>

        <div className="flex flex-col gap-6">
          {/* User Info */}
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full border-2 border-teal-100 overflow-hidden">
                <img
                  src={user?.profile_image || profileUser}
                  alt="User Profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="overflow-hidden">
                {user ? (
                  <>
                    <h3 className="font-medium text-gray-900 truncate text-medium">{`${user.first_name} ${user.last_name}`}</h3>
                    <p className="text-gray-500 truncate text-base">{user.user_email}</p>
                    <p className="text-gray-400 truncate text-sm">{user.job_title}</p> {/* Job Title */}
                  </>
                ) : (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-600"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-1">
            {!isCollapsed && <hr className="border-gray-200 my-1" />}
            {hasFeature("Dashboard") && (
              <SidebarLink
                to="/dashboard"
                text="Dashboard"
                icon={<FaTable className="shrink-0" />}
                isCollapsed={isCollapsed}
              />
            )}
            {hasFeature("Applicant Listings") && (
              <SidebarLink
                to="/applicants"
                text="Applicants"
                icon={<FaUsers className="shrink-0" />}
                isCollapsed={isCollapsed}
              />
            )}
            {hasFeature("Analytics") && (
              <SidebarLink
                to="/analytics"
                text="Analytics"
                icon={<FaChartBar className="shrink-0" />}
                isCollapsed={isCollapsed}
              />
            )}
            {hasFeature("Job Listings") && (
              <SidebarLink
                to="/jobs"
                text="Jobs"
                icon={<FaBriefcase className="shrink-0" />}
                isCollapsed={isCollapsed}
              />
            )}
            {hasFeature("Configurations") && (
              <SidebarLink
                to="/config"
                text="Configurations"
                icon={<FaGear className="shrink-0" />}
                isCollapsed={isCollapsed}
              />
            )}
            {hasFeature("User Management") && (
              <SidebarLink
                to="/usermanagement"
                text="User Management"
                icon={<FaUserGear className="shrink-0" />}
                isCollapsed={isCollapsed}
              />
            )}
          </nav>
        </div>

        {/* Collapse Button and Logout */}
        <div className="space-y-3">
          <button
            onClick={onToggleCollapse}
            className={`hidden md:flex items-center justify-center w-full p-2 rounded-lg transition-all ${
              isCollapsed 
                ? "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <FaChevronRight className="h-3.5 w-3.5" />
            ) : (
              <FaChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>

          <button
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 transition-all ${
              isCollapsed
                ? "w-full text-teal-600 hover:bg-teal-50"
                : "w-full border border-teal-600 text-teal-600 hover:bg-teal-50"
            }`}
            aria-label="Log out"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
}
// SidebarLink Component
function SidebarLink({ to, text, icon, isCollapsed }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
          isActive
            ? "bg-teal-600 text-white shadow-sm"
            : "text-gray-600 hover:bg-gray-100"
        } ${isCollapsed ? "justify-center" : ""}`
      }
    >
      {/* Icon */}
      <span className={`${isCollapsed ? "" : "w-5 flex justify-center"}`}>
        {icon}
      </span>

      {/* Text (hidden if collapsed) */}
      {!isCollapsed && <span className="truncate">{text}</span>}

      {/* Custom Tooltip */}
      {isCollapsed && (
        <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
          {text}
        </span>
      )}
    </NavLink>
  );
}
