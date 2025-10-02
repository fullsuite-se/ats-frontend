import React, { useState, useEffect } from 'react';
import { FaAddressCard, FaEnvelope, FaPen, FaPhone, FaUser, FaHistory, FaTrash, FaCloudUploadAlt, FaEye, FaBan, FaExclamationTriangle } from 'react-icons/fa';
import useUserStore from '../../context/userStore';
import api from '../../services/api';
import Toast from '../../assets/Toast';
import { FaCakeCandles, FaFileLines } from 'react-icons/fa6';
import AddApplicantForm from '../../pages/AddApplicantForm';
import { statusMapping } from '../../data/status';
import { useApplicantData } from '../../hooks/useApplicantData';
import StatusHistoryModal from '../Modals/StatusHistoryModal';
import SkipStatusWarningModal from "../Modals/SkipStatusModal";
import { formatEnumForDisplay } from '../../utils/formatEnum';
import Modal from '../Modals/Modal';
import { AiFillWarning } from "react-icons/ai";
import FeatureUnderConstruction from '../../pages/FeatureUnderConstruction';

function ApplicantDetails({ applicant, onTabChange, activeTab, onApplicantUpdate, onApplicantDelete }) {
  const { statuses } = useApplicantData();
  const [status, setStatus] = useState('');
  const [toasts, setToasts] = useState([]);
  const { user, hasFeature } = useUserStore();
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [isDateApplicable, setIsDateApplicable] = useState(true);
  const [pendingStatus, setPendingStatus] = useState('');
  const [showStatusHistoryModal, setShowStatusHistoryModal] = useState(false);
  const [isResumeNull, setIsResumeNull] = useState(false);
  const [isTestResultNull, setIsTestResultNull] = useState(false);

  // Skip status warning modal
  const [showSkipWarningModal, setShowSkipWarningModal] = useState(false);
  const [skippedStatuses, setSkippedStatuses] = useState([]);

  // For status history hover
  const [hoverIndex, setHoverIndex] = useState(null);
  const [skippedStatusesByHistory, setSkippedStatusesByHistory] = useState({});
  const [skippedStatusPosition, setSkippedStatusPosition] = useState({ top: 0, left: 0 });
  const [currentSkippedStatuses, setCurrentSkippedStatuses] = useState([]);

  // Email preview modal
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [emailPreviewContent, setEmailPreviewContent] = useState('');

  //blacklisted info
  const [blacklistedType, setBlacklistedType] = useState(null);
  const [reason, setReason] = useState(null);

  // Delete applicant state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Push to HRIS state
  const [isPushingToHris, setIsPushingToHris] = useState(false);
  const [showPushModal, setShowPushModal] = useState(false);

  // Check if user has required features
  const canEditApplicant = hasFeature("Edit Applicant");
  const canDeleteApplicant = hasFeature("Delete Applicant");

  // Format blacklisted reason for display
  const formatBlacklistedReason = (reason) => {
    if (!reason) return 'Not specified';

    const reasonMap = {
      'DID_NOT_TAKE_TEST': 'Did not take test',
      'NO_SHOW': 'No show',
      'CULTURE_MISMATCH': 'Culture mismatch',
      'EXPECTED_SALARY_MISMATCH': 'Expected salary mismatch',
      'WORKING_SCHEDULE_MISMATCH': 'Working schedule mismatch',
      'OTHER_REASONS': 'Other reasons'
    };

    return reasonMap[reason] || formatEnumForDisplay(reason);
  };

  // Format blacklisted type for display
  const formatBlacklistedType = (type) => {
    if (!type) return 'Not specified';

    const typeMap = {
      'SOFT': 'Soft Blacklist',
      'HARD': 'Hard Blacklist'
    };

    return typeMap[type] || formatEnumForDisplay(type);
  };

  useEffect(() => {
    if (applicant && applicant.status) {
      setStatus(statusMapping[applicant.status] || '');

      // Set blacklisted info if applicant is blacklisted
      if (applicant.status === 'BLACKLISTED') {
        setBlacklistedType(applicant.blacklisted_type);
        setReason(applicant.reason);
      }

      // Fetch status history when applicant changes
      if (applicant.progress_id) {
        fetchStatusHistory(applicant.progress_id);
      }
    } else {
      setStatus('');
    }
  }, [applicant]);

  const fetchStatusHistory = async (progressId) => {
    try {
      const response = await api.get(`/applicant/status-history/${progressId}`);
      const history = response.data.reverse();
      setStatusHistory(history);

      const skippedMap = {};
      history.forEach((record, index) => {
        if (index > 0) {
          const prevStatus = history[index - 1].status;
          const currentStatus = record.status;
          const prevIndex = statuses.indexOf(prevStatus);
          const currentIndex = statuses.indexOf(currentStatus);

          if (currentIndex > prevIndex + 1) {
            const skipped = statuses.slice(prevIndex + 1, currentIndex);
            if (skipped.length > 0) {
              skippedMap[index] = skipped;
            }
          }
        }
      });

      setSkippedStatusesByHistory(skippedMap);
    } catch (error) {
      console.error("Error fetching status history:", error);
    }
  };

  const checkForSkippedStatuses = (currentStatus, newStatus) => {
    const currentIndex = statuses.indexOf(currentStatus);
    const newIndex = statuses.indexOf(newStatus);

    if (newIndex > currentIndex + 1) {
      return statuses.slice(currentIndex + 1, newIndex);
    }
    return [];
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setPendingStatus(newStatus);

    // Check if any statuses are being skipped
    if (applicant && applicant.status) {
      const skipped = checkForSkippedStatuses(applicant.status, newStatus);

      if (skipped.length > 0) {
        setSkippedStatuses(skipped);
        setShowSkipWarningModal(true);
        return;
      }
    }

    // If status is TEST_SENT, show email preview first
    if (newStatus === "TEST_SENT") {
      generateEmailPreview();
      setShowEmailPreview(true);
      return;
    }

    // For other statuses, proceed with date picker
    setShowDatePicker(true);
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const formattedTime = now.toTimeString().split(' ')[0];
    setSelectedDate(`${formattedDate}T${formattedTime}`);
    setIsDateApplicable(true);
  };

  // Add this helper function to avoid code duplication
  const proceedToDatePicker = () => {
    setShowDatePicker(true);
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const formattedTime = now.toTimeString().split(' ')[0];
    setSelectedDate(`${formattedDate}T${formattedTime}`);
    setIsDateApplicable(true);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const generateEmailPreview = () => {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>Hi ${applicant.first_name},</p>
        
        <p>We have received your application. Thank you for your recent application to join our team here at FullSuite. 
        We are excited to find out if the #suitelife is the workplace you have been searching for and if you are the next Suitelifer 
        we will be so excited about you joining our team!</p>
        
        <p>To kick off the evaluation process, we need you to undergo an assessment test. Rest assured, this test is not a zero-sum exercise 
        and there is no specific passing rate you need to hit to move to the next step as we take the result of this test alongside the interview 
        assessments to get a holistic review of your culture fit with FullSuite.</p>
        
        <p>Click the link of the test corresponding to the position you are applying for:</p>
        
        <p>Please use the link to access and complete the assessment: 
        <a href="${applicant.assessment_url}" style="color: #007bff; text-decoration: none;">Start Assessment</a></p>
        
        <p>The entire test may take you between 40–80 minutes. Some candidates may find the exercise a bit too fast for comfort, 
        but our advice is that you answer each question as honestly as you can.</p>
        
        <p>For more information about our company and what we do, kindly visit our website here: 
        <a href="https://fullsuite.ph/" style="color: #007bff; text-decoration: none;">https://fullsuite.ph/</a></p>
        
        <p>We look forward to reviewing your completed tests and getting to know you better.</p>
      </div>
    `;
    setEmailPreviewContent(emailContent);
  };

  // Update the proceedWithTestSentStatus function to use the helper
  const proceedWithTestSentStatus = () => {
    setShowEmailPreview(false);
    proceedToDatePicker();
  };

  // Update the proceedWithStatusChange function to handle TEST_SENT case
  const proceedWithStatusChange = () => {
    setShowSkipWarningModal(false);

    // If the pending status is TEST_SENT, show email preview first
    if (pendingStatus === "TEST_SENT") {
      generateEmailPreview();
      setShowEmailPreview(true);
    } else {
      setShowDatePicker(true);
      const now = new Date();
      const formattedDate = now.toISOString().split('T')[0];
      const formattedTime = now.toTimeString().split(' ')[0];
      setSelectedDate(`${formattedDate}T${formattedTime}`);
      setIsDateApplicable(true);
    }
  };

  const cancelSkipStatusChange = () => {
    setPendingStatus('');
    setShowSkipWarningModal(false);
  };

  const confirmStatusChange = async () => {
    const newStatus = pendingStatus;
    const previousStatus = status;
    const previousBackendStatus = applicant.status;

    setStatus(newStatus);
    setShowDatePicker(false);

    if (applicant && applicant.applicant_id) {
      const backendStatus = newStatus;
      let data = {
        "progress_id": applicant.progress_id,
        "applicant_id": applicant.applicant_id,
        "status": backendStatus,
        "user_id": user.user_id,
        "change_date": isDateApplicable ? selectedDate : "N/A",
        "previous_status": previousBackendStatus,
        "blacklisted_type": blacklistedType,
        "reason": reason
      };

      try {
        await api.put(`/applicant/update/status`, data);
        const updatedApplicant = { ...applicant, status: backendStatus };

        if (onApplicantUpdate) {
          onApplicantUpdate(updatedApplicant);
        }

        fetchStatusHistory(applicant.progress_id);

        setToasts([...toasts, {
          id: Date.now(),
          applicant: applicant,
          status: newStatus,
          previousStatus: previousStatus,
          previousBackendStatus: previousBackendStatus
        }]);
      } catch (error) {
        console.error("Error updating status:", error);
        setStatus(statusMapping[applicant.status]);
      }
    }
  };

  const cancelStatusChange = () => {
    setShowDatePicker(false);
    setPendingStatus('');
  };

  const undoStatusUpdate = async (toast) => {
    const backendStatus = toast.previousBackendStatus;
    let data = {
      "progress_id": applicant.progress_id,
      "status": backendStatus,
      "user_id": user.user_id,
    };

    try {
      await api.put(`/applicant/update/status`, data);
      const updatedApplicant = { ...applicant, status: backendStatus };

      if (onApplicantUpdate) {
        onApplicantUpdate(updatedApplicant);
      }

      fetchStatusHistory(applicant.progress_id);
      setStatus(toast.previousStatus);
      setToasts(toasts.filter(t => t.id !== toast.id));
    } catch (error) {
      console.error("Error reverting status:", error);
    }
  };

  const removeToast = (id) => {
    setToasts(toasts.filter(t => t.id !== id));
  };

  const handleEditClick = () => {
    setIsEditFormOpen(true);
  };

  const handleCloseEditForm = () => {
    setIsEditFormOpen(false);
  };

  const handleEditSuccess = (updatedApplicant) => {
    if (onApplicantUpdate) {
      onApplicantUpdate(updatedApplicant);
    }
    setIsEditFormOpen(false);
  }

  const toggleStatusHistoryModal = () => {
    setShowStatusHistoryModal(!showStatusHistoryModal);
    if (showStatusHistoryModal) {
      setHoverIndex(null);
    }
  };

  const handleRowMouseEnter = (index, event) => {
    if (skippedStatusesByHistory[index]) {
      const historyModal = document.querySelector('.status-history-modal');
      if (historyModal) {
        const rect = historyModal.getBoundingClientRect();
        setSkippedStatusPosition({
          top: event.clientY,
          left: rect.right + 10,
        });
      }

      setHoverIndex(index);
      setCurrentSkippedStatuses(skippedStatusesByHistory[index]);
    }
  };

  const handleRowMouseLeave = () => {
    setHoverIndex(null);
  };

  const handleDeleteApplicant = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/applicants/delete/${applicant.applicant_id}`);

      if (onApplicantDelete) {
        onApplicantDelete(applicant.applicant_id);
      }

      setShowDeleteModal(false);

      if (!onApplicantDelete) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting applicant:", error);
      alert("Failed to delete applicant. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePushToHris = () => {
    setShowPushModal(true);
  };

  return (
    <div className="border border-gray-light bg-white rounded-2xl mx-auto flex flex-col lg:flex-row overflow-hidden body-regular">
      {/* Left side */}
      <div className='p-5 pl-8 w-full lg:w-[350px] text-gray-dark h-full'>
        <h2 className="display">
          {`${applicant.first_name || ''} ${applicant.middle_name || ''} ${applicant.last_name || ''}`}
        </h2>

        <div className="pl-5 pt-2 flex flex-col flex-grow">
          {applicant.gender && (
            <div className="mt-2 flex items-center flex-shrink-0">
              <FaUser className="mr-2 h-4 w-4" />
              {applicant.gender}
            </div>
          )}
          {applicant.birth_date && (
            <div className="mt-1 flex items-center">
              <FaCakeCandles className="mr-2 h-4 w-4" />
              {new Date(applicant.birth_date).toLocaleDateString()}
            </div>
          )}
          {applicant.email_1 ? <div className="mt-1 flex items-center">
            <FaEnvelope className="mr-2 h-4 w-4 flex-shrink-0" />
            {applicant.email_1}
          </div> : null}
          {applicant.email_2 ? <div className="mt-1 flex items-center">
            <FaEnvelope className="mr-2 h-4 w-4 flex-shrink-0" />
            {applicant.email_2}
          </div> : null}
          {applicant.email_3 ? <div className="mt-1 flex items-center">
            <FaEnvelope className="mr-2 h-4 w-4 flex-shrink-0" />
            {applicant.email_3}
          </div> : null}
          {applicant.mobile_number_1 ? <div className="mt-1 flex items-center">
            <FaPhone className="mr-2 h-4 w-4 flex-shrink-0" />
            {applicant.mobile_number_1}
          </div> : null}
          {applicant.mobile_number_2 ? <div className="mt-1 flex items-center">
            <FaPhone className="mr-2 h-4 w-4 flex-shrink-0" />
            {applicant.mobile_number_2}
          </div> : null}
          <div className="mt-1 flex items-center">
            <FaFileLines className="mr-2 h-4 w-4" />
            <a
              href={applicant.test_result || "#"}
              target={applicant.cv_link ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="underline block mt-1 cursor-pointer"
              onClick={(e) => {
                if (!applicant.cv_link) {
                  e.preventDefault();
                  setIsTestResultNull(true);
                }
              }}
            >
              Test Result
            </a>
          </div>
          <div className="mt-1 flex items-center">
            <FaAddressCard className="mr-2 h-4 w-4" />
            <a
              href={applicant.cv_link || "#"}
              target={applicant.cv_link ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="underline block mt-1 cursor-pointer"
              onClick={(e) => {
                if (!applicant.cv_link) {
                  e.preventDefault();
                  setIsResumeNull(true);
                }
              }}
            >
              Applicant's Resume
            </a>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="py-5 px-7 flex-1 flex flex-col lg:border-l border-gray-light">
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="headline">Applicant Details</h2>
            <div className="flex items-center">
              <select
                className="border body-regular border-gray-light h-8 rounded-md cursor-pointer"
                value={applicant.status}
                onChange={handleStatusChange}
                disabled={toasts.length > 0 || showDatePicker}
              >
                <option value="" disabled>Select status</option>
                {statuses.map((statusOption) => (
                  <option key={statusOption} value={statusOption}>
                    {statusOption.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>

              {applicant.status === "JOB_OFFER_ACCEPTED" && (
                <button
                  onClick={handlePushToHris}
                  disabled={isPushingToHris}
                  className="ml-2 p-2.5 rounded-full bg-teal hover:bg-teal/70 cursor-pointer"
                >
                  <FaCloudUploadAlt className="w-4 h-4 text-white" />
                </button>
              )}

              {statusHistory.some(record => !record.deleted) && (
                <button
                  onClick={toggleStatusHistoryModal}
                  className="ml-2 p-2.5 rounded-full bg-teal-soft hover:bg-teal/20 cursor-pointer"
                  title="View Status History"
                >
                  <FaHistory className="w-4 h-4 text-teal" />
                </button>
              )}

              {canEditApplicant && (
                <button
                  onClick={handleEditClick}
                  className="ml-2 p-2.5 rounded-full bg-teal hover:bg-teal/70 cursor-pointer"
                >
                  <FaPen className="w-4 h-4 text-white" />
                </button>
              )}

              {canDeleteApplicant && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="ml-2 p-2.5 rounded-full bg-red-700 hover:bg-red-600 cursor-pointer"
                  title="Delete Applicant"
                >
                  <FaTrash className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Status Skip Warning Modal */}
          {showSkipWarningModal && (
            <SkipStatusWarningModal
              skippedStatuses={skippedStatuses}
              onCancel={cancelSkipStatusChange}
              onProceed={proceedWithStatusChange}
            />
          )}

          {/* Email Preview Modal for TEST_SENT status */}
          {showEmailPreview && (
            <Modal>
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                role="dialog"
                aria-modal="true"
              >
                <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Email Preview <span className="text-teal-600">— Test Assessment</span>
                    </h3>
                  </div>

                  {/* Email content */}
                  <div className="p-6 overflow-auto flex-1 bg-gray-50">
                    <div
                      className="border p-4 rounded bg-white shadow-inner max-h-96 overflow-auto text-gray-700"
                      dangerouslySetInnerHTML={{ __html: emailPreviewContent }}
                    />
                  </div>

                  {/* Recipient info */}
                  <div className="px-6 py-3 text-sm text-gray-600 border-t border-gray-100">
                    <p className="mb-1">
                      This email will be sent to:
                      <span className="font-medium text-gray-800">
                        {" "}
                        {applicant.email_1}
                        {applicant.email_2 && `, ${applicant.email_2}`}
                        {applicant.email_3 && `, ${applicant.email_3}`}
                      </span>
                    </p>
                    <p>
                      CC: <span className="font-medium">hireme@getfullsuite.com</span> | BCC:{" "}
                      <span className="font-medium">{user.user_email}</span>
                    </p>
                  </div>

                  {/* Footer buttons */}
                  <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <button
                      onClick={() => setShowEmailPreview(false)}
                      className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={proceedWithTestSentStatus}
                      className="px-5 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow transition-all"
                    >
                      Continue to Set Date
                    </button>
                  </div>
                </div>
              </div>
            </Modal>
          )}

          {/* Date picker modal */}
          {showDatePicker && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h3 className="text-lg font-medium mb-4">Change Status Date</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    When did this status change occur?
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full p-2 border rounded"
                    value={selectedDate}
                    onChange={handleDateChange}
                    disabled={!isDateApplicable}
                  />

                  {pendingStatus === "TEST_SENT" && (
                    <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                      <p className="text-sm font-medium text-blue-800 flex items-start">
                        <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                        </svg>
                        Changing the status to 'Test Sent' will automatically send test assessment to applicant.
                      </p>
                    </div>
                  )}

                  {pendingStatus === "BLACKLISTED" && (
                    <div className="space-y-4 pt-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Blacklisted Type
                        </label>
                        <select
                          value={blacklistedType}
                          onChange={(e) => setBlacklistedType(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="">Select type</option>
                          <option value="SOFT">Soft</option>
                          <option value="HARD">Hard</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reason for Blacklist
                        </label>
                        <select
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="">Select reason</option>
                          <option value="DID_NOT_TAKE_TEST">Did not take test</option>
                          <option value="NO_SHOW">No show</option>
                          <option value="CULTURE_MISMATCH">Culture mismatch</option>
                          <option value="EXPECTED_SALARY_MISMATCH">Expected salary mismatch</option>
                          <option value="WORKING_SCHEDULE_MISMATCH">Working schedule mismatch</option>
                          <option value="OTHER_REASONS">Other reasons</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={cancelStatusChange}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStatusChange}
                    className="px-4 py-2 bg-teal text-white rounded hover:bg-teal/80"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Status History Modal */}
          {showStatusHistoryModal && (
            <StatusHistoryModal
              show={showStatusHistoryModal}
              toggle={toggleStatusHistoryModal}
              statusHistory={statusHistory}
              skippedStatusesByHistory={skippedStatusesByHistory}
              hoverIndex={hoverIndex}
              handleRowMouseEnter={handleRowMouseEnter}
              handleRowMouseLeave={handleRowMouseLeave}
              currentSkippedStatuses={currentSkippedStatuses}
              skippedStatusPosition={skippedStatusPosition}
              refreshStatusHistory={() => fetchStatusHistory(applicant.progress_id)}
              statuses={statuses}
            />
          )}

<div className="pl-5 flex-grow">

  {applicant.status === 'BLACKLISTED' && (
    <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <FaExclamationTriangle className="h-4 w-4 text-red-500" />
        <span className="text-sm font-semibold text-red-700">Blacklisted •</span>
        <span className="text-sm text-red-600">{formatBlacklistedType(applicant.blacklisted_type)}</span>
        <span className="text-sm text-red-600">• {formatBlacklistedReason(applicant.reason)}</span>
      </div>
      {/* <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-300">
        Restricted
      </span> */}
    </div>
  )}

  {/* Applicant Details Grid - Keep original style */}
  <div className="grid grid-cols-3 gap-3 mt-4">
    <div className="text-teal">Applied for</div>
    <div className="col-span-2">{applicant.job_title || 'Not specified'}</div>

    <div className="text-teal">Applied on</div>
    <div className="col-span-2">
      {applicant.applicant_created_at
        ? new Date(applicant.applicant_created_at).toLocaleDateString()
        : 'Not specified'}
    </div>

    <div className="text-teal">Applied from</div>
    <div className="col-span-2">
      {applicant.applied_source ? (
        <>
          {formatEnumForDisplay(applicant.applied_source)}{' '}
          {applicant.applied_source === 'REFERRAL' &&
            applicant.referrer_name && (
              <>({applicant.referrer_name})</>
            )}
        </>
      ) : (
        'Not specified'
      )}
    </div>

    <div className="text-teal">Discovered Company at</div>
    <div className="col-span-2">
      {applicant.discovered_at
        ? formatEnumForDisplay(applicant.discovered_at)
        : 'Not specified'}
    </div>
  </div>
</div>


          {/* Tabs */}
          <div className="mt-auto pt-5 flex justify-end">
            <div className="flex gap-2 bg-teal-soft p-1 rounded-md">
              {/* Service ID */}
              {user.feature_names && user.feature_names["999b8e93-ca9a-4aa0-9242-5cf1e289a205"] === "Interview Notes" && (
                <button
                  className={`px-4 py-1 rounded-md ${activeTab === 'discussion'
                    ? 'bg-[#008080] text-white'
                    : 'text-teal hover:bg-teal-600/20 hover:text-teal-700 cursor-pointer'
                    }`}
                  onClick={() => onTabChange('discussion')}
                >
                  Discussion
                </button>
              )}
              {user.feature_names && user.feature_names["d878490d-e446-454c-83fa-7828d7782bf8"] === "Send Mail" && (
                <button
                  className={`px-4 py-1 rounded-md ${activeTab === 'sendMail'
                    ? 'bg-[#008080] text-white'
                    : 'text-teal hover:bg-teal-600/20 hover:text-teal-700 cursor-pointer'
                    }`}
                  onClick={() => onTabChange('sendMail')}
                >
                  Send Email
                </button>
              )}
            </div>
          </div>
        </div>

        {toasts.length > 0 && (
          <Toast toasts={toasts} onUndo={undoStatusUpdate} onDismiss={removeToast} />
        )}

      </div>

      {/* Toast Messages */}
      <div className="fixed top-4 right-4 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            toast={toast}
            undoStatusUpdate={undoStatusUpdate}
            removeToast={removeToast}
          />
        ))}
      </div>

      {isEditFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white w-full h-full overflow-auto lg:ml-72 pointer-events-auto">
            <AddApplicantForm
              onClose={handleCloseEditForm}
              initialData={applicant}
              onEditSuccess={handleEditSuccess}
            />
          </div>
        </div>
      )}

      {isResumeNull && (
        <Modal onClose={() => setIsResumeNull(false)}>
          <div className="flex items-center justify-center">
            <AiFillWarning className="w-20 h-20 text-amber-500" />
          </div>
          <div className="p-6">
            <h1 className="text-lg font-bold text-center mb-4">No Resume Available</h1>
            <p className="text-center text-gray-600">
              The applicant has not uploaded a resume.
            </p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setIsResumeNull(false)}
                className="px-4 py-2 bg-teal text-white rounded hover:bg-teal/80"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {isTestResultNull && (
        <Modal onClose={() => setIsTestResultNull(false)}>
          <div className="flex items-center justify-center">
            <AiFillWarning className="w-20 h-20 text-amber-500" />
          </div>
          <div className="p-6">
            <h1 className="text-lg font-bold text-center mb-4">No Test Result Available</h1>
            <p className="text-center text-gray-600">
              The applicant did not take the test.
            </p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setIsTestResultNull(false)}
                className="px-4 py-2 bg-teal text-white rounded hover:bg-teal/80"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 🛑 Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)}>
          <div className="p-6 text-center">
            <h1 className="text-lg font-bold mb-4">Confirm Delete</h1>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {applicant.first_name} {applicant.last_name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteApplicant}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 🚀 Push to HRIS Modal */}
      {showPushModal && (
        <Modal onClose={() => setShowPushModal(false)}>
          <div className="p-6 text-center">
            <h1 className="text-lg font-bold mb-4">Push Applicant to HRIS</h1>

            <FeatureUnderConstruction />

          </div>
        </Modal>
      )}
    </div>
  );
}

export default ApplicantDetails;