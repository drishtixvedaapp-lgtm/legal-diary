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

    // Mark this fresh login as the activity baseline for the idle timeout
    // (see useIdleTimeout), so a stale timestamp from a prior session can't
    // immediately log the user back out.
    localStorage.setItem(
      "lastActivityAt",
      String(Date.now())
    );

    return response.data;
};

// LOGOUT

export const logoutUser = () => {

  localStorage.removeItem(
    "userInfo"
  );

  localStorage.removeItem(
    "lastActivityAt"
  );
};

// FORGOT PASSWORD

export const forgotPassword =
  async (email) => {

    const response =
      await API.post(
        "/auth/forgot-password",
        { email }
      );

    return response.data;
};

// RESET PASSWORD

export const resetPassword =
  async ({ token, newPassword }) => {

    const response =
      await API.post(
        "/auth/reset-password",
        { token, newPassword }
      );

    return response.data;
};

// INVITE A JUNIOR LAWYER — requires auth; API attaches the token automatically (see services/api.js)

export const inviteLawyer =
  async ({ name, email }) => {

    const response =
      await API.post(
        "/auth/invite-lawyer",
        { name, email }
      );

    return response.data;
};

// ACCEPT INVITE

export const acceptInvite =
  async ({ token, password }) => {

    const response =
      await API.post(
        "/auth/accept-invite",
        { token, password }
      );

    return response.data;
};