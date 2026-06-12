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


// GET ALL CASES

export const getCases =
  async () => {

    const response =
      await API.get(
        "/cases",
        getToken()
      );

    return response.data;
};

// CREATE CASE

export const createCase =
  async (caseData) => {

    const response =
      await API.post(
        "/cases",
        caseData,
        getToken()
      );

    return response.data;
};

// UPDATE CASE

export const updateCase =
  async (
    id,
    caseData
  ) => {

    const response =
      await API.put(
        `/cases/${id}`,
        caseData,
        getToken()
      );

    return response.data;
};

// DELETE CASE

export const deleteCase =
  async (id) => {

    const response =
      await API.delete(
        `/cases/${id}`,
        getToken()
      );

    return response.data;
};

export const getCaseById =
async (id) => {

  const response =
    await API.get(
      `/cases/${id}`
    );

  return response.data;
};

export const getClosedCases =
async () => {

  const response =
    await API.get(
      "/cases/history/closed"
    );

  return response.data;
};