import API from "./api";

export const getTimeline =
async (caseId) => {

  const response =
    await API.get(
      `/timeline/${caseId}`
    );

  return response.data;
};