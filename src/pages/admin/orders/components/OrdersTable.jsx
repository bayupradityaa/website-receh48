import { Badge } from '../../../../components/ui/Badge';
import {
  formatCurrency,
  getStatusColor,
  getStatusLabel,
} from '../../../../lib/utils';
import { Video, Camera, Handshake, Mail, StickyNote } from 'lucide-react';

const ORDER_TYPE_CONFIG = {
  vc: {
    badge: 'bg-blue-900/30 text-blue-300 border-blue-700/50',
    icon: <Video className="w-3 h-3 mr-1" />,
    label: 'VC',
  },
  twoshot: {
    badge: 'bg-purple-900/30 text-purple-300 border-purple-700/50',
    icon: <Camera className="w-3 h-3 mr-1" />,
    label: '2S',
  },
  mng: {
    badge: 'bg-orange-900/30 text-orange-300 border-orange-700/50',
    icon: <Handshake className="w-3 h-3 mr-1" />,
    label: 'MnG',
  },
};

function OrderTypeBadge({ orderType }) {
  const config = ORDER_TYPE_CONFIG[orderType] ?? ORDER_TYPE_CONFIG.vc;
  return (
    <Badge className={`${config.badge} inline-flex items-center`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}

// ── BARU: badge tipe akun OFC / General
function AccountTypeBadge({ accountType }) {
  if (accountType === 'ofc') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-semibold whitespace-nowrap">
        OFC
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 bg-gray-800 text-gray-400 border border-gray-700 rounded-full text-xs whitespace-nowrap">
      General
    </span>
  );
}

export default function OrdersTable({
  orders,
  onOrderClick,
  selectedIds = new Set(),
  allSelected = false,
  onToggleSelect,
  onToggleSelectAll,
  onDeleteOrder,
  onSendPaymentEmail,
  adminsList = [],
}) {
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-[#12161F] rounded-2xl border border-gray-800 p-12 text-center">
        <p className="text-gray-400 text-lg">Tidak ada pesanan yang ditemukan.</p>
      </div>
    );
  }

  const isSelectable = typeof onToggleSelect === 'function';
  const isDeletable = typeof onDeleteOrder === 'function';
  const isEmailable = typeof onSendPaymentEmail === 'function';

  return (
    <div className="bg-[#12161F] rounded-2xl border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1380px]">
          <thead className="sticky top-0 z-10 bg-[#1A1F2E]">
            <tr className="border-b border-gray-800">
              <th className="px-4 py-4 text-left w-10">
                {isSelectable && (
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleSelectAll}
                    aria-label="Pilih semua pesanan"
                    className="h-4 w-4 accent-primary-600 cursor-pointer rounded border-gray-600"
                  />
                )}
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">ID</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Tipe</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Akun</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Customer</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
              <th className="px-4 py-4 text-right text-sm font-semibold text-gray-300">Total Fee</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Admin PIC</th>
              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-300">Catatan</th>
              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-300">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800">
            {orders.map((order) => {
              const checked = selectedIds?.has?.(order.id) ?? false;
              const isCompleted = ['completed', 'done', 'selesai'].includes(order.status);
              const hasEmail = Boolean(order.contact_email);
              const hasAdminNote = Boolean(order.admin_note);
              const isOfc = order.account_type === 'ofc';

              const assignedAdmin = adminsList.find((a) => a.id === order.assigned_to);

              return (
                <tr
                  key={order.id}
                  className={`transition-colors cursor-pointer border-l-4 ${isOfc ? 'border-l-amber-400' : 'border-l-gray-700'
                    } ${checked ? 'bg-primary-900/20' : 'hover:bg-[#1A1F2E]'}`}
                  onClick={() => onOrderClick?.(order)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') onOrderClick?.(order); }}
                  title="Klik untuk melihat detail"
                >
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    {isSelectable && (
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggleSelect(order.id)}
                        aria-label={`Pilih pesanan ${order.id}`}
                        className="h-4 w-4 accent-primary-600 cursor-pointer rounded border-gray-600"
                      />
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm font-mono text-gray-400">
                    {order.id?.slice?.(0, 8) || '-'}
                  </td>

                  <td className="px-4 py-4">
                    <OrderTypeBadge orderType={order.order_type || 'vc'} />
                  </td>

                  {/* ── BARU: kolom tipe akun */}
                  <td className="px-4 py-4">
                    <AccountTypeBadge accountType={order.account_type} />
                  </td>

                  <td className="px-4 py-4 text-sm">
                    <div className="font-medium text-white">{order.customer_name || '-'}</div>
                    {order.note && (
                      <div className="text-xs text-gray-500 line-clamp-1 max-w-[200px] mt-0.5">
                        {order.note}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-400">
                    <span className="inline-block max-w-[200px] truncate">
                      {order.contact_email || '-'}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </td>

                  <td className="px-4 py-4 text-sm font-semibold text-primary-400 text-right">
                    {formatCurrency(order.total_fee ?? 0)}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-400">
                    {assignedAdmin ? (
                      <span className="text-amber-400 font-medium">
                        {assignedAdmin.full_name || assignedAdmin.email}
                      </span>
                    ) : (
                      <span className="text-gray-600">–</span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-center">
                    {hasAdminNote ? (
                      <span
                        title={order.admin_note}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs"
                      >
                        <StickyNote className="w-3 h-3" />
                        Ada
                      </span>
                    ) : (
                      <span className="text-gray-700 text-xs">–</span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2 flex-nowrap">
                      <button
                        onClick={() => onOrderClick?.(order)}
                        className="px-3 py-1.5 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors whitespace-nowrap"
                      >
                        Detail
                      </button>

                      {isEmailable && isCompleted && hasEmail && (
                        <button
                          onClick={() => onSendPaymentEmail(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors whitespace-nowrap"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Kirim Email
                        </button>
                      )}

                      {isDeletable && (
                        <button
                          onClick={() => onDeleteOrder(order.id)}
                          className="px-3 py-1.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors whitespace-nowrap"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 text-xs text-gray-500 border-t border-gray-800 bg-[#0A0E17]">
        Klik baris untuk membuka detail.{' '}
        <br />
        <span className="text-amber-400">Kirim Tagihan</span> otomatis muncul pada pesanan
        berstatus <span className="text-white">Selesai</span>.
      </div>
    </div>
  );
}