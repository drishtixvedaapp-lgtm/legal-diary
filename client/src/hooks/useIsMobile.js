import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

// Native "resize" events fire continuously (often 30-100+ times/sec) while
// dragging a window edge or the DevTools device-toolbar handle on desktop.
// This hook mounts in many components at once (App, Sidebar, every page),
// so without debouncing, every one of those native events triggers a
// setState in every mounted instance simultaneously - the resulting
// cascade of re-renders can't keep up with the event rate and locks up
// the tab. A real phone never fires this stream (only once on rotate), so
// the bug is invisible there. Debouncing collapses a whole drag/resize
// gesture into a single state update, made after things settle.
const RESIZE_DEBOUNCE_MS = 120;

// Tracks whether the viewport is at/below the mobile breakpoint.
// Shared across the app so every page uses the same cutoff.
export default function useIsMobile(breakpoint = MOBILE_BREAKPOINT) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );

  useEffect(() => {
    let timeoutId = null;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth <= breakpoint);
      }, RESIZE_DEBOUNCE_MS);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [breakpoint]);

  return isMobile;
}
