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

export const createNote =
async (noteData) => {

  const response =
    await API.post(
      "/case-notes",
      noteData,
      getToken()
    );

  return response.data;
};

export const getNotesByCase =
async (caseId) => {

  const response =
    await API.get(
      `/case-notes/${caseId}`,
      getToken()
    );

  return response.data;
};

export const deleteNote =
async (id) => {

  const response =
    await API.delete(
      `/case-notes/${id}`,
      getToken()
    );

  return response.data;
};