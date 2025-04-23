import api from "../api/axios";

export const updateStatusHistory = (record) => {
  const res = api.put(`applicant/status-history/${record.history_id}`, {
    changed_at: record.changed_at,
  });
  return res.data;
};
