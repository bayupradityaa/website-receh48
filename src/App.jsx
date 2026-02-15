import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { ToastContainer } from "./components/ui/Toast";
import { PageLoader } from "./components/shared/LoadingSpinner";

import Home from "./pages/Home";
import ReviewPage from "./pages/ReviewPage";
import Reviews from "./pages/Reviews";
import VideoCall from "./pages/VideoCall";
import TwoShot from "./pages/TwoShot";
import MeetGreet from "./pages/MeetGreet"; // 👈
import OrderSuccess from "./pages/OrderSuccess";
import Login from "./pages/auth/Login";
import AdminDashboard from "./pages/admin/Dashboard.jsx";

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && profile?.role !== "admin") return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/review"        element={<ReviewPage />} />
          <Route path="/reviews"       element={<Reviews />} />
          <Route path="/video-call"    element={<VideoCall />} />
          <Route path="/twoshot"       element={<TwoShot />} />
          <Route path="/meet-greet"    element={<MeetGreet />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/login"         element={<Login />} />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
      <ToastContainer />
    </div>
  );
}