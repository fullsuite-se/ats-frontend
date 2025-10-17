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

// Custom Tabs component
const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={`body-regular cursor-pointer border-b-2 px-1 py-2 font-medium ${
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
};

// Custom Skeleton component
const Skeleton = ({ className = "" }) => {
  return (
    <div className={`bg-gray-light animate-pulse rounded ${className}`}></div>
  );
};

// Summary Cards Section
const SummarySection = ({ onRefresh, setActiveTab }) => {
  const [summaryData, setSummaryData] = useState(null);
  const [firstTimeCount, setFirstTimeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchSummaryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryResponse, firstTimeResponse] = await Promise.all([
        api.get("/analytics/dashboard/summary"),
        api.get("/applicants/first-time-job-seekers"),
      ]);
      
      setSummaryData(summaryResponse.data.data);
      setFirstTimeCount(firstTimeResponse.data.totalCount || 0);
    } catch (err) {
      console.error("Error fetching summary data:", err);
      setError("Failed to load summary data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryData();
  }, []);

  useEffect(() => {
    if (onRefresh) {
      fetchSummaryData();
    }
  }, [onRefresh]);

  const handleCardClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
      <NavLink to="/applicants">
        <div className="hover:bg-teal-soft cursor-pointer rounded-2xl border border-gray-200 bg-white transition duration-200 ease-in-out">
          <div className="p-6">
            <div className="flex justify-center">
              <FiUsers className="text-teal mr-2 h-5 w-5" />
              <span className="body-regular text-gray-500">
                Total Applicants
              </span>
            </div>

            {loading ? (
              <Skeleton className="mt-2 h-8 w-24" />
            ) : error ? (
              <div className="body-regular mt-2 text-red-500">
                Error loading data
              </div>
            ) : (
              <div className="mt-2 text-center">
                <div className="text-2xl font-bold">
                  {summaryData?.total_applicants.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </NavLink>

      <NavLink to="/analytics">
        <div className="hover:bg-teal-soft cursor-pointer rounded-2xl border border-gray-200 bg-white transition duration-200 ease-in-out">
          <div className="p-6">
            <div className="flex justify-center">
              <FiUserCheck className="text-teal mr-2 h-5 w-5" />
              <span className="body-regular text-gray-500">Hired</span>
            </div>
            {loading ? (
              <Skeleton className="mt-2 h-8 w-24" />
            ) : error ? (
              <div className="body-regular mt-2 text-red-500">
                Error loading data
              </div>
            ) : (
              <div className="mt-2 text-center">
                <div className="text-2xl font-bold">
                  {summaryData?.hired_applicants.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </NavLink>

      <div
        onClick={() => handleCardClick("interviews")}
        className="hover:bg-teal-soft cursor-pointer rounded-2xl border border-gray-200 bg-white transition duration-200 ease-in-out"
      >
        <div className="p-6">
          <div className="flex justify-center">
            <FiCalendar className="text-teal mr-2 h-5 w-5" />
            <span className="body-regular text-gray-500">
              In Interview Process
            </span>
          </div>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-24" />
          ) : error ? (
            <div className="body-regular mt-2 text-red-500">
              Error loading data
            </div>
          ) : (
            <div className="mt-2 text-center">
              <div className="text-2xl font-bold">
                {summaryData?.in_interview.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* First-time Job Seekers Card */}
      <div
        onClick={() => handleCardClick("firstTimeJobSeekers")}
        className="hover:bg-teal-soft cursor-pointer rounded-2xl border border-gray-200 bg-white transition duration-200 ease-in-out"
      >
        <div className="p-6">
          <div className="flex justify-center">
            <FiUserPlus className="text-teal mr-2 h-5 w-5" />
            <span className="body-regular text-gray-500">First-time Job Seekers</span>
          </div>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-24" />
          ) : error ? (
            <div className="body-regular mt-2 text-red-500">
              Error loading data
            </div>
          ) : (
            <div className="mt-2 text-center">
              <div className="text-2xl font-bold">
                {firstTimeCount.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      <NavLink to="/jobs">
        <div className="hover:bg-teal-soft cursor-pointer rounded-2xl border border-gray-200 bg-white transition duration-200 ease-in-out">
          <div className="p-6">
            <div className="flex justify-center">
              <FiBriefcase className="text-teal mr-2 h-5 w-5" />
              <span className="body-regular text-gray-500">Open Positions</span>
            </div>
            {loading ? (
              <Skeleton className="mt-2 h-8 w-24" />
            ) : error ? (
              <div className="body-regular mt-2 text-red-500">
                Error loading data
              </div>
            ) : (
              <div className="mt-2 text-center">
                <div className="text-2xl font-bold">
                  {summaryData?.open_positions.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </NavLink>
    </div>
  );
};

// Recent Applicants Section
const RecentApplicantsSection = ({ onRefresh }) => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApplicants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/analytics/dashboard/recent-applicants");
      setApplicants(response.data.data);
    } catch (err) {
      console.error("Error fetching recent applicants:", err);
      setError("Failed to load recent applicants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  useEffect(() => {
    if (onRefresh) {
      fetchApplicants();
    }
  }, [onRefresh]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="headline text-gray-900">Recent Applicants</h3>
        <p className="body-tiny text-gray-400">
          Latest applicants in the system
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">{error}</div>
      ) : (
        <RecentTable
          applicants={applicants}
          onRowClick={(applicant) => {
            alert(`Applicant: ${applicant.first_name} ${applicant.last_name}`);
          }}
        />
      )}
    </div>
  );
};

const PendingApplicantsSection = ({ onRefresh }) => {
  const [pendingApplicants, setPendingApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPendingApplicants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/applicants/pending");
      // Update to use the title provided in the API response
      setPendingApplicants(
        response.data.pendingApplicants.map((item) => ({
          applicant_id: item.pending_applicant_id,
          first_name: item.applicant.first_name,
          middle_name: item.applicant.middle_name,
          last_name: item.applicant.last_name,
          email_1: item.applicant.email_1,
          position: item.applicant.title, // Now using the job title directly
          status: item.status === 1 ? "PENDING" : "UNKNOWN",
          applied_date: item.applicant.date_applied,
        })),
      );
    } catch (err) {
      console.error("Error fetching pending applicants:", err);
      setError("Failed to load pending applicants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApplicants();
  }, []);

  useEffect(() => {
    if (onRefresh) {
      fetchPendingApplicants();
    }
  }, [onRefresh]);

  const handleRowClick = (applicant) => {
    setSelectedApplicant(applicant);
    setIsModalOpen(true);
  };

  const handleActionComplete = (action) => {
    // Refresh the data after action completes
    fetchPendingApplicants();
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="headline text-gray-900">Pending Applicants</h3>
        <p className="body-tiny text-gray-400">Applicants awaiting review</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">{error}</div>
      ) : (
        <PendingTable
          applicants={pendingApplicants}
          onSelectApplicant={handleRowClick}
        />
      )}

      {/* Confirmation Modal */}
      {selectedApplicant && (
        <PendingApplicantConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          applicant={selectedApplicant}
          onActionComplete={handleActionComplete}
        />
      )}
    </div>
  );
};

// Interviews Section
const InterviewsSection = ({ onRefresh }) => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApplicants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/analytics/dashboard/interview-schedule");
      setApplicants(response.data.data);
    } catch (err) {
      console.error("Error fetching interview schedule:", err);
      setError("Failed to load interview schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  useEffect(() => {
    if (onRefresh) {
      fetchApplicants();
    }
  }, [onRefresh]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="headline text-gray-900">Upcoming Interviews</h3>
        <p className="body-tiny text-gray-400">Scheduled interviews for the next 7 days</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">{error}</div>
      ) : (
        <InterviewTable
          applicants={applicants}
        />
      )}
    </div>
  );
};

// First-time Job Seekers Section
const FirstTimeJobSeekersSection = ({ onRefresh }) => {
  const [firstTimeJobSeekers, setFirstTimeJobSeekers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchFirstTimeJobSeekers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/applicants/first-time-job-seekers");
      const applicants = response.data.firstTimeJobSeekers || [];
      
      // Transform the data to match the table format
      const transformedApplicants = applicants.map(applicant => ({
        applicant_id: applicant.applicant_id,
        id: applicant.applicant_id, // Add id for compatibility
        first_name: applicant.first_name,
        middle_name: applicant.middle_name,
        last_name: applicant.last_name,
        email_1: applicant.email_1,
        position_applied: applicant.position_applied,
        position: applicant.position_applied, // For compatibility
        status: applicant.status,
        application_date: applicant.application_date,
        applied_date: applicant.application_date // For compatibility
      }));
      
      setFirstTimeJobSeekers(transformedApplicants);
      setTotalCount(response.data.totalCount || 0);
    } catch (err) {
      console.error("Error fetching first-time job seekers:", err);
      setError("Failed to load first-time job seekers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFirstTimeJobSeekers();
  }, []);

  useEffect(() => {
    if (onRefresh) {
      fetchFirstTimeJobSeekers();
    }
  }, [onRefresh]);

  const handleRowClick = (applicant) => {
    console.log("First-time job seeker clicked:", applicant);
    const applicantId = applicant.applicant_id || applicant.id;
    if (applicantId) {
      navigate(`/applicants/${applicantId}`);
    } else {
      console.error("No valid applicant ID found");
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="headline text-gray-900">First-time Job Seekers</h3>
        <p className="body-tiny text-gray-400">
          {loading ? "Loading..." : `Total: ${totalCount} applicants`}
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">{error}</div>
      ) : (
        <FirstTimeApplicantTable
          applicants={firstTimeJobSeekers}
          onSelectApplicant={handleRowClick}
        />
      )}
    </div>
  );
};

export default function Dashboard() {
  // State for tracking refresh trigger
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Active tab
  const [activeTab, setActiveTab] = useState("applicants");

  // Tabs configuration - includes both calendar and first-time job seekers
  const tabs = [
    { label: "Recent Applicants", value: "applicants" },
    { label: "Pending Applicants", value: "pending" },
    { label: "Upcoming Interviews", value: "interviews" },
    { label: "First-time Job Seekers", value: "firstTimeJobSeekers" },
    { label: "Appointment Schedules", value: "calendar" },
  ];

  // Handle refresh action
  const handleRefresh = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  return (
    <div>
      <div className="mx-auto mt-10">
        <div className="mb-6 flex flex-col items-start justify-between md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">
              Track and analyze your recruitment metrics
            </p>
          </div>

          <div className="mt-4 flex items-center space-x-4 md:mt-0">
            <div
              onClick={handleRefresh}
              className="text-teal border-teal focus:ring-teal body-regular flex cursor-pointer items-center justify-center gap-2 rounded-md border bg-white px-4 py-2 hover:bg-[#e6ffff] focus:ring-2 focus:ring-offset-2 focus:outline-none"
            >
              <FiRefreshCw className="h-4 w-4" />
              Refresh
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <SummarySection
          onRefresh={refreshCounter}
          setActiveTab={setActiveTab}
        />

        <div className="gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="px-6 py-3">
              <Tabs
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />

              <div className="p-4">
                <div
                  className={activeTab === "applicants" ? "block" : "hidden"}
                >
                  <RecentApplicantsSection onRefresh={refreshCounter} />
                </div>

                <div className={activeTab === "pending" ? "block" : "hidden"}>
                  <PendingApplicantsSection onRefresh={refreshCounter} />
                </div>

                <div
                  className={activeTab === "interviews" ? "block" : "hidden"}
                >
                  <InterviewsSection onRefresh={refreshCounter} />
                </div>

                <div className={activeTab === "firstTimeJobSeekers" ? "block" : "hidden"}>
                  <FirstTimeJobSeekersSection onRefresh={refreshCounter} />
                </div>

                {/* ✅ Calendar Tab */}
                <div className={activeTab === "calendar" ? "block" : "hidden"}>
                  <ScheduleCalendar onRefresh={refreshCounter} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}