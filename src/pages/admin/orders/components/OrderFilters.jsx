import { Search, Video, Filter, UserCheck, Calendar } from 'lucide-react';

export default function OrderFilters({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
  filterOrderType,
  onOrderTypeChange,
  filterAssignedTo,
  onAssignedToChange,
  filterTour,
  onTourChange,
  adminsList = [],

}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 bg-[#111622] p-4 rounded-2xl border border-gray-800 shadow-lg">
      {/* Search */}
      <div className="w-full">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 pl-1">Cari Pesanan</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
          <input
            type="text"
            placeholder="Cari nama, email, atau ID..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#0a0e17] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-semibold"
          />
        </div>
      </div>

      {/* Tour / War Dropdown */}
      <div className="w-full">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 pl-1">Pilih Tour / War</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
          <select
            value={filterTour}
            onChange={(e) => onTourChange(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 bg-[#0a0e17] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer text-sm font-semibold"
          >
            <option value="">Semua Tour / War</option>
            <option value="war_15">🔴 War 15 Juni 2026</option>
            <option value="war_22">🟡 War 22 Juni 2026</option>
            <option value="jogja">🟣 Yogyakarta Tour</option>
            <option value="sby">🟢 Surabaya Tour</option>
            <option value="passion">🟠 Team Passion</option>
            <option value="love">💗 Team Love</option>
            <option value="dream">🔵 Team Dream</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▼</span>
        </div>
      </div>

      {/* Assigned To Dropdown */}
      <div className="w-full">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 pl-1">Pilih Admin PJ</label>
        <div className="relative">
          <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
          <select
            value={filterAssignedTo}
            onChange={(e) => onAssignedToChange(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 bg-[#0a0e17] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer text-sm font-semibold"
          >
            <option value="">Semua Admin</option>
            {adminsList.map((a) => (
              <option key={a.id} value={a.id}>
                {a.full_name || a.email}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▼</span>
        </div>
      </div>

      {/* Type Dropdown */}
      <div className="w-full">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 pl-1">Pilih Tipe Joki</label>
        <div className="relative">
          <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
          <select
            value={filterOrderType}
            onChange={(e) => onOrderTypeChange(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 bg-[#0a0e17] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer text-sm font-semibold"
          >
            <option value="">Semua Tipe</option>
            <option value="vc">📹 Video Call</option>
            <option value="twoshot">📸 Two Shot</option>
            <option value="mng">🤝 Meet & Greet</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▼</span>
        </div>
      </div>

      {/* Status Dropdown */}
      <div className="w-full">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 pl-1">Status Pesanan</label>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 bg-[#0a0e17] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer text-sm font-semibold"
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▼</span>
        </div>
      </div>

    </div>
  );
}