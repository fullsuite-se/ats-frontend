import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import ApplicantDetails from "../components/Applicant/ApplicantDetails";
import ApplicantDiscussionPage from "../components/Applicant/ApplicantDiscussionPage";
import ApplicantSendMailPage from "../components/Applicant/ApplicantSendMailPage";
import api from "../services/api";
import Loader from "../components/Loader";
import useUserStore from "../context/userStore"; // Import the Zustand store
import AccessDenied from "../assets/AccessDenied.svg"; // Import the Access Denied SVG

function ApplicantDetailsPage({ applicant = null, onBack = null }) {
  const [refreshNeeded, setRefreshNeeded] = useState(false);
  const { id } = useParams(); // Get ID from URL params if available
  const { hasFeature } = useUserStore(); // Access the hasFeature function
  const canViewDiscussion = hasFeature("Interview Notes"); // Check if the user has the "Discussion" feature
  const canSendMail = hasFeature("Send Mail"); // Check if the user has the "Send Mail" feature

  // Dynamically set the default tab based on available features
  const defaultTab = canViewDiscussion ? "discussion" : canSendMail ? "sendMail" : null;
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(true);
  const [applicantInfo, setApplicantInfo] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Determine which ID to use - from props or from URL
  const applicantId = applicant?.applicant_id || id;


  const handleApplicantDelete = (applicantId) => {
    // Perform any cleanup or state updates
    setRefreshNeeded(true);
  };

  // Effect to refresh when needed
  useEffect(() => {
    if (refreshNeeded) {
      // Reset the state and refetch data
      setApplicantInfo({});
      fetchApplicantData();
      setRefreshNeeded(false);
    }
  }, [refreshNeeded]);
  // Create a reusable fetch function
  const fetchApplicantData = useCallback(async () => {
    if (!applicantId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/applicants/${applicantId}`);

      console.log("API Response:", response); // Log the entire response for debugging

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const processedData = response.data[0] || {};
        setApplicantInfo(processedData);
      } else {
        console.error("No applicant data returned");
        setApplicantInfo({});
      }
    } catch (error) {
      console.error("Error fetching applicant data:", error);
      setApplicantInfo({});
    } finally {
      setLoading(false);
    }
  }, [applicantId]);

  // Fetch data when component mounts or when applicant changes
  useEffect(() => {
    setApplicantInfo({}); // Reset before fetching
    fetchApplicantData();
  }, [fetchApplicantData, refreshTrigger]);

  // Function to trigger a refresh
  const handleApplicantUpdate = (updatedInfo) => {
    if (updatedInfo && Object.keys(updatedInfo).length > 0) {
      setApplicantInfo(updatedInfo);
    }
    setRefreshTrigger((prev) => prev + 1);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "discussion":
        return canViewDiscussion ? (
          <ApplicantDiscussionPage applicant={applicantInfo} />
        ) : (
          <div className="flex flex-col items-center justify-center mt-10">
            <img src={AccessDenied} alt="Access Denied" className="w-32 h-32 mb-4" />
            <p className="text-gray-500 text-center">You do not have access to the Discussion tab.</p>
          </div>
        );
      case "sendMail":
        return canSendMail ? (
          <ApplicantSendMailPage applicant={applicantInfo} />
        ) : (
          <div className="flex flex-col items-center justify-center mt-10">
            <img src={AccessDenied} alt="Access Denied" className="w-32 h-32 mb-4" />
            <p className="text-gray-500 text-center">You do not have access to the Send Mail tab.</p>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center mt-10">
            <img src={AccessDenied} alt="Access Denied" className="w-64 h-64 mb-4" />
            <p className="text-gray-500 text-center">You do not have access to view any tabs.</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader />
      </div>
    );
  }

  // If no applicant ID is provided or data couldn't be fetched
  if (!applicantId || Object.keys(applicantInfo || {}).length === 0) {
    return (
      <div className="border rounded-lg mx-auto text-center p-5">
        <p className="text-gray-500">Select an applicant to view details</p>
      </div>
    );
  }

  return (
    <div className="">
      {/* ApplicantDetails is always visible */}
      <ApplicantDetails
        applicant={applicantInfo}
        onTabChange={setActiveTab}
        activeTab={activeTab}
        onApplicantUpdate={handleApplicantUpdate}
        onApplicantDelete={handleApplicantDelete} // Add this prop
      />
      {/* Render tabs only if the user has access */}
      {(canViewDiscussion || canSendMail) ? (
        <div className="mt-4 mb-10">{renderActiveTab()}</div>
      ) : (
        <div className="flex flex-col items-center justify-center mt-10">
          <img src={AccessDenied} alt="Access Denied" className="w-64 h-64 mb-4" />
          <p className="text-gray-500 text-center">You do not have access to view the tabs.</p>
        </div>
      )}
    </div>
  );
}

export default ApplicantDetailsPage;