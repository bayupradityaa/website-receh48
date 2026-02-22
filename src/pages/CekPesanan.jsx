import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Package, Clock, CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'Menunggu Konfirmasi',
    icon: <Clock className="w-4 h-4" />,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10 border-yellow-400/30',
    dot: 'bg-yellow-400',
  },
  confirmed: {
    label: 'Dikonfirmasi',
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/30',
    dot: 'bg-blue-400',
  },
  in_progress: {
    label: 'Sedang Diproses',
    icon: <Package className="w-4 h-4" />,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/30',
    dot: 'bg-purple-400',
  },
  completed: {
    label: 'Selesai',
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/30',
    dot: 'bg-emerald-400',
  },
  done: {
    label: 'Selesai',
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/30',
    dot: 'bg-emerald-400',
  },
  cancelled: {
    label: 'Dibatalkan',
    icon: <XCircle className="w-4 h-4" />,
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/30',
    dot: 'bg-red-400',
  },
};

const ORDER_TYPE_LABEL = {
  vc:      'Video Call (VC)',
  twoshot: '2 Shot',
  mng:     'Meet & Greet (MnG)',
};

const ORDER_TYPE_COLOR = {
  vc:      'bg-blue-900/30 text-blue-300 border-blue-700/50',
  twoshot: 'bg-purple-900/30 text-purple-300 border-purple-700/50',
  mng:     'bg-orange-900/30 text-orange-300 border-orange-700/50',
};

const formatRupiah = (num) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num ?? 0);

const formatDate = (str) =>
  str
    ? new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '-';

// ── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const status = STATUS_CONFIG[order.status] ?? {
    label: order.status,
    icon: <AlertCircle className="w-4 h-4" />,
    color: 'text-gray-400',
    bg: 'bg-gray-400/10 border-gray-400/30',
    dot: 'bg-gray-400',
  };

  return (
    <div className="bg-[#12161F] border border-gray-800 rounded-2xl overflow-hidden transition-all hover:border-gray-700">
      {/* Card header — always visible */}
      <button
        className="w-full text-left px-5 py-4 flex items-start gap-4"
        onClick={() => setOpen((v) => !v)}
      >
        {/* Status dot */}
        <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${status.dot} ring-4 ring-white/5`} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {/* Order type badge */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold border ${ORDER_TYPE_COLOR[order.order_type] ?? 'bg-gray-800 text-gray-300 border-gray-700'}`}>
              {ORDER_TYPE_LABEL[order.order_type] ?? order.order_type ?? 'VC'}
            </span>
            {/* Status badge */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${status.bg} ${status.color}`}>
              {status.icon}
              {status.label}
            </span>
          </div>

          <p className="text-white font-semibold truncate">{order.customer_name || '-'}</p>
          <p className="text-gray-500 text-xs mt-0.5">{formatDate(order.created_at)}</p>
        </div>

        {/* Total fee + chevron */}
        <div className="flex-shrink-0 text-right">
          <p className="text-amber-400 font-bold text-sm">{formatRupiah(order.total_fee ?? 0)}</p>
          <div className="flex justify-end mt-1 text-gray-500">
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="px-5 pb-5 border-t border-gray-800 pt-4 space-y-4">
          {/* Detail rows */}
          <div className="space-y-2 text-sm">
            <DetailRow label="ID Pesanan"  value={<span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded">{order.id?.slice(0, 8)}</span>} />
            <DetailRow label="Tipe Layanan" value={ORDER_TYPE_LABEL[order.order_type] ?? order.order_type ?? '-'} />
            <DetailRow label="Total Tagihan" value={<span className="text-amber-400 font-bold">{formatRupiah(order.total_fee ?? 0)}</span>} />
            <DetailRow label="Tanggal Order" value={formatDate(order.created_at)} />
          </div>

          {/* Note */}
          {order.note && (
            <div>
              <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wider">Detail Pesanan</p>
              <div className="bg-[#1A1F2E] rounded-xl px-4 py-3 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap border border-gray-700/50">
                {order.note}
              </div>
            </div>
          )}

          {/* Status info */}
          <div className={`rounded-xl px-4 py-3 border text-sm ${status.bg} ${status.color}`}>
            <div className="flex items-center gap-2 font-semibold mb-0.5">
              {status.icon}
              {status.label}
            </div>
            <p className="text-xs opacity-80 ml-6">
              {order.status === 'pending'     && 'Pesananmu sedang menunggu konfirmasi dari admin kami.'}
              {order.status === 'confirmed'   && 'Pesananmu sudah dikonfirmasi dan akan segera diproses.'}
              {order.status === 'in_progress' && 'Pesananmu sedang dikerjakan oleh tim kami.'}
              {(order.status === 'completed' || order.status === 'done') && 'Pesananmu sudah selesai. Terima kasih!'}
              {order.status === 'cancelled'   && 'Pesananmu dibatalkan. Hubungi admin untuk info lebih lanjut.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 items-center">
      <span className="text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-white text-right">{value}</span>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CekPesanan() {
  const [email,    setEmail]    = useState('');
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const [error,    setError]    = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    setOrders([]);
    setSearched(false);

    try {
      const { data, error: sbError } = await supabase
        .from('orders')
        .select('id, customer_name, contact_email, order_type, status, total_fee, handled_by, note, created_at')
        .ilike('contact_email', trimmed)
        .order('created_at', { ascending: false });

      if (sbError) throw sbError;
      setOrders(data || []);
      setSearched(true);
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan saat mencari pesanan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06070A]">
      {/* ── Hero section ── */}
      <div className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-400/8 blur-[100px] rounded-full" />
        </div>

        <div className="relative container mx-auto px-4 pt-16 pb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 text-amber-300 text-sm font-medium mb-6">
            <Search className="w-3.5 h-3.5" />
            Cek Status Pesanan
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Lacak Pesanan<br />
            <span className="bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
              Kamu
            </span>
          </h1>
          <p className="text-gray-400 text-base max-w-sm mx-auto leading-relaxed">
            Masukkan email JKT48 yang kamu gunakan saat memesan untuk melihat status pesananmu.
          </p>
        </div>
      </div>

      {/* ── Search form ── */}
      <div className="container mx-auto px-4 max-w-lg pb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="emailanda@gmail.com"
              required
              className="w-full pl-10 pr-4 py-3 bg-[#12161F] border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-bold text-sm rounded-xl transition-colors flex-shrink-0 flex items-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Cari
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-3 flex items-start gap-2 bg-red-900/30 border border-red-700/50 rounded-xl p-3 text-sm text-red-300">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* ── Results ── */}
      <div className="container mx-auto px-4 max-w-lg pb-16">

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-[#12161F] border border-gray-800 rounded-2xl p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-700 mt-1" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-700 rounded w-1/3" />
                    <div className="h-4 bg-gray-700 rounded w-1/2" />
                    <div className="h-3 bg-gray-700 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results list */}
        {!loading && searched && (
          <>
            {orders.length > 0 ? (
              <>
                <p className="text-gray-400 text-sm mb-3">
                  Ditemukan{' '}
                  <span className="text-white font-semibold">{orders.length}</span>{' '}
                  pesanan untuk <span className="text-amber-400">{email.trim()}</span>
                </p>
                <div className="space-y-3">
                  {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </>
            ) : (
              // Empty state
              <div className="text-center py-14">
                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-white font-semibold text-lg mb-1">Pesanan Tidak Ditemukan</p>
                <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                  Tidak ada pesanan dengan email{' '}
                  <span className="text-gray-300">{email.trim()}</span>.
                  Pastikan email yang kamu masukkan sudah benar.
                </p>
                <p className="text-gray-600 text-xs mt-4">
                  Ada masalah?{' '}
                  <a
                    href="https://x.com/receh_48"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline"
                  >
                    Hubungi @receh48
                  </a>
                </p>
              </div>
            )}
          </>
        )}

        {/* Initial state — before search */}
        {!loading && !searched && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-amber-400/70" />
            </div>
            <p className="text-gray-600 text-sm">Masukkan emailmu di atas untuk mulai mencari</p>
          </div>
        )}
      </div>
    </div>
  );
}