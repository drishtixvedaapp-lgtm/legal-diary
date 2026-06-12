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

export const getOutcomesByCase =
async (caseId) => {

  const response =
    await API.get(
      `/hearing-outcomes/${caseId}`,
      getToken()
    );

  return response.data;
};

export const createOutcome =
async (data) => {

  const response =
    await API.post(
      "/hearing-outcomes",
      data,
      getToken()
    );

  return response.data;
};