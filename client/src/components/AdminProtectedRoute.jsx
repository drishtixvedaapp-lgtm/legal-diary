import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  if (!userInfo) return <Navigate to="/login" replace />;
  if (userInfo.role !== "admin") return <Navigate to="/dashboard" replace />;

  return children;
};

export default AdminProtectedRoute;
