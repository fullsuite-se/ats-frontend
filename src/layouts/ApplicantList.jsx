import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaFileExport, FaSearch, FaFilter, FaCalendarAlt, FaTimes } from "react-icons/fa";
import AddApplicantDropdown from "../components/AddApplicantDropdown";
import ApplicantTable from "../components/ApplicantTable";
import ExportToPdf from "../utils/ExportToPdf";
import moment from "moment";
import applicantDataStore from "../context/applicantDataStore";
import { filterApplicants, searchApplicant } from "../services/applicantService";
import positionStore from "../context/positionStore";
import applicantFilterStore from "../context/applicantFilterStore";
import { clearFilter } from "../utils/applicantUtils";
import { useStages } from "../hooks/useStages";
import { fetchCounts } from "../services/statusCounterService";
import { initialStages } from "../data/stages";
import useUserStore from "../context/userStore";

export default function ApplicantList({ onSelectApplicant, onAddApplicantClick }) {
  const { search, setSearch, status, setStatus, clearStatus, dateFilter, setDateFilter, dateFilterType, setDateFilterType, selectedDate, setSelectedDate } = applicantFilterStore();
  const [exportValue, setExportValue] = useState("");
  const { setApplicantData } = applicantDataStore();
  const { positionFilter, setPositionFilter } = positionStore();
  const { stages, setStages } = useStages();

  const [showPdfModal, setShowPdfModal] = useState(false);

  const { hasFeature } = useUserStore();
  const canExportApplicant = hasFeature("Export Applicant");
  const canAddApplicant = hasFeature("Add Applicant");

  useEffect(() => {
    if (showPdfModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showPdfModal]);

  const handlePdfExport = () => {
    let value = "";
    if (dateFilterType === "year" && selectedDate) {
      value = selectedDate.getFullYear().toString();
    } else if (dateFilterType === "month" && selectedDate) {
      value = moment(selectedDate).format("MMMM").toLowerCase();
    }
    setExportValue(value);
    setShowPdfModal(true);
  };

  return (
    <div className="relative mx-auto max-w-[1200px] rounded-xl bg-white p-4 border border-gray-200">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Applicant List</h1>
        <div className="flex items-center gap-2">
          {canExportApplicant && (
            <button
              className="flex items-center gap-2 rounded-lg border border-[#008080] px-3 py-1.5 text-[#008080] hover:bg-[#008080]/5 text-sm transition-colors"
              onClick={handlePdfExport}
            >
              <FaFileExport className="h-3.5 w-3.5" /> Export
            </button>
          )}
          {canAddApplicant && (
            <AddApplicantDropdown onAddManually={onAddApplicantClick} />
          )}
        </div>
      </div>

      {/* Minimalist Filter Section */}
      <div className="mb-4 rounded-lg border border-gray-200 p-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
            <input
              type="text"
              placeholder="Search applicants..."
              value={search}
              onChange={(e) => {
                clearStatus([]);
                setSearch(e.target.value);
                searchApplicant(e.target.value, setApplicantData, stages, setStages, setPositionFilter, setSelectedDate);
                fetchCounts(setStages, initialStages);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-md border border-gray-300 focus:border-[#008080] focus:ring-1 focus:ring-[#008080] text-sm"
            />
          </div>

          {/* Date Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex gap-2">
              <select
                value={dateFilterType}
                onChange={(e) => setDateFilterType(e.target.value)}
                className="px-3 py-2 rounded-md border border-gray-300 focus:border-[#008080] focus:ring-1 focus:ring-[#008080] text-sm min-w-[120px]"
              >
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
              
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => {
                    setSelectedDate(date);
                    setDateFilter(date);
                    setSearch("");
                    const formattedDate = dateFilterType === "month" 
                      ? moment(date).format("MMMM")
                      : moment(date).format("YYYY");
                    filterApplicants(positionFilter, setApplicantData, status, formattedDate, dateFilterType);
                  }}
                  showMonthYearPicker={dateFilterType === "month"}
                  showYearPicker={dateFilterType === "year"}
                  dateFormat={dateFilterType === "month" ? "MM/yyyy" : "yyyy"}
                  className="pl-9 pr-4 py-2 rounded-md border border-gray-300 focus:border-[#008080] focus:ring-1 focus:ring-[#008080] text-sm w-full min-w-[140px]"
                  placeholderText={`Select ${dateFilterType}`}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                className="px-3 py-2 rounded-md bg-[#008080] text-white hover:bg-[#006666] text-sm font-medium transition-colors"
                onClick={() => {
                  const formattedDate = selectedDate && dateFilterType === "month"
                    ? moment(selectedDate).format("MMMM")
                    : selectedDate && dateFilterType === "year"
                    ? moment(selectedDate).format("YYYY")
                    : "";
                  filterApplicants(positionFilter, setApplicantData, status, formattedDate, dateFilterType);
                }}
              >
                Filter
              </button>
              
              <button
                className="px-3 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
                onClick={() => clearFilter(setSelectedDate, setApplicantData, setDateFilterType, setDateFilter, setSearch, status, positionFilter)}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <ApplicantTable onSelectApplicant={onSelectApplicant} />
      </div>

      {showPdfModal && (
        <ExportToPdf
          dateFilter={dateFilterType}
          dateFilterValue={exportValue}
          position={positionFilter}
          status={status}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
}