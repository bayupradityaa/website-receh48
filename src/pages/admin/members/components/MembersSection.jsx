import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../lib/utils';
import { Search, Filter, Star, Users as UsersIcon, Video, Camera, Handshake } from 'lucide-react';

function getFeeGroupByType(member, type) {
  const item = member?.member_fees?.find((x) => x.fee_type === type);
  return item?.fee_groups || null;
}

const TYPE_CONFIG = {
  vc: {
    icon: Video,
    label: 'Video Call',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  twoshot: {
    icon: Camera,
    label: 'TwoShot',
    badgeClass: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  mng: {
    icon: Handshake,
    label: 'Meet & Greet',
    badgeClass: 'bg-orange-100 text-orange-700 border-orange-200',
  },
};

export default function MembersSection({ onSelectMember, orderType = 'vc' }) {
  const [members, setMembers] = useState([]);
  const [feeGroups, setFeeGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeeGroup, setSelectedFeeGroup] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const typeConfig = TYPE_CONFIG[orderType] ?? TYPE_CONFIG.vc;
  const TypeIcon = typeConfig.icon;

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderType]);

  async function fetchData() {
    try {
      setLoading(true);

      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select(
          `*,
          member_fees (
            fee_type,
            fee_groups (
              id, name, fee, description, fee_type
            )
          )`
        )
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (membersError) throw membersError;

      const activeMembers = (membersData || []).map((m) => ({
        ...m,
        member_fees: m.member_fees || [],
      }));

      // hanya tampilkan member yang punya fee group sesuai orderType
      const membersByType = activeMembers.filter((m) => !!getFeeGroupByType(m, orderType));

      const { data: feeGroupsData, error: feeGroupsError } = await supabase
        .from('fee_groups')
        .select('*')
        .eq('fee_type', orderType)
        .eq('is_active', true)
        .order('fee', { ascending: false });

      if (feeGroupsError) throw feeGroupsError;

      setMembers(membersByType);
      setFeeGroups(feeGroupsData || []);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const fg = getFeeGroupByType(member, orderType);
      const matchFeeGroup = selectedFeeGroup === 'all' || fg?.id === selectedFeeGroup;
      return matchSearch && matchFeeGroup;
    });
  }, [members, searchTerm, selectedFeeGroup, orderType]);

  const membersByFeeGroup = useMemo(() => {
    return feeGroups
      .map((fg) => ({
        ...fg,
        members: filteredMembers.filter((m) => getFeeGroupByType(m, orderType)?.id === fg.id),
      }))
      .filter((g) => g.members.length > 0);
  }, [feeGroups, filteredMembers, orderType]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
        <p className="mt-4 text-dark-600">Memuat member...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-dark-900 mb-2">
          Pilih Member Favorit Kamu
        </h2>
        <p className="text-dark-600 inline-flex items-center gap-2 justify-center">
          <TypeIcon className="w-4 h-4" />
          Tersedia {members.length} member untuk {typeConfig.label}
        </p>
      </div>

      {/* Search & Filter */}
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <Input
              type="text"
              placeholder="🔍 Cari nama member..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            size="md"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {showFilters && (
          <div className="bg-white rounded-lg border border-dark-200 p-4 shadow-sm">
            <label className="block text-sm font-medium text-dark-700 mb-2">
              Filter berdasarkan fee group:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => setSelectedFeeGroup('all')}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  selectedFeeGroup === 'all'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-dark-700 border-dark-200 hover:bg-dark-50'
                }`}
              >
                Semua
              </button>

              {feeGroups.map((fg) => (
                <button
                  key={fg.id}
                  onClick={() => setSelectedFeeGroup(fg.id)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    selectedFeeGroup === fg.id
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-dark-700 border-dark-200 hover:bg-dark-50'
                  }`}
                >
                  {fg.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {(searchTerm || selectedFeeGroup !== 'all') && (
        <div className="text-center text-sm text-dark-600">
          Menampilkan {filteredMembers.length} dari {members.length} member
        </div>
      )}

      {/* Member List by Fee Group */}
      <div className="space-y-8">
        {membersByFeeGroup.length > 0 ? (
          membersByFeeGroup.map((group) => (
            <div key={group.id}>
              <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-primary-200">
                <div>
                  <h3 className="text-xl font-bold text-dark-900 flex items-center gap-2">
                    <TypeIcon className="w-5 h-5 text-primary-600" />
                    {group.name}
                  </h3>
                  {group.description && (
                    <p className="text-sm text-dark-600 mt-0.5">{group.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">
                    {formatCurrency(group.fee)}
                  </div>
                  <div className="text-xs text-dark-600">{group.members.length} member</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {group.members.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    onSelect={onSelectMember}
                    orderType={orderType}
                    typeConfig={typeConfig}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-dark-200">
            <UsersIcon className="w-16 h-16 mx-auto mb-4 text-dark-300" />
            <p className="text-lg font-medium text-dark-700">Tidak ada member ditemukan</p>
            <p className="text-sm text-dark-600 mt-1">Coba ubah kata kunci pencarian atau filter</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MemberCard({ member, onSelect, orderType, typeConfig }) {
  const [imageError, setImageError] = useState(false);
  const fg = getFeeGroupByType(member, orderType);
  const TypeIcon = typeConfig.icon;

  return (
    <button
      onClick={() => onSelect(member)}
      className="group bg-white rounded-xl border-2 border-dark-200 hover:border-primary-500 hover:shadow-xl transition-all duration-200 overflow-hidden focus:outline-none focus:ring-4 focus:ring-primary-200"
    >
      <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
        {!imageError && member.photo_url ? (
          <img
            src={member.photo_url}
            alt={member.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl font-bold text-primary-600">
              {member.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-primary-600 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <Star className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>

        {/* Badge type di pojok kiri atas */}
        <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-md border text-[10px] font-semibold flex items-center gap-1 ${typeConfig.badgeClass}`}>
          <TypeIcon className="w-2.5 h-2.5" />
          {typeConfig.label}
        </div>
      </div>

      <div className="p-3">
        <h4 className="font-semibold text-dark-900 text-sm group-hover:text-primary-600 transition-colors line-clamp-2">
          {member.name}
        </h4>
        <p className="text-xs text-dark-600 mt-1 font-medium">
          {fg ? formatCurrency(fg.fee) : '-'}
        </p>
      </div>
    </button>
  );
}