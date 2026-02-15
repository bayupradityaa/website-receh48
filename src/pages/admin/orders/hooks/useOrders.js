import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useToast } from '../../../../contexts/ToastContext';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterOrderType, setFilterOrderType] = useState(''); // '' | 'vc' | 'twoshot' | 'mng'
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const { showToast } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus) query = query.eq('status', filterStatus);
      if (filterOrderType) query = query.eq('order_type', filterOrderType);

      const { data, error } = await query;
      if (error) throw error;

      const rows = data ?? [];
      setOrders(rows);

      // bersihkan selectedIds yang sudah tidak ada
      const exist = new Set(rows.map((o) => o.id));
      setSelectedIds((prev) => {
        const next = new Set();
        for (const id of prev) if (exist.has(id)) next.add(id);
        return next;
      });
    } catch (err) {
      showToast('Gagal memuat pesanan: ' + (err?.message ?? String(err)), 'error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterOrderType, showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function updateOrderStatus(orderId, newStatus) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      if (error) throw error;
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      showToast('Status pesanan berhasil diupdate', 'success');
      return true;
    } catch (err) {
      showToast('Gagal update status: ' + (err?.message ?? String(err)), 'error');
      return false;
    }
  }

  async function updateOrderMeta(orderId, totalFee, handledBy) {
    try {
      const totalFeeVal = Number(totalFee);
      if (Number.isNaN(totalFeeVal) || totalFeeVal < 0) {
        showToast('Total fee harus angka >= 0', 'error');
        return false;
      }
      const payload = { total_fee: totalFeeVal, handled_by: handledBy?.trim() || null };
      const { error } = await supabase.from('orders').update(payload).eq('id', orderId);
      if (error) throw error;
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...payload } : o)));
      showToast('Total fee & handled_by berhasil disimpan', 'success');
      return true;
    } catch (err) {
      showToast('Gagal menyimpan: ' + (err?.message ?? String(err)), 'error');
      return false;
    }
  }

  const orderIds = useMemo(() => orders.map((o) => o.id), [orders]);

  const allSelected = useMemo(() => {
    if (orders.length === 0) return false;
    return orderIds.every((id) => selectedIds.has(id));
  }, [orders.length, orderIds, selectedIds]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const isAll = orders.length > 0 && orderIds.every((id) => next.has(id));
      if (isAll) for (const id of orderIds) next.delete(id);
      else for (const id of orderIds) next.add(id);
      return next;
    });
  };

  const deleteOrder = async (id) => {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      showToast('Pesanan berhasil dihapus', 'success');
      return true;
    } catch (err) {
      showToast('Gagal hapus pesanan: ' + (err?.message ?? String(err)), 'error');
      return false;
    }
  };

  const deleteOrdersBulk = async (idsSet) => {
    const ids = Array.from(idsSet);
    if (ids.length === 0) return true;
    try {
      const { error } = await supabase.from('orders').delete().in('id', ids);
      if (error) throw error;
      setOrders((prev) => prev.filter((o) => !idsSet.has(o.id)));
      clearSelection();
      showToast(`${ids.length} pesanan berhasil dihapus`, 'success');
      return true;
    } catch (err) {
      showToast('Gagal hapus banyak: ' + (err?.message ?? String(err)), 'error');
      return false;
    }
  };

  // client-side search filter
  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    const lower = searchTerm.toLowerCase();
    return orders.filter(
      (o) =>
        o.customer_name?.toLowerCase().includes(lower) ||
        o.contact_email?.toLowerCase().includes(lower) ||
        o.id?.toLowerCase().includes(lower)
    );
  }, [orders, searchTerm]);

  return {
    orders: filteredOrders,
    loading,
    filterStatus,
    setFilterStatus,
    filterOrderType,
    setFilterOrderType,
    searchTerm,
    setSearchTerm,
    fetchOrders,
    updateOrderStatus,
    updateOrderMeta,
    selectedIds,
    allSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    deleteOrder,
    deleteOrdersBulk,
  };
}