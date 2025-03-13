import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import Sidebar from "../layouts/Sidebar.jsx";
import Header from "../layouts/Header.jsx";
import ApplicantList from "../layouts/ApplicantList.jsx";
import StatusCounter from "../layouts/StatusCounter.jsx";
import AnalysisPage from "../components/AnalysisComponents/AnalysisPage.jsx";
import ApplicantDetailsPage from "./ApplicantDetailsPage.jsx";
import AddApplicantForm from "./AddApplicantForm.jsx";
import WarningModal from "../components/Modals/WarningModal.jsx";
import useUserStore from "../context/userStore.jsx";
import api from "../api/axios.js";
import Cookies from "js-cookie";

const MAX_TABS = 10;

export default function Listings() {
  const [selectedView, setSelectedView] = useState("listings");
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [showAddApplicantForm, setShowAddApplicantForm] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = Cookies.get("token");
        const response = await api.get("/user/getuserinfo", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    fetchUserInfo();
  }, [setUser]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeWarningModal = () => setShowWarningModal(false);

  const selectView = (view) => {
    setSelectedView(view);
    if (view === "analytics") setActiveTab(null);
  };

  const selectApplicant = (applicant) => {
    setTabs((prevTabs) => {
      if (prevTabs.length >= MAX_TABS) {
        setShowWarningModal(true);
        return prevTabs;
      }

      const isTabOpen = prevTabs.some((tab) => tab.id === applicant.id);
      if (isTabOpen) {
        setActiveTab(applicant.id);
        return prevTabs;
      }

      return [...prevTabs, applicant];
    });
    setActiveTab(applicant.id);
  };

  const closeTab = (id) => {
    setTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== id));
    if (activeTab === id) setActiveTab(null);
  };

  const renderContent = () => {
    if (activeTab !== null && selectedView === "listings") {
      const activeApplicant = tabs.find((tab) => tab.id === activeTab);
      return (
        <ApplicantDetailsPage
          applicant={activeApplicant}
          onBack={() => setActiveTab(null)}
        />
      );
    }

    switch (selectedView) {
      case "listings":
        return (
          <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ApplicantList
                onSelectApplicant={selectApplicant}
                onAddApplicantClick={() => setShowAddApplicantForm(true)}
              />
            </div>
            <div className="lg:col-span-1">
              <StatusCounter />
            </div>
          </div>
        );
      case "analytics":
        return (
          <div className="flex h-full items-center justify-center">
            <AnalysisPage />
          </div>
        );
      default:
        return (
          <div className="p-6 text-center text-lg font-semibold">
            Welcome to the Applicant Tracking System
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 px-5 sm:flex-row">
      {/* Sidebar */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <Sidebar isOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} onSelectView={selectView} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:ml-72 w-full lg:px-5">
        {showAddApplicantForm ? (
          <AddApplicantForm onClose={() => setShowAddApplicantForm(false)} />
        ) : (
          <>
            <Header onToggleSidebar={toggleSidebar} />
            {/* Tabs Section */}
            {selectedView === "listings" && !showAddApplicantForm && (
              <div className="mb-4 flex rounded-lg border border-gray-light bg-white p-1 pb-0">
                {/* Scrollable Tabs Container */}
                <div className="flex flex-wrap space-x-2 whitespace-nowrap items-center">
                  {/* Applicant List Tab */}
                  <button className={`px-3 py-1 mb-1 rounded-md border body-bold transition-colors cursor-pointer
                      ${activeTab === null ? "bg-teal-soft text-teal border-teal-soft" : "bg-white text-teal border-teal hover:bg-gray-light"}`}
                    onClick={() => setActiveTab(null)}>
                    Applicant List
                  </button>
                  {/* Dynamic Tabs */}
                  {tabs.map((tab) => (
                    <div key={tab.id} className={`flex items-center px-2 py-1 mb-1 rounded-md body-regular transition-colors h-6 
                      ${activeTab === tab.id ? "bg-teal-soft text-teal" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    >
                      <button className="truncate max-w-[100px] lg:max-w-none cursor-pointer" onClick={() => setActiveTab(tab.id)} title={tab.name}>
                        {tab.name.length > 10 ? `${tab.name.slice(0, 10)}...` : tab.name}
                      </button>
                      <button className="ml-1 text-gray-600 hover:text-gray-800" onClick={() => closeTab(tab.id)}>
                        <FaTimes className="h-3 w-3" />
                        <span className="sr-only">Remove {tab.name}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            )}

            {/* Main Content Section */}
            <main className="flex-1 overflow-auto rounded-lg">
              {renderContent()}
            </main>
          </>
        )}
      </div>

      {/* Warning Modal */}
      {showWarningModal && (
        <WarningModal message={`You can only open up to ${MAX_TABS} tabs.`} onClose={closeWarningModal} />
      )}
    </div >
  );
}
