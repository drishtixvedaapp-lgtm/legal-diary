import { Navigate } from "react-router-dom";
import useIdleTimeout from "../hooks/useIdleTimeout";
import IdleTimeoutWarning from "./IdleTimeoutWarning";

const ProtectedRoute = ({ children }) => {

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  const { showWarning, staySignedIn } = useIdleTimeout(!!userInfo);

  if (!userInfo) return <Navigate to="/login" />;

  return (
    <>
      {children}
      {showWarning && <IdleTimeoutWarning onStay={staySignedIn} />}
    </>
  );
};

export default ProtectedRoute;
