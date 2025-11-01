import { useState, useEffect } from "react";

/**
 * LiveRegion
 * Zone invisible pour lecteurs d’écran (feedback vocal automatique)
 * Usage :
 *    window.dispatchEvent(new CustomEvent("announce", { detail: "Action réussie" }));
 */
export default function LiveRegion() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handler = (e) => {
      setMessage(e.detail || "");
      setTimeout(() => setMessage(""), 4000);
    };
    window.addEventListener("announce", handler);
    return () => window.removeEventListener("announce", handler);
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      id="live-region"
    >
      {message}
    </div>
  );
}
