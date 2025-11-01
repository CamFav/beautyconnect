import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";

export default function App() {
  const [showToaster, setShowToaster] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowToaster(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
      {showToaster && (
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              borderRadius: "8px",
              background: "#f0f9ff",
              color: "#0369a1",
              border: "1px solid #bae6fd",
              fontSize: "0.9rem",
            },
            success: {
              iconTheme: { primary: "#2563eb", secondary: "#ffffff" },
            },
            error: {
              style: {
                background: "#fee2e2",
                color: "#991b1b",
                border: "1px solid #fca5a5",
              },
              iconTheme: { primary: "#dc2626", secondary: "#ffffff" },
            },
          }}
        />
      )}
    </BrowserRouter>
  );
}
