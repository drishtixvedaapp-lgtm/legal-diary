import API from "./api";

export const getNotesByCase = async (
  caseId
) => {

  const response =
    await API.get(
      `/case-notes/${caseId}`
    );

  return response.data;
};

export const createNote = async (
  noteData
) => {

  const response =
    await API.post(
      "/case-notes",
      noteData
    );

  return response.data;
};

export const deleteNote = async (
  id
) => {

  const response =
    await API.delete(
      `/case-notes/${id}`
    );

  return response.data;
};