import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const IDLE_LIMIT_MS = 25 * 60 * 1000; // 25 minutes
const WARNING_LEAD_MS = 60 * 1000;    // show warning 1 minute before logout

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

// Central idle-logout timer, shared by ProtectedRoute and AdminProtectedRoute.
// Pass `enabled: false` when there's no logged-in user so no timers/listeners attach.
export default function useIdleTimeout(enabled) {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);

  const logout = useCallback(() => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }, [navigate]);

  const clearTimers = useCallback(() => {
    clearTimeout(warningTimerRef.current);
    clearTimeout(logoutTimerRef.current);
  }, []);

  // Arms the timers without touching state — safe to call synchronously from an effect.
  const armTimers = useCallback(() => {
    clearTimers();
    warningTimerRef.current = setTimeout(() => setShowWarning(true), IDLE_LIMIT_MS - WARNING_LEAD_MS);
    logoutTimerRef.current = setTimeout(logout, IDLE_LIMIT_MS);
  }, [clearTimers, logout]);

  // Clears any pending warning and re-arms — used from activity callbacks and the "stay signed in" button.
  const resetTimers = useCallback(() => {
    setShowWarning(false);
    armTimers();
  }, [armTimers]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      return;
    }

    armTimers();
    const handleActivity = () => resetTimers();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, handleActivity));

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handleActivity));
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { showWarning: enabled && showWarning, staySignedIn: resetTimers };
}
