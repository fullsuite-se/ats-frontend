import api from "./api";
import moment from "moment";
import { filterCounter } from "./statusCounterService";

export const fetchApplicants = async (setApplicantData) => {
  const { data } = await api.get(`/applicants`);
  setApplicantData(data);
};

export const filterApplicants = async (
  position,
  setApplicantData,
  status,
  date,
  dateType,
) => {
  let sql = "/applicants/filter?";
  
  // URL encode all parameters
  if (position !== "All") {
    sql += `position=${encodeURIComponent(position)}`;
  }
  
  if (date !== "Invalid date") {
    sql += `${position !== "All" ? '&' : ''}${dateType}=${encodeURIComponent(date)}`;
  }

  if (status.length === 0 && position === "All" && date === "Invalid date") {
    fetchApplicants(setApplicantData);
  } else {
    status.forEach((statusItem, index) => {
      // Use proper URL encoding for status parameters
      const separator = (index === 0 && position === "All" && date === "Invalid date") ? '' : '&';
      sql += `${separator}status=${encodeURIComponent(statusItem)}`;
    });
    
    const { data } = await api.get(sql);
    setApplicantData(data);
  }
};

export const searchApplicant = async (
  searchValue,
  setApplicantData,
  stages,
  setStages,
  setPositionFilter,
  setSelectedDate,
) => {
  let sql = "/applicants/search?";
  if (searchValue === "") {
    fetchApplicants(setApplicantData);
  } else {
    sql += `searchQuery=${searchValue}`;
    const { data } = await api.get(sql);
    setApplicantData(data);
  }
  setStages(
    stages.map((stage) => ({
      ...stage,
      selected: false,
      statuses: stage.statuses.map((status) => ({
        ...status,
        selected: false,
      })),
    })),
  );
  setPositionFilter("All");
  setSelectedDate("");
};

export const filterDate = async (
  setApplicantData,
  dateFilter,
  dateFilterType,
) => {
  let sql = "/applicants/filter?";
  dateFilterType === "month"
    ? (dateFilter = moment(dateFilter).format("MMMM"))
    : (dateFilter = moment(dateFilter).format("YYYY"));
  dateFilter !== "Invalid date"
    ? (sql += `&${dateFilterType}=${dateFilter}`)
    : (sql += "");
  const { data } = await api.get(sql);
  setApplicantData(data);
};

export const updateStatus = async (
  id,
  progress_id,
  Status,
  status,
  applicantData,
  setApplicantData,
  positionFilter,
  setStages,
  initialStages,
  setPositionFilter,
  user,
) => {
  let data = {
    progress_id: progress_id,
    status: Status,
    user_id: user.user_id,
  };

  try {
    await api.put(`/applicant/update/status`, data);
    const updatedApplicantData = applicantData.map((applicant) =>
      applicant.applicant_id === id
        ? { ...applicant, status: Status }
        : applicant,
    );
    setApplicantData(updatedApplicantData);
    filterCounter(
      positionFilter,
      setStages,
      initialStages,
      setPositionFilter,
      status,
    );
  } catch (error) {
    console.error("Update Status Failed: " + error);
  }
};
