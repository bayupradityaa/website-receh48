import { useState } from 'react';
import { useRecap } from './hooks/useRecap';
import RecapFilters from './components/RecapFilters';
import RecapSummaryCards from './components/RecapSummaryCards';
import RecapTable from './components/RecapTable';
import RecapChart from './components/RecapChart';
import { Download, RefreshCw, Plus } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';
import RecapFormModal from './components/RecapFormModal';
import ConfirmDeleteModal from '../shared/ConfirmDeleteModal';

const MONTHS = [
    '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const CURRENT_YEAR = new Date().getFullYear();

function exportCSV(rows) {
    if (!rows?.length) return;
    const headers = ['Bulan', 'Total', 'Pending', 'Selesai', 'Dibatalkan', 'Pendapatan (IDR)'];
    const esc = (v) => {
        const s = String(v ?? '').replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const rowsCsv = rows.map(r => [
        esc(`${MONTHS[r.month]} ${r.year}`),
        r.total_orders || 0,
        r.total_pending || 0,
        r.total_done || 0,
        r.total_cancelled || 0,
        r.total_revenue || 0,
    ].join(','));
    const csv = [headers.join(','), ...rowsCsv].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

export default function RecapManagement() {
    const { recaps, loading, error, saving, fetchRecaps, saveRecap, deleteRecap } = useRecap();

    const [filters, setFilters] = useState({ year: CURRENT_YEAR, month: '' });
    const [editTarget, setEditTarget] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const filteredRecaps = recaps.filter(r => {
        if (filters.year && r.year !== Number(filters.year)) return false;
        if (filters.month && r.month !== Number(filters.month)) return false;
        return true;
    });

    const chartRows = filteredRecaps.map(r => ({
        ...r,
        monthLabel: `${MONTHS[r.month]} ${r.year}`,
        revenue: r.total_revenue || 0,
        done: r.total_done || 0,
        pending: r.total_pending || 0,
        cancelled: r.total_cancelled || 0,
    })).reverse();

    function handleEdit(row) {
        setEditTarget(row);
        setShowForm(true);
    }

    function handleAdd() {
        setEditTarget(null);
        setShowForm(true);
    }

    async function handleSave(formData) {
        const ok = await saveRecap(formData);
        if (ok) setShowForm(false);
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        const ok = await deleteRecap(deleteTarget.id);
        if (ok) setDeleteTarget(null);
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-white">Rekapan</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Ringkasan pesanan &amp; pendapatan berdasarkan periode
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchRecaps}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[#1A1F2E] hover:bg-[#252B3B] border border-gray-700 text-white transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>

                    <button
                        onClick={() => exportCSV(filteredRecaps)}
                        disabled={!filteredRecaps.length}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[#1A1F2E] hover:bg-[#252B3B] border border-gray-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>

                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Rekap
                    </button>
                </div>
            </div>

            {/* Filters */}
            <RecapFilters filters={filters} onChange={setFilters} />

            {/* Error */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Summary Cards */}
            <RecapSummaryCards recaps={filteredRecaps} loading={loading} />

            {/* Chart */}
            <div className="bg-[#12161F] rounded-xl border border-gray-800 p-4 sm:p-6">
                <RecapChart rows={chartRows} loading={loading} />
            </div>

            {/* Table */}
            <div className="bg-[#12161F] rounded-xl border border-gray-800 p-4 sm:p-6">
                <p className="text-sm font-semibold text-gray-300 mb-4">Detail per Bulan</p>
                <RecapTable
                    rows={filteredRecaps}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={setDeleteTarget}
                />
            </div>

            {/* Form Modal */}
            {showForm && (
                <RecapFormModal
                    initial={editTarget}
                    saving={saving}
                    onSave={handleSave}
                    onClose={() => setShowForm(false)}
                />
            )}

            {/* ✅ FIX: pakai isOpen + onClose + description sesuai props ConfirmDeleteModal */}
            <ConfirmDeleteModal
                isOpen={!!deleteTarget}
                onClose={() => saving ? null : setDeleteTarget(null)}
                title="Hapus Rekap"
                description={
                    deleteTarget
                        ? `Rekap ${MONTHS[deleteTarget.month]} ${deleteTarget.year} akan dihapus permanen.`
                        : 'Data akan dihapus permanen.'
                }
                confirmText="Ya, hapus"
                cancelText="Batal"
                isLoading={saving}
                onConfirm={handleDelete}
            />
        </div>
    );
}