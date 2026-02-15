import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../../lib/supabase';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { Users, Search, CheckSquare, Square, Loader2 } from 'lucide-react';

export default function AssignMembersModal({ isOpen, onClose, group, onSuccess }) {
  const [allMembers, setAllMembers] = useState([]);
  const [assignedIds, setAssignedIds] = useState(new Set());
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !group?.id) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, group?.id]);

  async function fetchData() {
    try {
      setLoading(true);
      setSearchTerm('');

      // Ambil semua member aktif
      const { data: members, error: mErr } = await supabase
        .from('members')
        .select('id, name, photo_url')
        .eq('is_active', true)
        .order('name', { ascending: true });
      if (mErr) throw mErr;

      // Ambil member yang sudah assign ke fee_type ini (bukan group ini saja)
      const { data: fees, error: fErr } = await supabase
        .from('member_fees')
        .select('member_id, fee_group_id')
        .eq('fee_type', group.fee_type || 'vc');
      if (fErr) throw fErr;

      // Yang sudah di group ini
      const alreadyInThisGroup = new Set(
        (fees || []).filter((f) => f.fee_group_id === group.id).map((f) => f.member_id)
      );

      setAllMembers(members || []);
      setAssignedIds(alreadyInThisGroup);
      setSelectedIds(new Set(alreadyInThisGroup)); // pre-select yang sudah masuk
    } catch (err) {
      console.error('Error fetching assign data:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredMembers = useMemo(() => {
    return allMembers.filter((m) =>
      m.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allMembers, searchTerm]);

  function toggleMember(id) {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  }

  function toggleAll() {
    const visibleIds = filteredMembers.map((m) => m.id);
    const allSelected = visibleIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const s = new Set(prev);
      if (allSelected) visibleIds.forEach((id) => s.delete(id));
      else visibleIds.forEach((id) => s.add(id));
      return s;
    });
  }

  async function handleSave() {
    if (!group?.id) return;
    try {
      setSaving(true);

      const feeType = group.fee_type || 'vc';

      // Member yang baru ditambahkan (sebelumnya tidak ada)
      const toAdd = [...selectedIds].filter((id) => !assignedIds.has(id));

      // Member yang dihapus dari group ini (sebelumnya ada, sekarang tidak dipilih)
      const toRemove = [...assignedIds].filter((id) => !selectedIds.has(id));

      // Upsert member baru
      if (toAdd.length > 0) {
        const rows = toAdd.map((memberId) => ({
          member_id: memberId,
          fee_type: feeType,
          fee_group_id: group.id,
        }));
        const { error } = await supabase
          .from('member_fees')
          .upsert(rows, { onConflict: 'member_id,fee_type' });
        if (error) throw error;
      }

      // Hapus member yang di-uncheck
      if (toRemove.length > 0) {
        const { error } = await supabase
          .from('member_fees')
          .delete()
          .eq('fee_group_id', group.id)
          .in('member_id', toRemove);
        if (error) throw error;
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error saving assignments:', err);
    } finally {
      setSaving(false);
    }
  }

  const allVisibleSelected =
    filteredMembers.length > 0 && filteredMembers.every((m) => selectedIds.has(m.id));

  const addedCount = [...selectedIds].filter((id) => !assignedIds.has(id)).length;
  const removedCount = [...assignedIds].filter((id) => !selectedIds.has(id)).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Member ke "${group?.name}"`}
      size="md"
    >
      <div className="space-y-4">
        {/* Info group */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0A0E17] border border-gray-800 text-sm text-gray-400">
          <Users className="w-4 h-4 shrink-0" />
          <span>
            Saat ini <span className="text-white font-medium">{assignedIds.size} member</span> ada di group ini
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Cari nama member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-[#0A0E17] border border-gray-800 text-white placeholder:text-gray-500"
          />
        </div>

        {/* Select all */}
        {!loading && filteredMembers.length > 0 && (
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            {allVisibleSelected
              ? <CheckSquare className="w-4 h-4" />
              : <Square className="w-4 h-4" />
            }
            {allVisibleSelected ? 'Batalkan semua' : 'Pilih semua'}
            {searchTerm && ` hasil pencarian (${filteredMembers.length})`}
          </button>
        )}

        {/* Member list */}
        <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Memuat member...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              Tidak ada member ditemukan
            </div>
          ) : (
            filteredMembers.map((member) => {
              const isSelected = selectedIds.has(member.id);
              const wasAssigned = assignedIds.has(member.id);

              let rowExtra = '';
              if (isSelected && !wasAssigned) rowExtra = 'border-l-2 border-l-green-500';
              else if (!isSelected && wasAssigned) rowExtra = 'border-l-2 border-l-red-500';

              const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'M')}&size=64&background=111827&color=ffffff&bold=true&length=2`;

              return (
                <button
                  key={member.id}
                  onClick={() => toggleMember(member.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-[#0A0E17] border-gray-800 hover:bg-white/5'
                  } ${rowExtra}`}
                >
                  <img
                    src={member.photo_url || fallback}
                    alt={member.name}
                    onError={(e) => { e.currentTarget.src = fallback; }}
                    className="w-8 h-8 rounded-full object-cover border border-gray-700 shrink-0"
                  />
                  <span className="flex-1 text-sm font-medium text-white truncate">
                    {member.name}
                  </span>
                  {isSelected
                    ? <CheckSquare className="w-4 h-4 text-amber-400 shrink-0" />
                    : <Square className="w-4 h-4 text-gray-600 shrink-0" />
                  }
                </button>
              );
            })
          )}
        </div>

        {/* Summary perubahan */}
        {(addedCount > 0 || removedCount > 0) && (
          <div className="flex gap-2 text-xs">
            {addedCount > 0 && (
              <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-300 border border-green-500/20">
                +{addedCount} akan ditambahkan
              </span>
            )}
            {removedCount > 0 && (
              <span className="px-2 py-1 rounded-md bg-red-500/10 text-red-300 border border-red-500/20">
                -{removedCount} akan dihapus dari group ini
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-gray-800">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={saving}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            className="flex-1 bg-amber-500 text-black hover:bg-amber-400"
            disabled={saving || (addedCount === 0 && removedCount === 0)}
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menyimpan...</>
            ) : (
              `Simpan (${selectedIds.size} member)`
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}