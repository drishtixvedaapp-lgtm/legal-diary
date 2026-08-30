import API from "./api";
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

export const getCaseFilterOptions = async () => {
  const response = await API.get("/case-browse/filters", getToken());
  return response.data;
};

export const getFilteredCases = async (filters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const response = await API.get(`/case-browse?${params.toString()}`, getToken());
  return response.data;
};
