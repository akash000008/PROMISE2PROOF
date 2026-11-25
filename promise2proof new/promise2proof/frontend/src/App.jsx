import { Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Layout from "./pages/Layout.jsx";
import Overview from "./pages/Overview.jsx";
import Verify from "./pages/Verify.jsx";
import History from "./pages/History.jsx";
import Report from "./pages/Report.jsx";

export default function App() {
  return (
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
  );
}
