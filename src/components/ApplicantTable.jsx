import DataTable from 'react-data-table-component';
import { useState, useEffect } from 'react';
import moment from 'moment';
import Toast from '../assets/Toast';
import { useApplicantData } from '../hooks/useApplicantData';
import positionStore from '../context/positionStore';
import { initialStages } from '../data/stages';
import { useStages } from '../hooks/useStages';
import applicantFilterStore from '../context/applicantFilterStore';
import useUserStore from '../context/userStore';
import { useToastManager } from '../utils/toastManager';
import { updateStatus } from '../services/applicantService';
import { statusMapping } from '../data/status';
import api from '../services/api';

const ApplicantTable = ({ onSelectApplicant }) => {
  const { applicantData, setApplicantData, statuses } = useApplicantData();
  const { positionFilter, setPositionFilter } = positionStore();
  const { setStages } = useStages();
  const { status, setSearch, search } = applicantFilterStore();
  const { user } = useUserStore();
  const { toasts, addToast, removeToast, undoStatusUpdate } = useToastManager();

  // New state variables for the date picker modal
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [isDateApplicable, setIsDateApplicable] = useState(true);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);

  //blacklisted info
  const [blacklistedType, setBlacklistedType] = useState(null);
  const [reason, setReason] = useState(null);
  const [reasonForRejection, setReasonForRejection] = useState(null);



  const handleStatusChange = (id, progress_id, newStatus, currentStatus) => {
    // Store the pending status change
    setPendingStatusChange({
      id,
      progress_id,
      newStatus,
      currentStatus
    });


    // Show date picker
    setShowDatePicker(true);

    // Set default date to today
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
    setIsDateApplicable(true);
  };

  const confirmStatusChange = async () => {

    if (!pendingStatusChange) return;

    const { id, progress_id, newStatus, currentStatus } = pendingStatusChange;




    // Close date picker
    setShowDatePicker(false);

    // Find applicant for toast notification
    const applicant = applicantData.find(applicant => applicant.applicant_id === id);

    // Update status in backend with date information
    try {
      const data = {
        "progress_id": progress_id,
        "applicant_id": id,
        "status": newStatus,
        "user_id": user.user_id,
        "change_date": isDateApplicable ? selectedDate : "N/A",
        "previous_status": currentStatus,
        "blacklisted_type": blacklistedType,
        "reason": reason,
        "reason_for_rejection": reasonForRejection
      };

      await api.put(`/applicant/update/status`, data);



      // Update local state and show toast notification
      addToast(applicant, statusMapping[newStatus] || newStatus, statusMapping);

      // Update the applicant data in the state
      updateStatus(id, progress_id, newStatus, currentStatus, applicantData, setApplicantData,
        positionFilter, setStages, initialStages, setPositionFilter, user);

    } catch (error) {
      console.error("Error updating status:", error);
    }

    // Clear pending status change
    setPendingStatusChange(null);
  };

  const cancelStatusChange = () => {
    setShowDatePicker(false);
    setPendingStatusChange(null);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleDateApplicableChange = (e) => {
    setIsDateApplicable(e.target.checked);
  };

  const handleApplicantRowClick = (row) => {
    const applicant = applicantData.find((applicant) => applicant.applicant_id === row.applicant_id);
    if (applicant) {
      onSelectApplicant(applicant);
    }
    setPositionFilter("All");
    setSearch("");
  };

  const columns = [
    {
      name: 'Applicant ID',
      selector: row => row.applicant_id,
      wrap: true,
      grow: 1.3,
    },
    {
      name: 'Date Applied',
      selector: row => moment(row.created_at).format('MMMM DD, YYYY'),
      wrap: true,
      grow: 1,
    },
    {
      name: 'Applicant Name',
      selector: row => `${row.first_name} ${row.last_name}`,
      wrap: true,
      grow: 2, // Give name more space
    },
    {
      name: 'Position Applied',
      selector: row => row.title,
      wrap: true,
      grow: 1.7,
    },
    {
      name: 'Status',
      cell: row => (
        <select
          className='border border-gray-light max-w-[100px]'
          value={row.status}
          onChange={(e) =>
            handleStatusChange(row.applicant_id, row.progress_id, e.target.value, status)
          }
          style={{ padding: '5px', borderRadius: '5px' }}
          disabled={showDatePicker}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status
                .toLowerCase()
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
            </option>
          ))}
        </select>
      ),
      wrap: true,
      grow: 1,
    },
  ];


  return (
    <>
      {applicantData.length === 0 && (search != "" || status.length != 0 || positionFilter != "") ? (
        <div className="text-center text-lg font-semibold text-gray-600 mt-8">
          No applicants found.
        </div>
      ) : (
        <DataTable
          customStyles={{
            rows: {
              style: {
                fontSize: '12px',
                paddingTop: '8px',
                paddingBottom: '8px',
              },
            },
          }}
          pointerOnHover
          highlightOnHover
          striped
          fixedHeaderScrollHeight="60vh"
          responsive
          columns={columns}
          data={applicantData}
          // defaultSortAsc={false}
          // defaultSortFieldId={1}
          onRowClicked={handleApplicantRowClick}
          pagination
          progressPending={applicantData.length === 0 || !statuses.length}
          progressComponent={<LoadingComponent />}
        />
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
                type="date"
                className="w-full p-2 border rounded"
                value={selectedDate}
                onChange={handleDateChange}
                disabled={!isDateApplicable}
              />
              {pendingStatusChange.newStatus === "TEST_SENT" && (
                <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <p className="text-sm font-medium text-blue-800 flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                    Changing the status to Test Sent will automatically send test assessment to applicant.
                  </p>
                </div>
              )}

              {pendingStatusChange.newStatus === "BLACKLISTED" && (
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
                      <option value="OTHER_REASONS">Other reasons</option>
                    </select>
                  </div>
                </div>
              )}

              {pendingStatusChange.newStatus === "NOT_FIT" && (
                <div className="space-y-4 pt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Rejection
                    </label>
                    <select
                      value={reasonForRejection}
                      onChange={(e) => setReasonForRejection(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="CULTURE_MISMATCH">Culture Mismatch</option>
                      <option value="ASKING_SALARY_MISMATCH">Asking salary mismatch</option>
                      <option value="WORKING_SCHEDULE_MISMATCH">Working schedule mismatch</option>
                      <option value="SKILLSET_MISMATCH">Skillset mismatch</option>
                      <option value="OTHER_REASONS">Other reasons</option>
                    </select>
                  </div>
                </div>
              )}

            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={isDateApplicable}
                  onChange={handleDateApplicableChange}
                />
                <span className="text-sm text-gray-700">Date is applicable</span>
              </label>
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
    </>
  );
};

function LoadingComponent() {
  return (
    <div className="flex flex-col w-full space-y-2">
      <div className=" h-10 animate-pulse rounded-sm bg-gray-light"></div>
      <div className=" h-10 animate-pulse rounded-sm bg-gray-light"></div>
      <div className=" h-10 animate-pulse rounded-sm bg-gray-light"></div>
      <div className=" h-10 animate-pulse rounded-sm bg-gray-light"></div>
      <div className=" h-10 animate-pulse rounded-sm bg-gray-light"></div>
    </div>
  );
};

export default ApplicantTable;