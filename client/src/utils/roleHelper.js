export const getUserInfo = () => {

  return JSON.parse(
    localStorage.getItem("userInfo")
  );
};

export const isAdmin = () => {

  return (
    getUserInfo()?.role === "admin"
  );
};

export const isLawyer = () => {

  return (
    getUserInfo()?.role === "lawyer"
  );
};

