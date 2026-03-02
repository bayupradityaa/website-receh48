import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { formatCurrency } from '../../../../lib/utils';

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#1A1F2E] border border-gray-700 rounded-xl px-4 py-3 shadow-2xl text-sm">
            <p className="font-semibold text-white mb-2">{label}</p>
            {payload.map((p) => (
                <div key={p.dataKey} className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.fill }} />
                    <span className="text-gray-400">{p.name}:</span>
                    <span className="font-medium text-white">
                        {p.dataKey === 'revenue' ? formatCurrency(p.value) : p.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function RecapChart({ rows, loading }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center h-56 text-gray-500 text-sm">
                Memuat chart...
            </div>
        );
    }

    if (!rows || rows.length === 0) {
        return (
            <div className="flex items-center justify-center h-56 text-gray-500 text-sm">
                Belum ada data chart.
            </div>
        );
    }

    // Shorten label for x-axis
    const chartData = rows.map((r) => ({
        ...r,
        label: r.monthLabel.split(' ')[0].slice(0, 3) + ' ' + r.monthLabel.split(' ')[1],
    }));

    return (
        <div className="space-y-6">
            {/* Revenue Bar Chart */}
            <div>
                <p className="text-sm font-semibold text-gray-300 mb-3">📈 Pendapatan per Bulan</p>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E2433" />
                        <XAxis dataKey="label" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis
                            tick={{ fill: '#9CA3AF', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="revenue" name="Pendapatan" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Orders by status Bar Chart */}
            <div>
                <p className="text-sm font-semibold text-gray-300 mb-3">📦 Pesanan per Status</p>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E2433" />
                        <XAxis dataKey="label" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }} />
                        <Bar dataKey="done" name="Selesai" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="pending" name="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="cancelled" name="Dibatalkan" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
