import { useEffect, useState } from "react";
import "./styles/opening-animation.css";

const sessionKey = "versatile-opening-seen-v1";
function shouldShow() {
  if (
    window.location.pathname.startsWith("/admin") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    navigator.connection?.saveData
  )
    return false;
  try {
    return !sessionStorage.getItem(sessionKey);
  } catch {
    // With storage blocked, don't risk repeating the overlay on every navigation.
    return false;
  }
}

export default function OpeningAnimation({ children }) {
  const [visible, setVisible] = useState(shouldShow);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!visible) return;
    try {
      sessionStorage.setItem(sessionKey, "1");
    } catch {
      /* optional session storage */
    }
    // Never hold up the site indefinitely if the asset is slow or unavailable.
    const timer = setTimeout(() => setVisible(false), loaded ? 4000 : 5000);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event) => {
      if (event.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", escape);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", escape);
    };
  }, [visible, loaded]);
  // A separate absolute deadline also bounds the time spent fetching + playing.
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <>
      <div inert={visible ? true : undefined}>{children}</div>
      {visible && (
        <div className="site-opening">
          <img
            src="/images/versatile-opening.webp"
            width="544"
            height="490"
            alt="Versatile Instruments"
            onLoad={() => setLoaded(true)}
            onError={() => setVisible(false)}
            fetchPriority="high"
          />
        </div>
      )}
    </>
  );
}
