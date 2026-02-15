import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../contexts/ToastContext';
import OrdersTable from './components/OrdersTable';
import OrderDetailModal from './components/OrderDetailModal';
import OrderFilters from './components/OrderFilters';
import ConfirmDeleteModal from '../shared/ConfirmDeleteModal';

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

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const allSelected = useMemo(() => {
    if (filteredOrders.length === 0) return false;
    return filteredOrders.every((o) => selectedIds.has(o.id));
  }, [filteredOrders, selectedIds]);

  // reset selection kalau filter berubah
  useEffect(() => {
    setSelectedIds(new Set());
  }, [searchTerm, statusFilter, typeFilter]);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      if (error) throw error;
      showToast('Status berhasil diupdate', 'success');
      await fetchOrders();
      window.dispatchEvent(new CustomEvent('refreshDashboardStats'));
      return true;
    } catch (err) {
      console.error('Error updating status:', err);
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
      console.error('Error saving meta:', err);
      showToast('Gagal menyimpan data', 'error');
      return false;
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const shouldSelectAll = !filteredOrders.every((o) => next.has(o.id));
      if (shouldSelectAll) filteredOrders.forEach((o) => next.add(o.id));
      else filteredOrders.forEach((o) => next.delete(o.id));
      return next;
    });
  };

  const handleAskDelete = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    setDeleteTarget(order || { id: orderId });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      setDeleting(true);
      const { error } = await supabase.from('orders').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      showToast('Pesanan berhasil dihapus', 'success');
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(deleteTarget.id); return next; });
      if (selectedOrder?.id === deleteTarget.id) { setIsDetailOpen(false); setSelectedOrder(null); }
      setDeleteTarget(null);
      await fetchOrders();
      window.dispatchEvent(new CustomEvent('refreshDashboardStats'));
    } catch (err) {
      console.error('Error deleting order:', err);
      showToast('Gagal menghapus pesanan', 'error');
    } finally {
      setDeleting(false);
    }
  };

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
      {/* Filters */}
      <OrderFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={statusFilter}
        onFilterChange={setStatusFilter}
        filterOrderType={typeFilter}
        onOrderTypeChange={setTypeFilter}
        onRefresh={fetchOrders}
      />

      {/* Results Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-400">
        <p>
          Menampilkan <span className="font-semibold text-white">{filteredOrders.length}</span> dari{' '}
          <span className="font-semibold text-white">{orders.length}</span> pesanan
        </p>
        {selectedIds.size > 0 && (
          <p className="text-primary-400 font-medium">{selectedIds.size} pesanan dipilih</p>
        )}
      </div>

      {/* Table */}
      <OrdersTable
        orders={filteredOrders}
        onOrderClick={handleOrderClick}
        selectedIds={selectedIds}
        allSelected={allSelected}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onDeleteOrder={handleAskDelete}
      />

      {/* Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdateStatus={handleUpdateStatus}
        onSaveMeta={handleSaveMeta}
      />

      {/* Confirm Delete Modal */}
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