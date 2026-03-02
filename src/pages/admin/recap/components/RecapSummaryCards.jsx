import { formatCurrency } from '../../../../lib/utils';
import { ShoppingCart, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { LoadingSpinner } from '../../../../components/shared/LoadingSpinner';

const CARDS = [
    { key: 'total_orders', label: 'Total Pesanan', icon: ShoppingCart, color: 'blue' },
    { key: 'total_revenue', label: 'Total Pendapatan', icon: DollarSign, color: 'green' },
    { key: 'total_done', label: 'Pesanan Selesai', icon: CheckCircle, color: 'emerald' },
    { key: 'total_cancelled', label: 'Pesanan Dibatalkan', icon: XCircle, color: 'red' },
];

const COLOR_MAP = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
};

function StatCard({ label, value, icon: Icon, color, isLoading }) {
    return (
        <div className="bg-[#12161F] rounded-xl border border-gray-800 p-4 sm:p-5 hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-400 mb-1.5 leading-snug">{label}</p>
                    {isLoading ? (
                        <div className="h-7 flex items-center"><LoadingSpinner size="sm" /></div>
                    ) : (
                        <p className="text-lg sm:text-2xl font-bold text-white leading-tight">{value}</p>
                    )}
                </div>
                <div className={`flex-shrink-0 border rounded-lg p-2 sm:p-3 ${COLOR_MAP[color]}`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
            </div>
        </div>
    );
}

/**
 * Derives totals from the provided recaps array (aggregates all rows
 * matching the current filter context — the parent passes filtered rows).
 */
export default function RecapSummaryCards({ recaps = [], loading }) {
    const totals = recaps.reduce((acc, r) => ({
        total_orders: acc.total_orders + (r.total_orders || 0),
        total_revenue: acc.total_revenue + (r.total_revenue || 0),
        total_done: acc.total_done + (r.total_done || 0),
        total_cancelled: acc.total_cancelled + (r.total_cancelled || 0),
    }), { total_orders: 0, total_revenue: 0, total_done: 0, total_cancelled: 0 });

    const formatVal = (key, val) =>
        key === 'total_revenue' ? formatCurrency(val) : val;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {CARDS.map(({ key, label, icon, color }) => (
                <StatCard
                    key={key}
                    label={label}
                    value={formatVal(key, totals[key])}
                    icon={icon}
                    color={color}
                    isLoading={loading}
                />
            ))}
        </div>
    );
}
