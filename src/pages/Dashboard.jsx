import { useEffect, useState } from "react";
import {
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiBriefcase,
  FiRefreshCw,
  FiUserPlus,
} from "react-icons/fi";
import { useNavigate, NavLink } from "react-router-dom";
import api from "../services/api";

import PendingApplicantConfirmationModal from "../components/Modals/PendingApplicantConfirmationModal";
import RecentTable from "../components/RecentTable";
import PendingTable from "../components/PendingTable";
import InterviewTable from "../components/InterviewTable";
import FirstTimeApplicantTable from "../components/FirstTimeApplicantTable";
import ScheduleCalendar from "./ScheduleCalendar";

// Custom Components
const Tabs = ({ tabs, activeTab, setActiveTab }) => (
  <div className="border-b border-gray-200">
    <nav className="-mb-px flex space-x-8">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`body-regular whitespace-nowrap border-b-2 px-1 py-3 font-medium transition-colors duration-200 ${
            activeTab === tab.value
              ? "border-teal text-teal"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  </div>
);

const Skeleton = ({ className = "" }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
);

// Alternative version with balanced spacing
const SummaryCard = ({ icon: Icon, label, value, loading, error, to, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <div 
      className={`group relative flex flex-col rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:shadow-md h-full min-h-[120px] ${
        onClick || to ? "cursor-pointer hover:border-teal" : ""
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-center gap-4 p-4 sm:p-5 h-full">
        {/* Icon */}
        <div className="flex items-center justify-center flex-shrink-0">
          <Icon className="text-teal h-8 w-8 sm:h-10 sm:w-10 transition-transform group-hover:scale-110" />
        </div>
        
        {/* Value */}
        <div className="flex-1 flex items-center justify-center">
          {loading ? (
            <Skeleton className="h-8 w-16 sm:h-10 sm:w-20" />
          ) : error ? (
            <div className="body-small text-red-500 text-sm sm:text-base">Error</div>
          ) : (
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
              {value?.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Hover Description */}
      {isHovered && (
        <div className="absolute bottom-0 left-0 right-0 bg-teal-600 text-white p-2 rounded-b-xl">
          <div className="body-regular text-xs sm:text-sm text-center whitespace-nowrap overflow-hidden text-ellipsis">
            {label}
          </div>
        </div>
      )}
    </div>
  );

  return to ? <NavLink to={to} className="block h-full">{content}</NavLink> : content;
};

// Alternative version with tooltip-style hover (uncomment if preferred)
/*
const SummaryCard = ({ icon: Icon, label, value, loading, error, to, onClick }) => {
  const content = (
    <div 
      className={`group relative flex flex-col rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:shadow-md h-full min-h-[120px] ${
        onClick || to ? "cursor-pointer hover:border-teal" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center p-4 sm:p-5 h-full">
        <div className="flex items-center justify-center mb-2 sm:mb-3">
          <Icon className="text-teal h-6 w-6 sm:h-7 sm:w-7 transition-transform group-hover:scale-110" />
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          {loading ? (
            <Skeleton className="h-6 w-16 sm:h-8 sm:w-20 mx-auto" />
          ) : error ? (
            <div className="body-small text-red-500 text-xs sm:text-sm">Error</div>
          ) : (
            <div className="text-xl sm:text-2xl font-semibold text-gray-900 text-center">
              {value?.toLocaleString()}
            </div>
          )}
        </div>

        {/* Tooltip-style description */
        /* <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {label}
        </div> */
      /* </div>
    </div>
  );

  return to ? <NavLink to={to} className="block h-full">{content}</NavLink> : content;
};
*/

// Summary Section (rest of the code remains the same)
const SummarySection = ({ onRefresh, setActiveTab }) => {
  const [data, setData] = useState({ summary: null, firstTimeCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryResponse, firstTimeResponse] = await Promise.all([
        api.get("/analytics/dashboard/summary"),
        api.get("/applicants/first-time-job-seekers"),
      ]);
      setData({
        summary: summaryResponse.data.data,
        firstTimeCount: firstTimeResponse.data.totalCount || 0,
      });
    } catch (err) {
      console.error("Error fetching summary data:", err);
      setError("Failed to load summary data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [onRefresh]);

  const cards = [
    { icon: FiUsers, label: "Total Applicants", value: data.summary?.total_applicants, to: "/applicants" },
    { icon: FiUserCheck, label: "Hired", value: data.summary?.hired_applicants, to: "/analytics" },
    { icon: FiUserPlus, label: "First-time Seekers", value: data.firstTimeCount, onClick: () => setActiveTab("firstTimeJobSeekers") },
    { icon: FiCalendar, label: "In Interview", value: data.summary?.in_interview, onClick: () => setActiveTab("interviews") },
    { icon: FiBriefcase, label: "Open Positions", value: data.summary?.open_positions, to: "/jobs" },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card, index) => (
        <SummaryCard key={index} {...card} loading={loading} error={error} />
      ))}
    </div>
  );
};

// Rest of the components remain exactly the same...
const DataSection = ({ 
  title, 
  description, 
  endpoint, 
  dataKey, 
  loading, 
  error, 
  onRefresh,
  children,
  transformData = (data) => data,
  skeletonCount = 5
}) => {
  const [data, setData] = useState([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [internalError, setInternalError] = useState(null);

  const fetchData = async () => {
    setInternalLoading(true);
    setInternalError(null);
    try {
      const response = await api.get(endpoint);
      const rawData = dataKey ? response.data[dataKey] : response.data.data;
      setData(transformData(rawData || []));
    } catch (err) {
      console.error(`Error fetching ${title}:`, err);
      setInternalError(`Failed to load ${title.toLowerCase()}`);
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [onRefresh]);

  const isLoading = loading || internalLoading;
  const hasError = error || internalError;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(skeletonCount)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : hasError ? (
        <div className="rounded-lg bg-red-50 p-4 text-center">
          <p className="text-sm text-red-600">{hasError}</p>
        </div>
      ) : (
        children(data)
      )}
    </div>
  );
};

// Individual Sections using DataSection
const RecentApplicantsSection = ({ onRefresh }) => (
  <DataSection
    title="Recent Applicants"
    description="Latest applicants in the system"
    endpoint="/analytics/dashboard/recent-applicants"
    onRefresh={onRefresh}
  >
    {(applicants) => (
      <RecentTable
        applicants={applicants}
        onRowClick={(applicant) => {
          alert(`Applicant: ${applicant.first_name} ${applicant.last_name}`);
        }}
      />
    )}
  </DataSection>
);

const PendingApplicantsSection = ({ onRefresh }) => {
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const transformPendingData = (pendingApplicants) => 
    (pendingApplicants || []).map((item) => ({
      applicant_id: item.pending_applicant_id,
      first_name: item.applicant?.first_name,
      middle_name: item.applicant?.middle_name,
      last_name: item.applicant?.last_name,
      email_1: item.applicant?.email_1,
      position: item.applicant?.title,
      status: item.status === 1 ? "PENDING" : "UNKNOWN",
      applied_date: item.applicant?.date_applied,
    }));

  return (
    <>
      <DataSection
        title="Pending Applicants"
        description="Applicants awaiting review and confirmation"
        endpoint="/applicants/pending"
        dataKey="pendingApplicants"
        onRefresh={onRefresh}
        transformData={transformPendingData}
      >
        {(applicants) => (
          <PendingTable
            applicants={applicants}
            onSelectApplicant={(applicant) => {
              setSelectedApplicant(applicant);
              setIsModalOpen(true);
            }}
          />
        )}
      </DataSection>

      {selectedApplicant && (
        <PendingApplicantConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          applicant={selectedApplicant}
          onActionComplete={() => {}}
        />
      )}
    </>
  );
};

const InterviewsSection = ({ onRefresh }) => (
  <DataSection
    title="Upcoming Interviews"
    description="Scheduled interviews for the next 7 days"
    endpoint="/analytics/dashboard/interview-schedule"
    onRefresh={onRefresh}
  >
    {(applicants) => <InterviewTable applicants={applicants} />}
  </DataSection>
);

const FirstTimeJobSeekersSection = ({ onRefresh }) => {
  const navigate = useNavigate();

  const transformFirstTimeData = (applicants = []) =>
    applicants.map(applicant => ({
      applicant_id: applicant.applicant_id,
      id: applicant.applicant_id,
      first_name: applicant.first_name,
      middle_name: applicant.middle_name,
      last_name: applicant.last_name,
      email_1: applicant.email_1,
      position_applied: applicant.position_applied,
      position: applicant.position_applied,
      status: applicant.status,
      application_date: applicant.application_date,
      applied_date: applicant.application_date,
    }));

  return (
    <DataSection
      title="First-time Job Seekers"
      description="Applicants seeking their first employment opportunity"
      endpoint="/applicants/first-time-job-seekers"
      dataKey="firstTimeJobSeekers"
      onRefresh={onRefresh}
      transformData={transformFirstTimeData}
    >
      {(applicants) => (
        <FirstTimeApplicantTable
          applicants={applicants}
          onSelectApplicant={(applicant) => {
            const applicantId = applicant.applicant_id || applicant.id;
            applicantId && navigate(`/applicants/${applicantId}`);
          }}
        />
      )}
    </DataSection>
  );
};

// Main Dashboard Component
export default function Dashboard() {
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [activeTab, setActiveTab] = useState("applicants");

  const tabs = [
    { label: "Recent Applicants", value: "applicants" },
    { label: "Pending Applicants", value: "pending" },
    { label: "First-time Job Seekers", value: "firstTimeJobSeekers" },
    { label: "Upcoming Interviews", value: "interviews" },
    { label: "Appointment Schedules", value: "calendar" },
  ];

  const tabComponents = {
    applicants: <RecentApplicantsSection onRefresh={refreshCounter} />,
    pending: <PendingApplicantsSection onRefresh={refreshCounter} />,
    interviews: <InterviewsSection onRefresh={refreshCounter} />,
    firstTimeJobSeekers: <FirstTimeJobSeekersSection onRefresh={refreshCounter} />,
    calendar: <ScheduleCalendar onRefresh={refreshCounter} />,
  };

  const handleRefresh = () => {
    setRefreshCounter(prev => prev + 1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Dashboard</h1>
            <p className="text-gray-600">Track and analyze your recruitment metrics</p>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-lg border border-teal-500 bg-white px-4 py-2.5 text-sm font-medium text-teal-600 transition-colors hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            <FiRefreshCw className="h-4 w-4" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummarySection onRefresh={refreshCounter} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-4 sm:px-6">
          <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="p-4 sm:p-6">
          <div className="min-h-[400px]">
            {tabComponents[activeTab]}
          </div>
        </div>
      </div>
    </div>
  );
}