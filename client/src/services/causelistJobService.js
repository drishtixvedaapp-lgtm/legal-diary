import API from "./api";
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

export const createCauselistJob = async (payload) => {
  const response = await API.post("/causelist-jobs", payload, getToken());
  return response.data;
};

export const getCauselistJobs = async () => {
  const response = await API.get("/causelist-jobs", getToken());
  return response.data;
};

export const getCauselistJobById = async (id) => {
  const response = await API.get(`/causelist-jobs/${id}`, getToken());
  return response.data;
};
