import API from "./api";

export const getDashboardStats =
async () => {

  const userInfo =
    JSON.parse(
      localStorage.getItem(
        "userInfo"
      )
    );

  const response =
    await API.get(

      "/dashboard",

      {
        headers: {
          Authorization:
            `Bearer ${userInfo.token}`,
        },
      }
    );

  return response.data;
};