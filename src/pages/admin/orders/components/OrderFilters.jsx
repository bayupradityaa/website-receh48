import { Search, Video, Filter, RefreshCw } from 'lucide-react';

export default function OrderFilters({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
  filterOrderType,
  onOrderTypeChange,
  onRefresh,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 mb-6">
      {/* Search */}
      <div className="lg:col-span-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Cari nama, email, atau ID..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#12161F] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Type Dropdown */}
      <div className="lg:col-span-3">
        <div className="relative">
          <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <select
            value={filterOrderType}
            onChange={(e) => onOrderTypeChange(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-[#12161F] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="">Semua Tipe</option>
            <option value="vc">📹 Video Call (VC)</option>
            <option value="twoshot">📸 TwoShot (2S)</option>
            <option value="mng">🤝 Meet &amp; Greet (MnG)</option> 
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▼</span>
        </div>
      </div>

      {/* Status Dropdown */}
      <div className="lg:col-span-2">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-[#12161F] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▼</span>
        </div>
      </div>

      {/* Refresh */}
      <div className="lg:col-span-2">
        <button
          type="button"
          onClick={onRefresh}
          className="w-full px-4 py-3 bg-[#12161F] hover:bg-[#1A1F2E] border border-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>
    </div>
  );
}