import { Navigate } from "react-router-dom";
import useIdleTimeout from "../hooks/useIdleTimeout";
import IdleTimeoutWarning from "./IdleTimeoutWarning";

const AdminProtectedRoute = ({ children }) => {

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  const { showWarning, staySignedIn, expired } = useIdleTimeout(!!userInfo && userInfo.role === "admin");

  if (!userInfo) return <Navigate to="/login" replace />;
  if (userInfo.role !== "admin") return <Navigate to="/dashboard" replace />;
  if (expired) return <Navigate to="/login" replace />;

  return (
    <>
      {children}
      {showWarning && <IdleTimeoutWarning onStay={staySignedIn} />}
    </>
  );
};

export default AdminProtectedRoute;
