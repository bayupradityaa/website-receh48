import { useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import MeetGreet from "./pages/MeetGreet";
import OrderSuccess from "./pages/OrderSuccess";
import CekPesanan from './pages/CekPesanan';
import Login from "./pages/auth/Login";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import PricelistPage from "./pages/PricelistPage";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && profile?.role !== "admin") return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const smootherRef = useRef(null);

  useEffect(() => {
    // Only initialize on non-admin pages
    if (isAdmin) {
      if (smootherRef.current) {
        smootherRef.current.kill();
        smootherRef.current = null;
      }
      return;
    }

    // Scroll to top on route change
    window.scrollTo(0, 0);

    // Initialize ScrollSmoother
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.5,
      effects: true,
    });

    return () => {
      if (smootherRef.current) {
        smootherRef.current.kill();
        smootherRef.current = null;
      }
    };
  }, [isAdmin, location.pathname]);

  if (isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <Routes>
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
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#06070A]">
      {/* Header is outside smooth-wrapper to remain perfectly sticky relative to viewport */}
      <Header />

      <div id="smooth-wrapper" className="flex-1 flex flex-col">
        <div id="smooth-content" className="flex-1 flex flex-col">
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/review" element={<ReviewPage />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/video-call" element={<VideoCall />} />
              <Route path="/twoshot" element={<TwoShot />} />
              <Route path="/meet-greet" element={<MeetGreet />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cek-pesanan" element={<CekPesanan />} />
              <Route path="/pricelist" element={<PricelistPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>

      {/* Toast is outside smooth-wrapper to remain perfectly fixed relative to viewport */}
      <ToastContainer />
    </div>
  );
}