import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useToast } from '../../../../contexts/ToastContext';

export function useFeeGroups() {
  const [feeGroups, setFeeGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchFeeGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchFeeGroups() {
    try {
      setLoading(true);

      const { data: groups, error: groupsError } = await supabase
        .from('fee_groups')
        .select('*')
        .order('fee', { ascending: false });

      if (groupsError) throw groupsError;

      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('fee_group_id');

      if (membersError) throw membersError;

      // Count members per group
      const memberCounts = {};
      members.forEach((m) => {
        if (m.fee_group_id) {
          memberCounts[m.fee_group_id] = (memberCounts[m.fee_group_id] || 0) + 1;
        }
      });

      const groupsWithCount = groups.map((group) => ({
        ...group,
        member_count: memberCounts[group.id] || 0,
      }));

      setFeeGroups(groupsWithCount);
    } catch (err) {
      showToast('error', 'Gagal memuat data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addFeeGroup(groupData) {
    try {
      const feeValue = parseInt(groupData.fee);
      if (!groupData.name || isNaN(feeValue) || feeValue < 0) {
        showToast('error', 'Nama dan fee harus diisi dengan benar');
        return false;
      }

      const { error } = await supabase.from('fee_groups').insert({
        name: groupData.name,
        fee: feeValue,
        description: groupData.description,
      });

      if (error) throw error;

      showToast('success', 'Fee group berhasil ditambahkan');
      await fetchFeeGroups();
      return true;
    } catch (err) {
      showToast('error', 'Gagal menambah fee group: ' + err.message);
      return false;
    }
  }

  async function updateFeeGroup(groupId, groupData) {
    try {
      const feeValue = parseInt(groupData.fee);
      if (!groupData.name || isNaN(feeValue) || feeValue < 0) {
        showToast('error', 'Nama dan fee harus diisi dengan benar');
        return false;
      }

      const { error } = await supabase
        .from('fee_groups')
        .update({
          name: groupData.name,
          fee: feeValue,
          description: groupData.description,
        })
        .eq('id', groupId);

      if (error) throw error;

      showToast('success', 'Fee group berhasil diupdate');
      await fetchFeeGroups();
      return true;
    } catch (err) {
      showToast('error', 'Gagal update fee group: ' + err.message);
      return false;
    }
  }

  async function deleteFeeGroup(groupId) {
    try {
      const { error } = await supabase.from('fee_groups').delete().eq('id', groupId);
      if (error) throw error;

      showToast('success', 'Fee group berhasil dihapus');
      await fetchFeeGroups();
      return true;
    } catch (err) {
      showToast('error', 'Gagal menghapus fee group: ' + err.message);
      return false;
    }
  }

  async function getGroupMembers(groupId) {
    try {
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('fee_group_id', groupId)
        .order('name');

      if (membersError) throw membersError;

      const { data: available, error: availableError } = await supabase
        .from('members')
        .select('*')
        .or(`fee_group_id.is.null,fee_group_id.neq.${groupId}`)
        .order('name');

      if (availableError) throw availableError;

      return {
        groupMembers: members || [],
        availableMembers: available || [],
      };
    } catch (err) {
      showToast('error', 'Gagal memuat member: ' + err.message);
      return { groupMembers: [], availableMembers: [] };
    }
  }

  async function addMemberToGroup(memberId, groupId) {
    try {
      const { error } = await supabase
        .from('members')
        .update({ fee_group_id: groupId })
        .eq('id', memberId);

      if (error) throw error;

      showToast('success', 'Member berhasil ditambahkan ke group');
      await fetchFeeGroups();
      return true;
    } catch (err) {
      showToast('error', 'Gagal menambah member: ' + err.message);
      return false;
    }
  }

  async function removeMemberFromGroup(memberId) {
    try {
      const { error } = await supabase
        .from('members')
        .update({ fee_group_id: null })
        .eq('id', memberId);

      if (error) throw error;

      showToast('success', 'Member berhasil dihapus dari group');
      await fetchFeeGroups();
      return true;
    } catch (err) {
      showToast('error', 'Gagal menghapus member: ' + err.message);
      return false;
    }
  }

  return {
    feeGroups,
    loading,
    fetchFeeGroups,
    addFeeGroup,
    updateFeeGroup,
    deleteFeeGroup,
    getGroupMembers,
    addMemberToGroup,
    removeMemberFromGroup,
  };
}