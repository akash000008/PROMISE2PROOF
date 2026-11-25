import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Layout from "./pages/Layout.jsx";
import Overview from "./pages/Overview.jsx";
import Verify from "./pages/Verify.jsx";
import History from "./pages/History.jsx";
import Report from "./pages/Report.jsx";

const TITLES = {
  "/": "Did you receive what you were promised?",
  "/overview": "Overview",
  "/verify": "New verification",
  "/history": "Verification history",
};

export default function App() {
  const { pathname } = useLocation();

  // Announce page changes to screen readers: update the title and move focus to the main content.
  useEffect(() => {
    const t = pathname.startsWith("/report/") ? "Verification report" : TITLES[pathname] || "Promise2Proof";
    document.title = `${t} | Promise2Proof`;
    const main = document.getElementById("main");
    if (main) main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<Layout />}>
          <Route path="/overview" element={<Overview />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/history" element={<History />} />
          <Route path="/report/:id" element={<Report />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
