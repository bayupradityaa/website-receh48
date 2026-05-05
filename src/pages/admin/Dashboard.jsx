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

const navItems = [
  {
    to: '/admin',
    label: 'Orders',
    caption: 'Kelola pesanan',
    end: true,
    icon: ShoppingCart,
  },
  {
    to: '/admin/members',
    label: 'Members & Fees',
    caption: 'Member dan fee',
    icon: Users,
  },
  {
    to: '/admin/recap',
    label: 'Rekap Total',
    caption: 'Ringkasan profit',
    icon: BarChart3,
  },
  {
    to: '/admin/terms',
    label: 'Terms',
    caption: 'Syarat layanan',
    icon: FileText,
  },
  {
    to: '/admin/timetable',
    label: 'Timetable Images',
    caption: 'Gambar jadwal',
    icon: Image,
  },
  {
    to: '/admin/reviews',
    label: 'Reviews',
    caption: 'Ulasan customer',
    icon: Star,
  },
  {
    to: '/admin/service-status',
    label: 'Status Layanan',
    caption: 'Buka/tutup order',
    icon: Settings2,
  },
];

function isCurrentPath(pathname, item) {
  if (item.end) return pathname === item.to;
  return pathname.startsWith(item.to);
}

function AdminLogo({ collapsed }) {
  return (
    <Link to="/admin" className="flex min-w-0 items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-base font-black text-slate-950 shadow-lg shadow-amber-400/20">
        48
      </div>

      {!collapsed && (
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
            receh48
          </p>
          <p className="truncate text-lg font-black text-white">Admin Panel</p>
        </div>
      )}
    </Link>
  );
}

function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  return (
    <>
      <button
        type="button"
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition lg:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        onClick={() => setMobileOpen(false)}
        aria-label="Close sidebar overlay"
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[292px] flex-col border-r border-slate-800 bg-[#0F1420]/95 shadow-2xl shadow-black/40 backdrop-blur-xl transition-all duration-300 ease-in-out lg:translate-x-0 ${collapsed ? 'lg:w-[96px]' : 'lg:w-[292px]'
          } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div
          className={`flex border-b border-slate-800 px-5 py-5 ${collapsed
            ? 'lg:flex-col lg:items-center lg:justify-center lg:gap-3'
            : 'items-center justify-between'
            }`}
        >
          <AdminLogo collapsed={collapsed} />

          <button
            type="button"
            className={`hidden items-center justify-center rounded-xl border border-slate-700 text-slate-400 transition hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-300 lg:inline-flex ${collapsed ? 'h-9 w-9' : 'h-10 w-10'
              }`}
            onClick={() => setCollapsed((current) => !current)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 text-slate-300 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto px-4 py-5">
          <p
            className={`mb-3 px-3 text-xs font-black uppercase tracking-[0.24em] text-slate-500 ${collapsed ? 'lg:text-center' : ''
              }`}
          >
            {collapsed ? '...' : 'Menu'}
          </p>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-2xl px-3 py-3 transition ${isActive
                      ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/15'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    } ${collapsed ? 'lg:justify-center' : ''}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition ${isActive
                          ? 'bg-slate-950/15 text-slate-950'
                          : 'bg-slate-900 text-slate-500 group-hover:bg-slate-800 group-hover:text-amber-300'
                          }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>

                      {!collapsed && (
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-black">{item.label}</span>
                          <span
                            className={`block truncate text-xs ${isActive ? 'text-slate-900/70' : 'text-slate-500'
                              }`}
                          >
                            {item.caption}
                          </span>
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

function Header({ pageTitle, setMobileOpen }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0A0E17]/85 backdrop-blur-xl">
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
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-300">
              Admin Dashboard
            </p>
            <h1 className="truncate text-lg font-black text-white sm:text-xl">{pageTitle}</h1>
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
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                      {activeItem.label === 'Orders' ? (
                        <>
                          Admin <span className="text-amber-300">Dashboard</span>
                        </>
                      ) : (
                        activeItem.label
                      )}
                    </h2>
                  </div>

                  <div className="hidden rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-right sm:block">
                    <p className="text-xs font-semibold text-slate-500">Halaman aktif</p>
                    <p className="text-sm font-black text-amber-300">{activeItem.label}</p>
                  </div>
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
