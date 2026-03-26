import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useToast } from '../../../../contexts/ToastContext';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import MembersTable from './MembersTable';
import MemberModal from './MemberModal';
import MembersStats from './MembersStats';
import { Plus, RefreshCw } from 'lucide-react';

// ─── Konstanta bucket Supabase Storage ───────────────────────────────────────
const STORAGE_BUCKET = 'member-photos';

function normalizeToArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === 'object') return [value];
  return [];
}

function getFeeGroupByType(member, type) {
  const fees = normalizeToArray(member?.member_fees);
  const item = fees.find((x) => x?.fee_type === type);
  return item?.fee_groups || null;
}

/**
 * Upload foto ke Supabase Storage dan kembalikan public URL-nya.
 */
async function uploadMemberPhoto(file, oldPhotoUrl = null) {
  if (oldPhotoUrl) {
    try {
      const url = new URL(oldPhotoUrl);
      const marker = `/object/public/${STORAGE_BUCKET}/`;
      const idx = url.pathname.indexOf(marker);
      if (idx !== -1) {
        const oldPath = decodeURIComponent(url.pathname.slice(idx + marker.length));
        await supabase.storage.from(STORAGE_BUCKET).remove([oldPath]);
      }
    } catch {
      // Lanjut saja jika gagal hapus
    }
  }

  const ext = file.name.split('.').pop();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `members/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

export default function MembersTab() {
  const [members, setMembers] = useState([]);
  const [feeGroups, setFeeGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [feeGroupFilter, setFeeGroupFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
    const cleanup = setupRealtimeSubscription();
    return () => cleanup?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setupRealtimeSubscription() {
    const channel = supabase
      .channel('members-realtime-v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => fetchMembers())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'member_fees' }, () => fetchMembers())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fee_groups' }, () => {
        fetchFeeGroups();
        fetchMembers();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  async function fetchData() {
    await Promise.all([fetchMembers(), fetchFeeGroups()]);
  }

  async function fetchMembers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select(
          `*,
          member_fees (
            id,
            fee_type,
            fee_group_id,
            fee_groups (
              id, name, fee, description, fee_type, is_active
            )
          )`
        )
        .order('name', { ascending: true });

      if (error) throw error;

      setMembers(
        (data || []).map((m) => ({
          ...m,
          full_slots: m.full_slots || [], // Pastikan full_slots selalu array
          member_fees: Array.isArray(m.member_fees)
            ? m.member_fees
            : m.member_fees
              ? [m.member_fees]
              : [],
        }))
      );
    } catch (err) {
      console.error('Error fetching members:', err);
      showToast('Gagal memuat data member', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchFeeGroups() {
    try {
      const { data, error } = await supabase
        .from('fee_groups')
        .select('*')
        .order('fee', { ascending: false });
      if (error) throw error;
      setFeeGroups(data || []);
    } catch (err) {
      console.error('Error fetching fee groups:', err);
    }
  }

  // ─── FUNGSI TOGGLE FULL SLOT ──────────────────────────────────────────────
  const handleToggleFullSlot = async (memberId, serviceType, currentlyFull) => {
    try {
      // Ambil data member saat ini
      const { data: memberData, error: fetchError } = await supabase
        .from('members')
        .select('full_slots')
        .eq('id', memberId)
        .single();

      if (fetchError) throw fetchError;

      const currentSlots = Array.isArray(memberData?.full_slots) ? memberData.full_slots : [];

      // Toggle: hapus jika sudah ada, tambah jika belum
      const updatedSlots = currentlyFull
        ? currentSlots.filter((s) => s !== serviceType)
        : [...new Set([...currentSlots, serviceType])];

      const { error: updateError } = await supabase
        .from('members')
        .update({ full_slots: updatedSlots })
        .eq('id', memberId);

      if (updateError) throw updateError;

      // Update state lokal
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId ? { ...m, full_slots: updatedSlots } : m
        )
      );

      const konfigurasi = { vc: 'VC', twoshot: 'TwoShot', mng: 'Meet & Greet' };
      showToast(
        currentlyFull
          ? `Slot ${konfigurasi[serviceType]} dibuka kembali`
          : `${konfigurasi[serviceType]} ditandai full slot`,
        currentlyFull ? 'success' : 'info'
      );
    } catch (err) {
      console.error('Error toggling full slot:', err);
      showToast('Gagal update full slot: ' + (err?.message || 'unknown'), 'error');
    }
  };
  // ──────────────────────────────────────────────────────────────────────────

  async function handleSaveMember(payload) {
    try {
      const {
        fee_group_vc_id,
        fee_group_twoshot_id,
        fee_group_mng_id,
        photo_file,
        photo_url,
        ...rest
      } = payload;

      let finalPhotoUrl = photo_url ?? null;

      if (photo_file) {
        try {
          const oldUrl = editingMember?.photo_url ?? null;
          finalPhotoUrl = await uploadMemberPhoto(photo_file, oldUrl);
        } catch (uploadErr) {
          console.error('Upload foto gagal:', uploadErr);
          showToast('Gagal upload foto: ' + uploadErr.message, 'error');
          return false;
        }
      }

      const memberData = { ...rest, photo_url: finalPhotoUrl };
      let memberId = editingMember?.id;

      if (editingMember) {
        const { error } = await supabase
          .from('members')
          .update(memberData)
          .eq('id', editingMember.id);
        if (error) throw error;
        showToast('Member berhasil diupdate', 'success');
      } else {
        const { data: inserted, error } = await supabase
          .from('members')
          .insert([memberData])
          .select('id')
          .single();
        if (error) throw error;
        memberId = inserted?.id;
        showToast('Member berhasil ditambahkan', 'success');
      }

      if (!memberId) throw new Error('Member ID tidak ditemukan setelah simpan');

      // Upsert member_fees
      const rows = [];
      if (fee_group_vc_id) rows.push({ member_id: memberId, fee_type: 'vc', fee_group_id: fee_group_vc_id });
      if (fee_group_twoshot_id) rows.push({ member_id: memberId, fee_type: 'twoshot', fee_group_id: fee_group_twoshot_id });
      if (fee_group_mng_id) rows.push({ member_id: memberId, fee_type: 'mng', fee_group_id: fee_group_mng_id });

      if (rows.length > 0) {
        const { error: upsertError } = await supabase
          .from('member_fees')
          .upsert(rows, { onConflict: 'member_id,fee_type' });
        if (upsertError) throw upsertError;
      }

      setIsModalOpen(false);
      setEditingMember(null);
      await fetchMembers();
      return true;
    } catch (err) {
      console.error('Error saving member:', err);
      showToast('Gagal menyimpan member: ' + err.message, 'error');
      return false;
    }
  }

  async function handleDeleteMember(id) {
    try {
      const member = members.find((m) => m.id === id);
      if (member?.photo_url) {
        try {
          const url = new URL(member.photo_url);
          const marker = `/object/public/${STORAGE_BUCKET}/`;
          const idx = url.pathname.indexOf(marker);
          if (idx !== -1) {
            const path = decodeURIComponent(url.pathname.slice(idx + marker.length));
            await supabase.storage.from(STORAGE_BUCKET).remove([path]);
          }
        } catch {
          // Foto gagal dihapus dari storage — lanjut hapus record saja
        }
      }

      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) throw error;
      showToast('Member berhasil dihapus', 'success');
      await fetchMembers();
    } catch (err) {
      console.error('Error deleting member:', err);
      showToast('Gagal menghapus member', 'error');
    }
  }

  async function handleToggleActive(id, currentStatus) {
    try {
      const { error } = await supabase
        .from('members')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      showToast(`Member ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`, 'success');
      await fetchMembers();
    } catch (err) {
      console.error('Error toggling active:', err);
      showToast('Gagal mengubah status', 'error');
    }
  }

  async function handleBulkActivate() {
    if (selectedIds.size === 0) return showToast('Pilih member terlebih dahulu', 'warning');
    try {
      const { error } = await supabase
        .from('members')
        .update({ is_active: true })
        .in('id', Array.from(selectedIds));
      if (error) throw error;
      showToast(`${selectedIds.size} member berhasil diaktifkan`, 'success');
      setSelectedIds(new Set());
      await fetchMembers();
    } catch (err) {
      console.error('Error bulk activate:', err);
      showToast('Gagal mengaktifkan member', 'error');
    }
  }

  async function handleBulkDeactivate() {
    if (selectedIds.size === 0) return showToast('Pilih member terlebih dahulu', 'warning');
    try {
      const { error } = await supabase
        .from('members')
        .update({ is_active: false })
        .in('id', Array.from(selectedIds));
      if (error) throw error;
      showToast(`${selectedIds.size} member berhasil dinonaktifkan`, 'success');
      setSelectedIds(new Set());
      await fetchMembers();
    } catch (err) {
      console.error('Error bulk deactivate:', err);
      showToast('Gagal menonaktifkan member', 'error');
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return showToast('Pilih member terlebih dahulu', 'warning');
    try {
      const { error } = await supabase.from('members').delete().in('id', Array.from(selectedIds));
      if (error) throw error;
      showToast(`${selectedIds.size} member berhasil dihapus`, 'success');
      setSelectedIds(new Set());
      await fetchMembers();
    } catch (err) {
      console.error('Error bulk delete:', err);
      showToast('Gagal menghapus member', 'error');
    }
  }

  function handleEditMember(member) {
    setEditingMember(member);
    setIsModalOpen(true);
  }

  function handleAddMember() {
    setEditingMember(null);
    setIsModalOpen(true);
  }

  function handleToggleSelect(id) {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  }

  // fee groups per type
  const vcFeeGroups = useMemo(() => feeGroups.filter((g) => (g.fee_type || 'vc') === 'vc'), [feeGroups]);
  const twoshotFeeGroups = useMemo(() => feeGroups.filter((g) => g.fee_type === 'twoshot'), [feeGroups]);
  const mngFeeGroups = useMemo(() => feeGroups.filter((g) => g.fee_type === 'mng'), [feeGroups]);

  // filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && member.is_active) ||
        (statusFilter === 'inactive' && !member.is_active);

      let matchFeeGroup = true;
      if (feeGroupFilter !== 'all') {
        const [type, groupId] = feeGroupFilter.split(':');
        const fg = getFeeGroupByType(member, type);
        matchFeeGroup = fg?.id === groupId;
      }

      return matchSearch && matchStatus && matchFeeGroup;
    });
  }, [members, searchTerm, statusFilter, feeGroupFilter]);

  function handleToggleSelectAll() {
    if (filteredMembers.length === 0) return;
    if (selectedIds.size === filteredMembers.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredMembers.map((m) => m.id)));
  }

  // stats
  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter((m) => m.is_active).length;
    const inactive = total - active;

    const vcRevenuePotential = members.reduce((sum, m) => {
      return sum + (getFeeGroupByType(m, 'vc')?.fee || 0);
    }, 0);

    const twoshotRevenuePotential = members.reduce((sum, m) => {
      return sum + (getFeeGroupByType(m, 'twoshot')?.fee || 0);
    }, 0);

    const mngRevenuePotential = members.reduce((sum, m) => {
      return sum + (getFeeGroupByType(m, 'mng')?.fee || 0);
    }, 0);

    return { total, active, inactive, vcRevenuePotential, twoshotRevenuePotential, mngRevenuePotential };
  }, [members]);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <MembersStats stats={stats} />

      {/* Actions & Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="🔍 Cari nama member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#0A0E17] border border-gray-800 text-white placeholder:text-gray-500"
          />
        </div>

        {/* Filter Fee Group */}
        <select
          value={feeGroupFilter}
          onChange={(e) => setFeeGroupFilter(e.target.value)}
          className="px-4 py-2 border border-gray-800 rounded-lg bg-[#0A0E17] text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        >
          <option value="all">Semua Fee Group</option>

          {vcFeeGroups.length > 0 && (
            <optgroup label="Video Call (VC)">
              {vcFeeGroups.map((fg) => (
                <option key={fg.id} value={`vc:${fg.id}`}>
                  {fg.name} — Rp {Number(fg.fee || 0).toLocaleString('id-ID')}
                </option>
              ))}
            </optgroup>
          )}

          {twoshotFeeGroups.length > 0 && (
            <optgroup label="TwoShot">
              {twoshotFeeGroups.map((fg) => (
                <option key={fg.id} value={`twoshot:${fg.id}`}>
                  {fg.name} — Rp {Number(fg.fee || 0).toLocaleString('id-ID')}
                </option>
              ))}
            </optgroup>
          )}

          {mngFeeGroups.length > 0 && (
            <optgroup label="Meet &amp; Greet (MnG)">
              {mngFeeGroups.map((fg) => (
                <option key={fg.id} value={`mng:${fg.id}`}>
                  {fg.name} — Rp {Number(fg.fee || 0).toLocaleString('id-ID')}
                </option>
              ))}
            </optgroup>
          )}
        </select>

        {/* Filter Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-800 rounded-lg bg-[#0A0E17] text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        >
          <option value="all">Semua Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <Button
          onClick={fetchMembers}
          variant="outline"
          size="sm"
          className="border-gray-800 text-gray-200 hover:bg-white/5"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>

        <Button
          onClick={handleAddMember}
          variant="primary"
          size="sm"
          className="bg-amber-500 text-black hover:bg-amber-400"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Member
        </Button>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-amber-200">{selectedIds.size} member dipilih</span>
          <div className="flex gap-2">
            <Button
              onClick={handleBulkActivate}
              variant="secondary"
              size="sm"
              className="bg-green-500/15 text-green-200 border border-green-500/30 hover:bg-green-500/25"
            >
              Aktifkan
            </Button>
            <Button
              onClick={handleBulkDeactivate}
              variant="outline"
              size="sm"
              className="border-gray-800 text-gray-200 hover:bg-white/5"
            >
              Nonaktifkan
            </Button>
            <Button
              onClick={handleBulkDelete}
              variant="destructive"
              size="sm"
              className="bg-red-500/15 text-red-200 border border-red-500/30 hover:bg-red-500/25"
            >
              Hapus
            </Button>
          </div>
        </div>
      )}

      {/* Table - Tambahkan prop onToggleFullSlot */}
      <MembersTable
        members={filteredMembers}
        selectedIds={selectedIds}
        allSelected={selectedIds.size === filteredMembers.length && filteredMembers.length > 0}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onEdit={handleEditMember}
        onDelete={handleDeleteMember}
        onToggleActive={handleToggleActive}
        onToggleFullSlot={handleToggleFullSlot}  // <── Tambahkan ini
      />

      {/* Modal */}
      <MemberModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        member={editingMember}
        feeGroups={feeGroups}
      />
    </div>
  );
}