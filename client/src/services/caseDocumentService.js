import API from "./api";

export const getDocuments =
async (caseId) => {

  const response =
    await API.get(
      `/case-documents/${caseId}`
    );

  return response.data;
};

export const uploadDocument =
async (formData) => {

  const response =
    await API.post(
      "/case-documents",
      formData
    );

  return response.data;
};

export const deleteDocument =
async (id) => {

  const response =
    await API.delete(
      `/case-documents/${id}`
    );

  return response.data;
};