import API from "./api";

// API already attaches the token via interceptor — no need to pass headers manually

export const getAdminAnalytics = async () => {
  const res = await API.get("/admin/analytics");
  return res.data;
};

export const getAllUsers = async () => {
  const res = await API.get("/admin/users");
  return res.data;
};

export const toggleUserActive = async (id) => {
  const res = await API.patch(`/admin/users/${id}/toggle`);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await API.delete(`/admin/users/${id}`);
  return res.data;
};
