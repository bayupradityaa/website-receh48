import { useState } from 'react';
import { X } from 'lucide-react';

const MONTHS = [
    { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' }, { value: 4, label: 'April' },
    { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' }, { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' }, { value: 12, label: 'Desember' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

const FIELDS = [
    { key: 'total_orders', label: 'Total Pesanan' },
    { key: 'total_revenue', label: 'Total Pendapatan (IDR)' },
    { key: 'total_done', label: 'Pesanan Selesai' },
    { key: 'total_pending', label: 'Pesanan Pending' },
    { key: 'total_cancelled', label: 'Pesanan Dibatalkan' },
];

export default function RecapFormModal({ initial, saving, onSave, onClose }) {
    const [form, setForm] = useState({
        id: initial?.id || null,
        year: initial?.year || CURRENT_YEAR,
        month: initial?.month || new Date().getMonth() + 1,
        total_orders: initial?.total_orders || 0,
        total_revenue: initial?.total_revenue || 0,
        total_done: initial?.total_done || 0,
        total_pending: initial?.total_pending || 0,
        total_cancelled: initial?.total_cancelled || 0,
        notes: initial?.notes || '',
    });

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#12161F] border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                    <h3 className="text-base font-bold text-white">
                        {initial ? 'Edit Rekap' : 'Tambah Rekap'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Year + Month */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Tahun</label>
                            <select
                                value={form.year}
                                onChange={e => set('year', Number(e.target.value))}
                                className="w-full px-3 py-2 bg-[#1A1F2E] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                            >
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Bulan</label>
                            <select
                                value={form.month}
                                onChange={e => set('month', Number(e.target.value))}
                                className="w-full px-3 py-2 bg-[#1A1F2E] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                            >
                                {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Numeric fields */}
                    {FIELDS.map(({ key, label }) => (
                        <div key={key}>
                            <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                            <input
                                type="number"
                                min={0}
                                value={form[key]}
                                onChange={e => set(key, e.target.value)}
                                className="w-full px-3 py-2 bg-[#1A1F2E] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                            />
                        </div>
                    ))}

                    {/* Notes */}
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Catatan (opsional)</label>
                        <textarea
                            rows={3}
                            value={form.notes}
                            onChange={e => set('notes', e.target.value)}
                            placeholder="Catatan tambahan untuk bulan ini..."
                            className="w-full px-3 py-2 bg-[#1A1F2E] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-gray-800 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white bg-[#1A1F2E] hover:bg-[#252B3B] border border-gray-700 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={() => onSave(form)}
                        disabled={saving}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-amber-600 hover:bg-amber-500 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </div>
        </div>
    );
}