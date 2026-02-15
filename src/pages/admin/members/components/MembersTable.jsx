import { useMemo, useState } from 'react';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { formatCurrency } from '../../../../lib/utils';
import { Edit2, Trash2, Power, Users, Video, Camera, Star } from 'lucide-react';
import ConfirmDeleteModal from '../../shared/ConfirmDeleteModal';

function Tooltip({ label, children }) {
  return (
    <div className="relative group inline-flex">
      {children}
      <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="rounded-md bg-black text-white text-xs px-2 py-1 shadow-md whitespace-nowrap border border-gray-800">
          {label}
        </div>
      </div>
    </div>
  );
}

function getFeeGroupByType(member, type) {
  const item = member?.member_fees?.find((x) => x.fee_type === type);
  return item?.fee_groups || null;
}

export default function MembersTable({
  members,
  selectedIds,
  allSelected,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
  onToggleActive,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const totalCount = useMemo(() => members?.length || 0, [members]);

  if (!members || members.length === 0) {
    return (
      <div className="text-center py-12 bg-[#12161F] rounded-2xl border border-gray-800">
        <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <p className="text-lg font-medium text-white">Tidak ada member ditemukan</p>
        <p className="text-sm mt-1 text-gray-400">Coba ubah filter atau tambah member baru</p>
      </div>
    );
  }

  const askDelete = (m) => setDeleteTarget(m);

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      setDeleting(true);
      await onDelete?.(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Wrapper: footer tidak ikut scroll */}
      <div className="rounded-2xl border border-gray-800 bg-[#12161F] overflow-hidden">
        {/* Scroll area: vertical + horizontal */}
        <div className="tone-scroll">
          <table className="w-full min-w-[1200px]">
            <thead className="sticky top-0 z-10 bg-[#0A0E17] border-b border-gray-800">
              <tr>
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleSelectAll}
                    aria-label="Pilih semua member"
                    className="h-4 w-4 accent-amber-500 cursor-pointer"
                  />
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
                  Nama Member
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
                  Fee Group
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-300">
                  Status
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-300">
                  Harga VC
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-300">
                  Harga TwoShot
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-300">
                  Harga MnG
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-300 w-32">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {members.map((member) => {
                const checked = selectedIds?.has?.(member.id) ?? false;

                const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  member.name || 'Member'
                )}&size=128&background=111827&color=ffffff&bold=true&length=2`;

                const vc = getFeeGroupByType(member, 'vc');
                const twoshot = getFeeGroupByType(member, 'twoshot');
                const mng = getFeeGroupByType(member, 'mng');

                return (
                  <tr
                    key={member.id}
                    className={[
                      'transition-all',
                      checked ? 'bg-amber-500/10' : 'bg-[#12161F]',
                      'hover:bg-[#1A1F2E] hover:relative hover:z-[1]',
                    ].join(' ')}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggleSelect(member.id)}
                        aria-label={`Pilih ${member.name}`}
                        className="h-4 w-4 accent-amber-500 cursor-pointer"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-800 bg-[#0A0E17] shrink-0">
                          <img
                            src={member.photo_url || fallbackAvatar}
                            alt={member.name || 'Member'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = fallbackAvatar;
                            }}
                          />
                        </div>

                        <div>
                          <div className="font-medium text-white">{member.name || '-'}</div>
                          <div className="text-xs text-gray-500 font-mono">
                            ID: {member.id?.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="space-y-2">
                        {vc ? (
                          <div>
                            <Badge className="bg-blue-500/15 text-blue-200 border border-blue-500/30 inline-flex items-center gap-2">
                              <Video className="w-3.5 h-3.5" />
                              {vc.name}
                            </Badge>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">VC: -</div>
                        )}

                        {twoshot ? (
                          <div>
                            <Badge className="bg-purple-500/15 text-purple-200 border border-purple-500/30 inline-flex items-center gap-2">
                              <Camera className="w-3.5 h-3.5" />
                              {twoshot.name}
                            </Badge>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">TwoShot: -</div>
                        )}

                        {mng ? (
                          <div>
                            <Badge className="bg-orange-500/15 text-orange-200 border border-orange-500/30 inline-flex items-center gap-2">
                              <Star className="w-3.5 h-3.5" />
                              {mng.name}
                            </Badge>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">MnG: -</div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <Badge
                        className={
                          member.is_active
                            ? 'bg-green-500/15 text-green-200 border border-green-500/30'
                            : 'bg-red-500/15 text-red-200 border border-red-500/30'
                        }
                      >
                        {member.is_active ? '✓ Active' : '✕ Inactive'}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-white">
                        {vc ? formatCurrency(vc.fee) : '-'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-white">
                        {twoshot ? formatCurrency(twoshot.fee) : '-'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-white">
                        {mng ? formatCurrency(mng.fee) : '-'}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Tooltip label={member.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onToggleActive(member.id, member.is_active)}
                            className="p-2 hover:bg-white/5"
                          >
                            <Power
                              className={`w-4 h-4 ${
                                member.is_active ? 'text-green-300' : 'text-red-300'
                              }`}
                            />
                          </Button>
                        </Tooltip>

                        <Tooltip label="Edit">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(member)}
                            className="p-2 hover:bg-white/5"
                          >
                            <Edit2 className="w-4 h-4 text-sky-300" />
                          </Button>
                        </Tooltip>

                        <Tooltip label="Hapus">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => askDelete(member)}
                            className="p-2 hover:bg-white/5"
                          >
                            <Trash2 className="w-4 h-4 text-red-300" />
                          </Button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer tetap terlihat, tidak ikut scroll */}
        <div className="px-4 py-3 text-xs text-gray-400 border-t border-gray-800 bg-[#12161F]">
          Menampilkan {totalCount} member • Gunakan checkbox untuk aksi bulk (aktifkan, nonaktifkan, atau hapus)
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => (deleting ? null : setDeleteTarget(null))}
        title="Hapus Member?"
        description={
          deleteTarget
            ? `Member "${deleteTarget.name}" akan dihapus permanen.`
            : 'Member akan dihapus permanen.'
        }
        confirmText="Ya, hapus member"
        cancelText="Batal"
        isLoading={deleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}