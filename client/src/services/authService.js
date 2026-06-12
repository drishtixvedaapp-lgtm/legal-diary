import API from "./api";

// REGISTER

export const registerUser =
  async (userData) => {

    const response =
      await API.post(
        "/auth/register",
        userData
      );

    return response.data;
};

// LOGIN → SEND OTP

export const loginUser =
  async (userData) => {

    const response =
      await API.post(
        "/auth/login",
        userData
      );

    return response.data;
};

// VERIFY LOGIN OTP

export const verifyLoginOtp =
  async (otpData) => {

    const response =
      await API.post(
        "/auth/verify-login-otp",
        otpData
      );

    // SAVE JWT

    localStorage.setItem(
      "userInfo",
      JSON.stringify(
        response.data
      )
    );

    return response.data;
};

// LOGOUT

export const logoutUser = () => {

  localStorage.removeItem(
    "userInfo"
  );
};