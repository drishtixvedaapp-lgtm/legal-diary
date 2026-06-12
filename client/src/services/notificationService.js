import API from "./api";

const getToken = () => {

  const userInfo =
    JSON.parse(
      localStorage.getItem("userInfo")
    );

  return {
    headers: {
      Authorization:
        `Bearer ${userInfo.token}`,
    },
  };
};

export const getNotifications =
async () => {

  const response =
    await API.get(
      "/notifications",
      getToken()
    );

  return response.data;
};

export const createReminder =
async (data) => {

  const response =
    await API.post(
      "/notifications/reminder",
      data,
      getToken()
    );

  return response.data;
};