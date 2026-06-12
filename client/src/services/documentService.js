import API from "./api";

const getToken = () => {

  const userInfo =
    JSON.parse(
      localStorage.getItem(
        "userInfo"
      )
    );

  return {
    headers: {
      Authorization:
        `Bearer ${userInfo.token}`,
    },
  };
};

export const getDocuments =
async (caseId) => {

  const response =
    await API.get(
      `/case-documents/${caseId}`,
      getToken()
    );

  return response.data;
};

export const deleteDocument =
async (id) => {

  const response =
    await API.delete(
      `/case-documents/${id}`,
      getToken()
    );

  return response.data;
};