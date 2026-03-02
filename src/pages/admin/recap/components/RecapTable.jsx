import { formatCurrency } from '../../../../lib/utils';
import { Pencil, Trash2 } from 'lucide-react';

const MONTHS = [
    '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export default function RecapTable({ rows, loading, onEdit, onDelete }) {
    if (loading) {
        return (
            <div className="text-center py-10 text-gray-500 text-sm">Memuat data...</div>
        );
    }

    if (!rows || rows.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500 text-sm">
                Belum ada data rekap. Klik <span className="text-amber-400 font-medium">Tambah Rekap</span> untuk menambahkan data bulan ini.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full min-w-[750px] text-sm">
                <thead className="bg-[#1A1F2E]">
                    <tr className="border-b border-gray-800">
                        <th className="px-4 py-3 text-left text-gray-300 font-semibold">Bulan</th>
                        <th className="px-4 py-3 text-center text-gray-300 font-semibold">Total</th>
                        <th className="px-4 py-3 text-center text-gray-300 font-semibold">Pending</th>
                        <th className="px-4 py-3 text-center text-gray-300 font-semibold">Selesai</th>
                        <th className="px-4 py-3 text-center text-gray-300 font-semibold">Dibatalkan</th>
                        <th className="px-4 py-3 text-center text-gray-300 font-semibold">Member Baru</th>
                        <th className="px-4 py-3 text-right text-gray-300 font-semibold">Pendapatan</th>
                        <th className="px-4 py-3 text-center text-gray-300 font-semibold">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {rows.map((row) => (
                        <tr key={row.id} className="hover:bg-[#1A1F2E] transition-colors">
                            <td className="px-4 py-3 font-medium text-white">
                                {MONTHS[row.month]} {row.year}
                                {row.notes && (
                                    <p className="text-xs text-gray-500 font-normal mt-0.5 line-clamp-1">{row.notes}</p>
                                )}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-300">{row.total_orders ?? '—'}</td>
                            <td className="px-4 py-3 text-center">
                                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-medium">
                                    {row.total_pending ?? '—'}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full text-xs font-medium">
                                    {row.total_done ?? '—'}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                                <span className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full text-xs font-medium">
                                    {row.total_cancelled ?? '—'}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-center text-gray-300">{row.new_members ?? '—'}</td>
                            <td className="px-4 py-3 text-right font-semibold text-amber-400">
                                {formatCurrency(row.total_revenue ?? 0)}
                            </td>
                            <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => onEdit?.(row)}
                                        className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                                        title="Edit rekap"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete?.(row)}
                                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Hapus rekap"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>

                {rows.length > 1 && (
                    <tfoot className="border-t-2 border-gray-700 bg-[#1A1F2E]">
                        <tr>
                            <td className="px-4 py-3 font-bold text-white">TOTAL</td>
                            <td className="px-4 py-3 text-center font-bold text-white">{rows.reduce((s, r) => s + (r.total_orders || 0), 0)}</td>
                            <td className="px-4 py-3 text-center font-bold text-yellow-400">{rows.reduce((s, r) => s + (r.total_pending || 0), 0)}</td>
                            <td className="px-4 py-3 text-center font-bold text-green-400">{rows.reduce((s, r) => s + (r.total_done || 0), 0)}</td>
                            <td className="px-4 py-3 text-center font-bold text-red-400">{rows.reduce((s, r) => s + (r.total_cancelled || 0), 0)}</td>
                            <td className="px-4 py-3 text-center font-bold text-gray-300">{rows.reduce((s, r) => s + (r.new_members || 0), 0)}</td>
                            <td className="px-4 py-3 text-right font-bold text-amber-400">{formatCurrency(rows.reduce((s, r) => s + (r.total_revenue || 0), 0))}</td>
                            <td />
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
}
