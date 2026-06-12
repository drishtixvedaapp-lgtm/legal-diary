import API from "./api";

export const getNotifications =
async () => {

  const userInfo =
    JSON.parse(
      localStorage.getItem(
        "userInfo"
      )
    );

  const response =
    await API.get(
      "/notifications",
      {
        headers: {
          Authorization:
            `Bearer ${userInfo.token}`,
        },
      }
    );

  return response.data;

};