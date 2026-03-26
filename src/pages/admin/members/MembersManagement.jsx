import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';
import FeeGroupsTab from './components/FeeGroupsTab';
import MembersTab from './components/MembersTab';
import { Users, DollarSign } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../contexts/ToastContext'; // Gunakan ToastContext yang sudah ada

export default function MembersManagement() {
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast(); // Ambil showToast dari context

  // Handler untuk toggle full slot
  const handleToggleFullSlot = async (memberId, serviceType, currentlyFull) => {
    try {
      // Ambil data member saat ini untuk mendapatkan full_slots terbaru
      const { data: memberData, error: fetchError } = await supabase
        .from('members')
        .select('full_slots')
        .eq('id', memberId)
        .single();

      if (fetchError) throw fetchError;

      const currentSlots = Array.isArray(memberData?.full_slots) ? memberData.full_slots : [];

      // Toggle: hapus kalau sudah ada, tambah kalau belum ada
      const updatedSlots = currentlyFull
        ? currentSlots.filter((s) => s !== serviceType)
        : [...new Set([...currentSlots, serviceType])];

      const { error: updateError } = await supabase
        .from('members')
        .update({ full_slots: updatedSlots })
        .eq('id', memberId);

      if (updateError) throw updateError;

      // Update state lokal (optimistic update)
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

  // Fungsi untuk mengambil data members (contoh)
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          member_fees (
            fee_type,
            fee_groups (
              id,
              name,
              fee
            )
          )
        `)
        .order('name');

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      showToast('Gagal mengambil data member: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Ambil data saat komponen pertama kali dimuat
  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Kelola Member & Fee</h2>
        <p className="text-gray-400">Kelola semua member JKT48 dan harga fee masing-masing</p>
      </div>

      {/* Panel utama */}
      <div className="bg-[#12161F] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-4 md:p-6 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Header tabs */}
            <TabsList className="bg-[#0A0E17] border border-gray-800 rounded-xl p-1">
              <TabsTrigger
                value="members"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-gray-200 rounded-lg"
              >
                <Users className="w-4 h-4 mr-2" />
                Member
              </TabsTrigger>

              <TabsTrigger
                value="fee-groups"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-gray-200 rounded-lg"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Grup Fee
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="mt-4">
              <MembersTab
                members={members}
                setMembers={setMembers}
                loading={loading}
                onToggleFullSlot={handleToggleFullSlot}
              />
            </TabsContent>

            <TabsContent value="fee-groups" className="mt-4">
              <FeeGroupsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}