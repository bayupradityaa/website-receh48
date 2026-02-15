import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useToast } from '../../../../contexts/ToastContext';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import FeeGroupCard from './FeeGroupCard';
import FeeGroupModal from './FeeGroupModal';
import AssignMembersModal from './AssignMembersModal';
import { Plus, Users, Video, Camera, Handshake } from 'lucide-react';

export default function FeeGroupsTab() {
  const [feeGroups, setFeeGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState(null);
  const [assigningGroup, setAssigningGroup] = useState(null); // 👈 state untuk assign modal

  const [selectedFeeType, setSelectedFeeType] = useState('all');

  const { showToast } = useToast();
  const isMountedRef = useRef(true);

  const fetchFeeGroups = useCallback(async () => {
    try {
      if (isMountedRef.current) setLoading(true);

      const { data: groups, error: groupsError } = await supabase
        .from('fee_groups')
        .select('*')
        .order('fee', { ascending: false });
      if (groupsError) throw groupsError;

      const { data: mappings, error: mapError } = await supabase
        .from('member_fees')
        .select(`
          fee_group_id,
          members:members (
            id, name, is_active
          )
        `);
      if (mapError) throw mapError;

      const membersByGroupId = new Map();
      (mappings || []).forEach((row) => {
        const gid = row.fee_group_id;
        const m = row.members;
        if (!gid || !m) return;
        if (!membersByGroupId.has(gid)) membersByGroupId.set(gid, []);
        membersByGroupId.get(gid).push(m);
      });

      const enriched = (groups || []).map((g) => {
        const members = membersByGroupId.get(g.id) || [];
        return {
          ...g,
          members,
          member_count: members.length,
          active_count: members.filter((m) => m?.is_active).length,
        };
      });

      if (isMountedRef.current) setFeeGroups(enriched);
    } catch (err) {
      console.error('Error fetching fee groups:', err);
      showToast('Gagal memuat data fee groups', 'error');
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [showToast]);

  const setupRealtimeSubscription = useCallback(() => {
    const ch = supabase
      .channel('fee-groups-and-mapping-realtime-v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fee_groups' }, fetchFeeGroups)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'member_fees' }, fetchFeeGroups)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, fetchFeeGroups)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [fetchFeeGroups]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchFeeGroups();
    const cleanup = setupRealtimeSubscription();
    return () => {
      isMountedRef.current = false;
      cleanup?.();
    };
  }, [fetchFeeGroups, setupRealtimeSubscription]);

  async function handleSaveFeeGroup(groupData) {
    try {
      if (editingGroup?.id) {
        const { error } = await supabase.from('fee_groups').update(groupData).eq('id', editingGroup.id);
        if (error) throw error;
        showToast('Fee group berhasil diupdate', 'success');
      } else {
        const { error } = await supabase.from('fee_groups').insert([groupData]);
        if (error) throw error;
        showToast('Fee group berhasil ditambahkan', 'success');
      }
      setIsModalOpen(false);
      setEditingGroup(null);
      await fetchFeeGroups();
      return true;
    } catch (err) {
      console.error('Error saving fee group:', err);
      showToast('Gagal menyimpan fee group', 'error');
      return false;
    }
  }

  async function handleDeleteFeeGroup(id) {
    const group = feeGroups.find((g) => g.id === id);
    const memberCount = group?.member_count || 0;
    if (memberCount > 0) {
      alert(`Tidak bisa hapus! Masih ada ${memberCount} member di group ini. Pindahkan member terlebih dahulu.`);
      return;
    }
    if (!confirm('Yakin ingin menghapus fee group ini?')) return;
    try {
      const { error } = await supabase.from('fee_groups').delete().eq('id', id);
      if (error) throw error;
      showToast('Fee group berhasil dihapus', 'success');
      await fetchFeeGroups();
    } catch (err) {
      console.error('Error deleting fee group:', err);
      showToast('Gagal menghapus fee group', 'error');
    }
  }

  function handleEditFeeGroup(group)    { setEditingGroup(group);        setIsModalOpen(true); }
  function handleAddFeeGroup()          { setEditingGroup(null);          setIsModalOpen(true); }
  function handleViewMembers(group)     { setSelectedGroupMembers(group); }
  function handleAssignMembers(group)   { setAssigningGroup(group); }   // 👈

  const vcGroups  = feeGroups.filter((g) => (g.fee_type || 'vc') === 'vc');
  const tsGroups  = feeGroups.filter((g) => g.fee_type === 'twoshot');
  const mngGroups = feeGroups.filter((g) => g.fee_type === 'mng');

  const filteredFeeGroups = feeGroups.filter((g) => {
    if (selectedFeeType === 'all') return true;
    return (g.fee_type || 'vc') === selectedFeeType;
  });

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
        <p className="mt-4">Memuat fee groups...</p>
      </div>
    );
  }

  const TABS = [
    { key: 'all',     label: `Semua (${feeGroups.length})`,        icon: null,                                      cls: 'text-primary-400 border-primary-400' },
    { key: 'vc',      label: `Video Call (${vcGroups.length})`,     icon: <Video     className="w-4 h-4" />,         cls: 'text-blue-400   border-blue-400'   },
    { key: 'twoshot', label: `TwoShot (${tsGroups.length})`,        icon: <Camera    className="w-4 h-4" />,         cls: 'text-purple-400 border-purple-400' },
    { key: 'mng',     label: `Meet & Greet (${mngGroups.length})`,  icon: <Handshake className="w-4 h-4" />,         cls: 'text-green-400  border-green-400'  },
  ];

  const emptyLabel = {
    all:     'Belum ada fee group. Klik "Tambah Fee Group" untuk membuat.',
    vc:      'Belum ada fee group untuk Video Call.',
    twoshot: 'Belum ada fee group untuk TwoShot.',
    mng:     'Belum ada fee group untuk Meet & Greet.',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Manajemen Fee Groups</h3>
          <p className="text-sm text-gray-400 mt-1">Kelola harga berdasarkan kelompok member</p>
        </div>
        <Button onClick={handleAddFeeGroup} variant="primary">
          <Plus className="w-4 h-4 mr-2" />Tambah Fee Group
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedFeeType(tab.key)}
            className={`px-5 py-3 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              selectedFeeType === tab.key
                ? `${tab.cls} border-b-2`
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredFeeGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeeGroups.map((group) => (
            <FeeGroupCard
              key={group.id}
              group={group}
              onEdit={handleEditFeeGroup}
              onDelete={handleDeleteFeeGroup}
              onViewMembers={handleViewMembers}
              onAssignMembers={handleAssignMembers}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#12161F] rounded-2xl border border-gray-800">
          <p className="text-gray-400">{emptyLabel[selectedFeeType]}</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <FeeGroupModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingGroup(null); }}
        onSave={handleSaveFeeGroup}
        group={editingGroup}
      />

      {/* Assign Members Modal */}
      <AssignMembersModal
        isOpen={!!assigningGroup}
        onClose={() => setAssigningGroup(null)}
        group={assigningGroup}
        onSuccess={() => {
          showToast('Assignment member berhasil disimpan', 'success');
          fetchFeeGroups();
        }}
      />

      {/* View Members Modal */}
      {selectedGroupMembers && (
        <Modal
          isOpen={!!selectedGroupMembers}
          onClose={() => setSelectedGroupMembers(null)}
          title={`Member di ${selectedGroupMembers.name}`}
          size="md"
        >
          <div className="space-y-3">
            {selectedGroupMembers.members?.length > 0 ? (
              selectedGroupMembers.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-800 bg-[#0A0E17] hover:bg-white/5 transition-colors"
                >
                  <span className="font-medium text-white">{member.name}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${
                    member.is_active
                      ? 'bg-green-500/15 text-green-200 border-green-500/30'
                      : 'bg-red-500/15 text-red-200 border-red-500/30'
                  }`}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-[#0A0E17] rounded-2xl border border-gray-800">
                <Users className="w-10 h-10 mx-auto mb-3 text-gray-500" />
                <p className="text-gray-400">Belum ada member di group ini</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}