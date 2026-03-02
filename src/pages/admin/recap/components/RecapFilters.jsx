const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

export default function RecapFilters({ filters, onChange }) {
    return (
        <div className="flex flex-wrap gap-3 mb-6">
            {/* Year */}
            <div className="relative">
                <select
                    value={filters.year}
                    onChange={(e) => onChange({ ...filters, year: Number(e.target.value) })}
                    className="pl-4 pr-10 py-2.5 bg-[#12161F] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 appearance-none cursor-pointer"
                >
                    {YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▼</span>
            </div>

            {/* Month */}
            <div className="relative">
                <select
                    value={filters.month}
                    onChange={(e) => onChange({ ...filters, month: e.target.value })}
                    className="pl-4 pr-10 py-2.5 bg-[#12161F] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 appearance-none cursor-pointer"
                >
                    <option value="">Semua Bulan</option>
                    {MONTHS.map((m, i) => (
                        <option key={i + 1} value={i + 1}>{m}</option>
                    ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▼</span>
            </div>
        </div>
    );
}
