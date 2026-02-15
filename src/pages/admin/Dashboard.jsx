import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardStats from './shared/DashboardStats';
import OrdersManagement from './orders/OrdersManagement';
import MembersManagement from './members/MembersManagement';
import TermsManagement from './settings/TermsManagement';
import TimetableManagement from './settings/TimetableManagement';
import ReviewsManagement from "./reviews/ReviewsManagement";
import ServiceStatusManagement from "./settings/ServiceStatusManagement";

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin',                label: 'Orders',            exact: true },
    { path: '/admin/members',        label: 'Members & Fees'                 },
    { path: '/admin/terms',          label: 'Terms'                          },
    { path: '/admin/timetable',      label: 'Timetable Images'               },
    { path: '/admin/reviews',        label: 'Reviews'                        },
    { path: '/admin/service-status', label: 'Status Layanan'                 },
  ];

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const activeItem =
    navItems.find((i) => isActive(i.path, i.exact)) || navItems[0];

  return (
    <div className="min-h-screen bg-[#0A0E17] text-white">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-5 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-display font-bold leading-tight">
            Admin <span className="text-amber-400">Dashboard</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mt-1">
            Kelola Semua Pesanan, Member, TimeTable Dan Lain-Lain.
          </p>
        </div>

        {/* Mobile: Dropdown */}
        <div className="sm:hidden mb-5">
          <label className="block text-xs text-gray-400 mb-2">
            Navigasi
          </label>

          <div className="relative">
            <select
              value={activeItem.path}
              onChange={(e) => navigate(e.target.value)}
              className="
                w-full appearance-none rounded-xl bg-[#12161F] border border-gray-800
                px-4 py-3 pr-10 text-sm text-white
                focus:outline-none focus:ring-2 focus:ring-amber-500/40
              "
            >
              {navItems.map((item) => (
                <option key={item.path} value={item.path}>
                  {item.label}
                </option>
              ))}
            </select>

            {/* caret icon (pure CSS) */}
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              ▼
            </div>
          </div>
        </div>

        {/* Desktop: Tabs */}
        <div className="hidden sm:flex gap-2 sm:gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <button
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all
                  ${isActive(item.path, item.exact)
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 border border-amber-400/30'
                    : 'bg-[#12161F] text-gray-300 hover:text-white hover:bg-[#1A1F2E] border border-gray-800'
                  }
                  active:scale-[0.98]
                `}
              >
                {item.label}
              </button>
            </Link>
          ))}
        </div>

                {/* Stats */}
        {location.pathname === '/admin' && (
          <div className="mb-5 sm:mb-6">
            <DashboardStats />
          </div>
        )}

        {/* Main Content */}
        <div className="bg-[#12161F] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-4 sm:p-6">
            <Routes>
              <Route path="/"               element={<OrdersManagement />} />
              <Route path="/members"        element={<MembersManagement />} />
              <Route path="/terms"          element={<TermsManagement />} />
              <Route path="/timetable"      element={<TimetableManagement />} />
              <Route path="/reviews"        element={<ReviewsManagement />} />
              <Route path="/service-status" element={<ServiceStatusManagement />} />
            </Routes>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
