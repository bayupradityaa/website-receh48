import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../contexts/ToastContext';
import OrdersTable from './components/OrdersTable';
import OrderDetailModal from './components/OrderDetailModal';
import OrderFilters from './components/OrderFilters';
import ConfirmDeleteModal from '../shared/ConfirmDeleteModal';
import PaymentEmailModal from './components/PaymentEmailModal';
import { Download } from 'lucide-react';

// ─── CSV EXPORT ───────────────────────────────────────────────────────────────
const ORDER_TYPE_LABEL = { vc: 'VC', twoshot: '2Shot', mng: 'MnG' };
const STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function exportToCSV(orders, filename = 'orders.csv') {
  if (!orders.length) return;

  const headers = [
    'ID',
    'Tipe Order',
    'Nama Customer',
    'Email',
    'Status',
    'Total Fee (IDR)',
    'Dikerjakan Oleh',
    'Note',
  ];

  const esc = (val) => {
    if (val == null) return '';
    const str = String(val).replace(/"/g, '""');
    return /[",\n]/.test(str) ? `"${str}"` : str;
  };

  const rows = orders.map((o) => [
    esc(o.id),
    esc(ORDER_TYPE_LABEL[o.order_type] ?? o.order_type ?? 'VC'),
    esc(o.customer_name),
    esc(o.contact_email),
    esc(STATUS_LABEL[o.status] ?? o.status),
    esc(o.total_fee ?? 0),
    esc(o.handled_by),
    esc(o.note),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  // BOM (\uFEFF) supaya Excel auto-detect UTF-8
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
// ─────────────────────────────────────────────────────────────────────────────

export default function OrdersManagement() {
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [emailTarget, setEmailTarget] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      showToast('Gagal memuat data pesanan', 'error');
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = useMemo(() => {
    return (orders || []).filter((order) => {
      const s = searchTerm.toLowerCase();
      const matchSearch =
        !s ||
        order.customer_name?.toLowerCase().includes(s) ||
        order.contact_email?.toLowerCase().includes(s) ||
        order.id?.toLowerCase().includes(s);
      const matchStatus = !statusFilter || order.status === statusFilter;
      const matchType = !typeFilter || (order.order_type || 'vc') === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [orders, searchTerm, statusFilter, typeFilter]);

  const allSelected = useMemo(
    () => filteredOrders.length > 0 && filteredOrders.every((o) => selectedIds.has(o.id)),
    [filteredOrders, selectedIds]
  );

  useEffect(() => { setSelectedIds(new Set()); }, [searchTerm, statusFilter, typeFilter]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleOrderClick = (order) => { setSelectedOrder(order); setIsDetailOpen(true); };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      showToast('Status berhasil diupdate', 'success');
      await fetchOrders();
      window.dispatchEvent(new CustomEvent('refreshDashboardStats'));
      return true;
    } catch (err) {
      console.error(err);
      showToast('Gagal update status', 'error');
      return false;
    }
  };

  const handleSaveMeta = async (orderId, totalFee, handledBy) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ total_fee: totalFee, handled_by: handledBy })
        .eq('id', orderId);
      if (error) throw error;
      showToast('Data berhasil disimpan', 'success');
      await fetchOrders();
      window.dispatchEvent(new CustomEvent('refreshDashboardStats'));
      return true;
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan data', 'error');
      return false;
    }
  };

  const handleToggleSelect = (id) =>
    setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleToggleSelectAll = () =>
    setSelectedIds((prev) => {
      const n = new Set(prev);
      const selectAll = !filteredOrders.every((o) => n.has(o.id));
      filteredOrders.forEach((o) => (selectAll ? n.add(o.id) : n.delete(o.id)));
      return n;
    });

  const handleAskDelete = (orderId) =>
    setDeleteTarget(orders.find((o) => o.id === orderId) || { id: orderId });

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      setDeleting(true);
      const { error } = await supabase.from('orders').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      showToast('Pesanan berhasil dihapus', 'success');
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(deleteTarget.id); return n; });
      if (selectedOrder?.id === deleteTarget.id) { setIsDetailOpen(false); setSelectedOrder(null); }
      setDeleteTarget(null);
      await fetchOrders();
      window.dispatchEvent(new CustomEvent('refreshDashboardStats'));
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus pesanan', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // ── Export CSV ───────────────────────────────────────────────────────────────
  const handleExportCSV = (exportAll = false) => {
    const data = exportAll ? orders : filteredOrders;
    if (!data.length) { showToast('Tidak ada data untuk diexport', 'warning'); return; }
    const ts = new Date().toISOString().slice(0, 10);
    exportToCSV(data, exportAll ? `orders-semua-${ts}.csv` : `orders-terfilter-${ts}.csv`);
    showToast(`Berhasil export ${data.length} pesanan ke CSV`, 'success');
  };

  // ── Email ────────────────────────────────────────────────────────────────────
  const handleOpenEmailModal = (order) => { setEmailTarget(order); setIsEmailModalOpen(true); };
  const handleCloseEmailModal = () => { setIsEmailModalOpen(false); setEmailTarget(null); };

  // ── Render ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
        <p className="mt-4 text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrderFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={statusFilter}
        onFilterChange={setStatusFilter}
        filterOrderType={typeFilter}
        onOrderTypeChange={setTypeFilter}
        onRefresh={fetchOrders}
      />

      {/* Info baris + Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-400">
        <p>
          Menampilkan{' '}
          <span className="font-semibold text-white">{filteredOrders.length}</span> dari{' '}
          <span className="font-semibold text-white">{orders.length}</span> pesanan
        </p>

        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <span className="text-primary-400 font-medium">{selectedIds.size} dipilih</span>
          )}

          {/* Export CSV dropdown */}
          <div className="relative group">
            <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition-colors select-none">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            {/* Dropdown — visible on hover */}
            <div className="absolute right-0 mt-1 w-56 bg-[#1A1F2E] border border-gray-700 rounded-xl shadow-2xl z-20 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 pointer-events-none group-hover:pointer-events-auto">
              <button
                onClick={() => handleExportCSV(false)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-[#252B3B] rounded-t-xl transition-colors"
              >
                Export yang terfilter ({filteredOrders.length})
              </button>
              <div className="border-t border-gray-700" />
              <button
                onClick={() => handleExportCSV(true)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-[#252B3B] rounded-b-xl transition-colors"
              >
                Export semua ({orders.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      <OrdersTable
        orders={filteredOrders}
        onOrderClick={handleOrderClick}
        selectedIds={selectedIds}
        allSelected={allSelected}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onDeleteOrder={handleAskDelete}
        onSendPaymentEmail={handleOpenEmailModal}
      />

      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdateStatus={handleUpdateStatus}
        onSaveMeta={handleSaveMeta}
      />

      <PaymentEmailModal
        order={emailTarget}
        isOpen={isEmailModalOpen}
        onClose={handleCloseEmailModal}
        onSuccess={() => showToast('Email tagihan berhasil dikirim!', 'success')}
        onError={() => showToast('Gagal mengirim email tagihan', 'error')}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => (deleting ? null : setDeleteTarget(null))}
        title="Hapus Pesanan?"
        description={
          deleteTarget
            ? `Pesanan ${deleteTarget.id?.slice?.(0, 8)} atas nama "${deleteTarget.customer_name || '-'}" akan dihapus permanen.`
            : 'Pesanan akan dihapus permanen.'
        }
        confirmText="Ya, hapus pesanan"
        cancelText="Batal"
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}