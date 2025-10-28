import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import SkipLink from "../a11y/SkipLink";
import LiveRegion from "../a11y/LiveRegion";
import Footer from "@/components/layout/Footer";

export default function Layout({ children }) {
  const location = useLocation();

  useEffect(() => {
    const main = document.getElementById("main-content");
    if (main) main.focus();
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <SkipLink />

      <header role="banner">
        <Navbar />
      </header>

      <main
        id="main-content"
        role="main"
        className="flex-1 w-full px-4 py-6 focus:outline-none"
        tabIndex="-1"
        aria-label="Contenu principal"
      >
        <div className="max-w-6xl mx-auto space-y-6">{children}</div>
      </main>

      <Footer />
      <LiveRegion />
    </div>
  );
}
