import { useMemo, useState } from 'react';
import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Image,
  Menu,
  MessageSquareText,
  Settings2,
  ShoppingCart,
  Star,
  Users,
  X,
} from 'lucide-react';

import DashboardStats from './shared/DashboardStats';
import OrdersManagement from './orders/OrdersManagement';
import MembersManagement from './members/MembersManagement';
import TermsManagement from './settings/TermsManagement';
import TimetableManagement from './settings/TimetableManagement';
import ReviewsManagement from './reviews/ReviewsManagement';
import ServiceStatusManagement from './settings/ServiceStatusManagement';
import RecapManagement from './recap/RecapManagement';

import Sidebar from '../../components/ui/modern-side-bar';

const navItems = [
  {
    to: '/admin',
    label: 'Orders',
    end: true,
  },
  {
    to: '/admin/members',
    label: 'Members & Fees',
  },
  {
    to: '/admin/recap',
    label: 'Rekap Total',
  },
  {
    to: '/admin/terms',
    label: 'Terms',
  },
  {
    to: '/admin/timetable',
    label: 'Timetable Images',
  },
  {
    to: '/admin/reviews',
    label: 'Reviews',
  },
  {
    to: '/admin/service-status',
    label: 'Status Layanan',
  },
];

function isCurrentPath(pathname, item) {
  if (item.end) return pathname === item.to;
  return pathname.startsWith(item.to);
}

function Header({ pageTitle, setMobileOpen }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0A0E17] shadow-lg shadow-black/20">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 text-slate-300 transition hover:border-amber-400/50 hover:text-amber-300 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
              Admin Dashboard
            </p>
            <h1 className="truncate text-lg font-bold text-white sm:text-xl">{pageTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-300 md:inline-flex">
            <ClipboardList className="h-4 w-4 text-slate-500" />
            <span className="font-semibold">Admin Mode</span>
          </div>

          <Link
            to="/"
            className="hidden rounded-xl border border-slate-700 px-3 py-2 text-sm font-bold text-slate-200 transition hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-300 sm:inline-flex"
          >
            View Store
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function AdminDashboard() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem = useMemo(
    () => navItems.find((item) => isCurrentPath(location.pathname, item)) || navItems[0],
    [location.pathname]
  );

  const isOrdersPage = location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-[#0A0E17] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative min-h-screen lg:flex">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <div
          className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ${collapsed ? 'lg:ml-[96px]' : 'lg:ml-[292px]'
            }`}
        >
          <Header pageTitle={activeItem.label} setMobileOpen={setMobileOpen} />

          <main className="flex-1 px-3 py-5 sm:px-5 sm:py-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">
              <div className="mb-5 sm:mb-6">
                <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {activeItem.label === 'Orders' ? (
                      <>
                        Manajemen <span className="text-amber-300">Pesanan</span>
                      </>
                    ) : (
                      activeItem.label
                    )}
                  </h2>
                </div>
              </div>

              {isOrdersPage && (
                <div className="mb-5 sm:mb-6">
                  <DashboardStats />
                </div>
              )}

              <section className="rounded-3xl border border-slate-800 bg-[#12161F]/75 p-3 shadow-2xl shadow-black/20 backdrop-blur sm:p-5 lg:p-6">
                <Routes>
                  <Route index element={<OrdersManagement />} />
                  <Route path="/" element={<OrdersManagement />} />
                  <Route path="members" element={<MembersManagement />} />
                  <Route path="recap" element={<RecapManagement />} />
                  <Route path="terms" element={<TermsManagement />} />
                  <Route path="timetable" element={<TimetableManagement />} />
                  <Route path="reviews" element={<ReviewsManagement />} />
                  <Route path="service-status" element={<ServiceStatusManagement />} />
                </Routes>
              </section>
            </div>
          </main>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.45); border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.65); }
      `}</style>
    </div>
  );
}
