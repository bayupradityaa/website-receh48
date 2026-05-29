"use client";

import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  FileText,
  Bell,
  Search,
  HelpCircle,
  ShoppingCart,
  Users,
  Image,
  Star,
  Settings2
} from 'lucide-react';

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  end?: boolean;
}

interface SidebarProps {
  className?: string;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const navigationItems: NavigationItem[] = [
  { id: "orders", name: "Orders", icon: ShoppingCart, href: "/admin", end: true },
  { id: "members", name: "Members & Fees", icon: Users, href: "/admin/members" },
  { id: "recap", name: "Rekap Total", icon: BarChart3, href: "/admin/recap" },
  { id: "terms", name: "Terms", icon: FileText, href: "/admin/terms" },
  { id: "timetable", name: "Timetable Images", icon: Image, href: "/admin/timetable" },
  { id: "reviews", name: "Reviews", icon: Star, href: "/admin/reviews" },
  { id: "service-status", name: "Status Layanan", icon: Settings2, href: "/admin/service-status" },
];

export function Sidebar({ 
  className = "", 
  collapsed, 
  setCollapsed, 
  mobileOpen, 
  setMobileOpen 
}: SidebarProps) {
  const { profile, signOut } = useAuth() as any;
  const [searchQuery, setSearchQuery] = useState("");

  const adminName = profile?.full_name || 'Admin';
  const adminEmail = profile?.email || 'Administrator';
  const avatarInitial = adminName.slice(0, 2).toUpperCase();

  // Auto-collapse sidebar on smaller desktop screens, close on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        if (window.innerWidth < 1280) {
          setCollapsed(true);
        } else {
          setCollapsed(false);
        }
        setMobileOpen(false);
      } else {
        setMobileOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setCollapsed, setMobileOpen]);

  const toggleCollapse = () => setCollapsed(prev => !prev);
  const closeMobile = () => setMobileOpen(false);

  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar dari Admin Panel?")) {
      await signOut();
    }
  };

  const filteredItems = navigationItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300" 
          onClick={closeMobile} 
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-[#0F1420]/95 border-r border-slate-800 z-50 transition-all duration-300 ease-in-out flex flex-col backdrop-blur-xl
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          ${collapsed ? "w-[96px]" : "w-[292px]"}
          lg:translate-x-0
          ${className}
        `}
      >
        {/* Header with Receh48 Logo & Collapse Button */}
        <div className={`flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/20 ${collapsed ? "justify-center" : ""}`}>
          {!collapsed ? (
            <Link to="/admin" className="flex items-center gap-3 min-w-0" onClick={closeMobile}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-base font-bold text-slate-950 shadow-lg shadow-amber-400/20">
                48
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">receh48</span>
                <span className="text-base font-bold text-white truncate">Admin Panel</span>
              </div>
            </Link>
          ) : (
            <Link to="/admin" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-base font-bold text-slate-950 shadow-lg shadow-amber-400/20" onClick={closeMobile}>
              48
            </Link>
          )}

          {/* Desktop collapse toggle */}
          {!mobileOpen && (
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-300 transition-all duration-200"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Mobile close toggle */}
          {mobileOpen && (
            <button
              onClick={closeMobile}
              className="lg:hidden flex p-1.5 rounded-lg border border-slate-700 text-slate-300"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Live Search Bar */}
        {!collapsed && (
          <div className="px-4 py-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Cari menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all duration-200"
              />
            </div>
          </div>
        )}

        {/* Navigation Section */}
        <div className="custom-scrollbar flex-1 overflow-y-auto px-4 py-3">
          {!collapsed && (
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Menu
            </p>
          )}
          <nav className="space-y-2">
            {filteredItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.id}
                  to={item.href}
                  end={item.end}
                  onClick={closeMobile}
                  title={collapsed ? item.name : undefined}
                  className={({ isActive }) => `
                    group flex items-center gap-3 rounded-2xl p-1.5 transition duration-200 relative
                    ${isActive
                      ? "bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-400/15"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                    }
                    ${collapsed ? "justify-center" : ""}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <span className={`
                        flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition duration-200
                        ${isActive
                          ? 'bg-slate-950/15 text-slate-950'
                          : 'bg-slate-900 text-slate-500 group-hover:bg-slate-800 group-hover:text-amber-300'
                        }
                      `}>
                        <Icon className="h-5 w-5" />
                      </span>
                      
                      {!collapsed && (
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{item.name}</span>
                        </span>
                      )}

                      {/* Tooltip for collapsed state */}
                      {collapsed && (
                        <div className="absolute left-full ml-3 px-3 py-2 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-2xl">
                          {item.name}
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-slate-900 border-l border-b border-slate-800 rotate-45" />
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile and Logout Section */}
        <div className="mt-auto border-t border-slate-800">
          
          {/* Profile Details */}
          <div className={`border-b border-slate-800 bg-slate-900/10 ${collapsed ? 'py-4 px-2' : 'p-4'}`}>
            {!collapsed ? (
              <div className="flex items-center p-2 rounded-2xl bg-slate-950/30 border border-slate-800 hover:bg-slate-950/50 transition-colors duration-200">
                <div className="w-9 h-9 bg-amber-400/10 border border-amber-400/20 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-amber-300 font-bold text-sm">{avatarInitial}</span>
                </div>
                <div className="flex-1 min-w-0 ml-3">
                  <p className="text-sm font-semibold text-white truncate">{adminName}</p>
                  <p className="text-xs text-slate-500 truncate">{adminEmail}</p>
                </div>
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full ml-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="Online" />
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="relative group cursor-pointer">
                  <div className="w-10 h-10 bg-amber-400/10 border border-amber-400/20 rounded-xl flex items-center justify-center">
                    <span className="text-amber-300 font-bold text-sm">{avatarInitial}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#0F1420] shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  
                  {/* Tooltip profile info */}
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-2xl">
                    <p className="font-bold text-white">{adminName}</p>
                    <p className="text-slate-500 text-[10px]">{adminEmail}</p>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-slate-900 border-l border-b border-slate-800 rotate-45" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Logout Action */}
          <div className="p-4">
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center rounded-2xl transition-all duration-200 group relative
                bg-red-500/5 hover:bg-red-500/15 border border-red-500/10 hover:border-red-500/30 text-red-400 hover:text-red-300
                ${collapsed ? "justify-center p-3" : "space-x-3 px-4 py-3"}
              `}
              title={collapsed ? "Logout" : undefined}
            >
              <div className="flex items-center justify-center shrink-0">
                <LogOut className="h-5 w-5" />
              </div>
              
              {!collapsed && (
                <span className="text-sm font-bold">Logout</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-slate-900 border border-slate-800 text-red-300 text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-2xl">
                  Logout
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-slate-900 border-l border-b border-slate-800 rotate-45" />
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
export default Sidebar;
