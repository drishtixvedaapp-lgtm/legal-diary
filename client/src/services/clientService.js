import API from "./api";

// GET ALL CLIENTS
export const getClients = async () => {
  const response = await API.get("/clients");
  return response.data;
};

// CREATE CLIENT
export const createClient = async (clientData) => {
  const response = await API.post("/clients", clientData);
  return response.data;
};

// DELETE CLIENT
export const deleteClient = async (id) => {
  const response = await API.delete(`/clients/${id}`);
  return response.data;
};