import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const IDLE_LIMIT_MS = 25 * 60 * 1000; // 25 minutes
const WARNING_LEAD_MS = 60 * 1000;    // show warning 1 minute before logout
const LAST_ACTIVITY_KEY = "lastActivityAt";

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

// True if the wall-clock gap since the last recorded activity already exceeds the
// idle limit. Catches the case where the tab (or the whole browser/computer) was
// closed and reopened later — including via "restore previous tabs" — with the
// login token still valid: an in-memory timer would otherwise restart from zero.
function idleGapExceeded() {
  const last = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
  if (!last) return false;
  return Date.now() - last > IDLE_LIMIT_MS;
}

// Central idle-logout timer, shared by ProtectedRoute and AdminProtectedRoute.
// Pass `enabled: false` when there's no logged-in user so no timers/listeners attach.
export default function useIdleTimeout(enabled) {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  // Computed once, synchronously, on mount — before any protected children render.
  // Clears the stale session immediately so the token can't linger as "still valid".
  const [expired] = useState(() => {
    const isExpired = enabled && idleGapExceeded();
    if (isExpired) {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    }
    return isExpired;
  });
  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);

  const logout = useCallback(() => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    navigate("/login", { replace: true });
  }, [navigate]);

  const recordActivity = useCallback(() => {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  }, []);

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
    recordActivity();
    armTimers();
  }, [armTimers, recordActivity]);

  useEffect(() => {
    if (!enabled || expired) {
      clearTimers();
      return;
    }

    recordActivity();
    armTimers();
    const handleActivity = () => resetTimers();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, handleActivity));

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handleActivity));
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, expired]);

  return { showWarning: enabled && !expired && showWarning, staySignedIn: resetTimers, expired: enabled && expired };
}
