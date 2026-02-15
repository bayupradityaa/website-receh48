import { Button } from '../../../../components/ui/Button';
import { formatCurrency } from '../../../../lib/utils';
import { Edit2, Trash2, Users, Video, Camera, Handshake, UserPlus } from 'lucide-react';

const TYPE_CONFIG = {
  vc:      { icon: <Video     className="w-4 h-4 text-blue-300"   />, label: 'Video Call'   },
  twoshot: { icon: <Camera    className="w-4 h-4 text-purple-300" />, label: 'TwoShot'      },
  mng:     { icon: <Handshake className="w-4 h-4 text-green-300"  />, label: 'Meet & Greet' },
};

export default function FeeGroupCard({ group, onEdit, onDelete, onViewMembers, onAssignMembers }) {
  const memberCount   = group.member_count ?? 0;
  const activeCount   = group.active_count ?? 0;
  const inactiveCount = Math.max(memberCount - activeCount, 0);

  const typeKey = group.fee_type || 'vc';
  const type    = TYPE_CONFIG[typeKey] ?? TYPE_CONFIG.vc;

  return (
    <div className="bg-[#12161F] rounded-2xl border border-gray-800 p-6 hover:bg-white/5 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {type.icon}
            <h4 className="text-xl font-bold text-white truncate">{group.name}</h4>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{type.label}</p>
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{group.description || '—'}</p>
        </div>

        <div className="flex items-center gap-1 text-gray-200 bg-[#0A0E17] border border-gray-800 px-3 py-1 rounded-full shrink-0">
          <Users className="w-4 h-4 text-gray-300" />
          <span className="text-sm font-medium">{memberCount}</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-bold text-primary-400">{formatCurrency(group.fee)}</p>
        <p className="text-xs text-gray-500 mt-1">per member & sesi</p>
      </div>

      <div className="flex items-center gap-2 mb-5 text-sm">
        <div className="flex-1 rounded-xl px-3 py-2 border bg-green-500/10 border-green-500/25">
          <div className="text-green-200 font-semibold">{activeCount} Active</div>
        </div>
        <div className="flex-1 rounded-xl px-3 py-2 border bg-red-500/10 border-red-500/25">
          <div className="text-red-200 font-semibold">{inactiveCount} Inactive</div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(group)} className="flex-1">
          <Edit2 className="w-4 h-4 mr-1" />Edit
        </Button>

        {/* Tombol assign member - highlight amber */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAssignMembers(group)}
          className="flex-1 border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
          title="Assign member ke group ini"
        >
          <UserPlus className="w-4 h-4 mr-1" />Assign
        </Button>

        <Button variant="outline" size="sm" onClick={() => onViewMembers(group)} className="px-3" title="Lihat daftar member">
          <Users className="w-4 h-4" />
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(group.id)}
          className="px-3"
          title={memberCount > 0 ? 'Tidak bisa dihapus, pindahkan member dulu' : 'Hapus'}
          disabled={memberCount > 0}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}