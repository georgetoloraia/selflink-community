import { Navigate, Route, Routes } from "react-router-dom";
import CommunityPage from "./pages/CommunityPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="api/v1/community" replace />} />
      <Route path="/community" element={<CommunityPage />} />
    </Routes>
  );
};

export default AppRoutes;
