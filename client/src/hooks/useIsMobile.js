import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

// Tracks whether the viewport is at/below the mobile breakpoint.
// Shared across the app so every page uses the same cutoff.
export default function useIsMobile(breakpoint = MOBILE_BREAKPOINT) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}
