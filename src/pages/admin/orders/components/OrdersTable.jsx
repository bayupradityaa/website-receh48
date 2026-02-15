import { Badge } from '../../../../components/ui/Badge';
import {
  formatCurrency,
  formatDateTime,
  getStatusColor,
  getStatusLabel,
} from '../../../../lib/utils';
import { Video, Camera, Handshake } from 'lucide-react';

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

export default function OrdersTable({
  orders,
  onOrderClick,
  selectedIds = new Set(),
  allSelected = false,
  onToggleSelect,
  onToggleSelectAll,
  onDeleteOrder,
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

  return (
    <div className="bg-[#12161F] rounded-2xl border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px]">
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
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Customer</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
              <th className="px-4 py-4 text-right text-sm font-semibold text-gray-300">Total Fee</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Dikerjakan Oleh</th>
              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-300">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800">
            {orders.map((order) => {
              const checked = selectedIds?.has?.(order.id) ?? false;
              return (
                <tr
                  key={order.id}
                  className={`transition-colors cursor-pointer ${
                    checked ? 'bg-primary-900/20' : 'hover:bg-[#1A1F2E]'
                  }`}
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
                    {order.handled_by || '-'}
                  </td>

                  <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onOrderClick?.(order)}
                        className="px-3 py-1.5 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                        title="Lihat detail"
                      >
                        Detail
                      </button>
                      {isDeletable && (
                        <button
                          onClick={() => onDeleteOrder(order.id)}
                          className="px-3 py-1.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          title="Hapus pesanan"
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
        Klik baris untuk membuka detail.
      </div>
    </div>
  );
}