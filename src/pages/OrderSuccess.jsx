import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "../lib/utils";

export default function OrderSuccess({ order: orderProp, inModal = false, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const order = orderProp || location.state?.order;

  useEffect(() => {
    if (!order && !inModal) navigate("/");
  }, [order, inModal, navigate]);

  if (!order) return null;

  return (
    <div className={inModal ? "" : "min-h-screen bg-[#0A0E17] text-white py-12"}>
      <div className={inModal ? "w-full" : "container mx-auto px-4 max-w-2xl"}>
        {/* Header */}
        <div className="text-center mb-8 animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-4 bg-emerald-500/15 border border-emerald-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            Pesanan Berhasil Dibuat!
          </h1>
          <p className="text-gray-400">Terima kasih telah memesan. Berikut detail pesanan Anda:</p>
        </div>

        <Card variant="elevated" className="animate-slide-up bg-[#12161F] border border-gray-800">
          <CardHeader className="border-b border-gray-800">
            <div className="flex justify-between items-start gap-3">
              <div>
                <CardTitle className="text-white">Detail Pesanan</CardTitle>
                {/* ✅ Order ID dihapus */}
                <p className="text-sm text-gray-400 mt-1">Silakan cek email untuk informasi berikutnya.</p>
              </div>

              <Badge className={getStatusColor(order.status)}>
                {getStatusLabel(order.status)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Info Pemesan */}
            <div className="border-b border-gray-800 pb-4">
              <h3 className="font-semibold text-white mb-3">Informasi Pemesan</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400">Nama:</span>
                  <span className="font-medium text-white text-right">{order.customer_name || "-"}</span>
                </div>

                {order.contact_twitter && (
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400">Twitter:</span>
                    <span className="font-medium text-white text-right">{order.contact_twitter}</span>
                  </div>
                )}

                {order.contact_line && (
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400">LINE:</span>
                    <span className="font-medium text-white text-right">{order.contact_line}</span>
                  </div>
                )}

                <div className="flex justify-between gap-3">
                  <span className="text-gray-400">Email:</span>
                  <span className="font-medium text-white text-right break-all">{order.contact_email || "-"}</span>
                </div>
              </div>
            </div>

            {/* Detail */}
            <div className="border-b border-gray-800 pb-4">
              <h3 className="font-semibold text-white mb-3">Detail Pesanan</h3>

              <div className="space-y-2 text-sm">
                {order.date && (
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400">Tanggal:</span>
                    <span className="font-medium text-white text-right">{formatDate(order.date)}</span>
                  </div>
                )}

                {order.session && (
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400">Sesi:</span>
                    <span className="font-medium text-white text-right">{order.session}</span>
                  </div>
                )}

                {order.ticket_qty && (
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400">Jumlah Tiket:</span>
                    <span className="font-medium text-white text-right">{order.ticket_qty}</span>
                  </div>
                )}

                {order.note && (
                  <div>
                    <span className="text-gray-400">Catatan:</span>
                    <div className="mt-2 bg-[#0A0E17] border border-gray-800 rounded-lg p-3">
                      <p className="text-sm text-gray-200 whitespace-pre-wrap">{order.note}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Total + Steps */}
            <div>
              <div className="flex justify-between items-center mb-4 gap-3">
                <span className="text-lg font-semibold text-white">Total Pembayaran:</span>
                <span className="text-2xl font-bold text-amber-300">
                  {formatCurrency(order.total_fee || 0)}
                </span>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-100 mb-2">Langkah Selanjutnya:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-100/80">
                  <li>Kami akan menghubungi Anda via DM X atau Line untuk konfirmasi</li>
                  <li>Pastikan Akun X atau Line kaian bisa dihubungi</li>
                  <li>Pembayaran fee joki setelah kalian mendapatkan tiket</li>
                  <li>Kami akan beritahu segera mengenai dapat atau tidak nya tiket kalian</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {inModal ? (
            <>
              <Button variant="outline" size="lg" onClick={onClose}>
                Tutup
              </Button>
              <Link to="/">
                <Button size="lg">Kembali ke Home</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/">
                <Button variant="outline" size="lg">
                  Kembali ke Home
                </Button>
              </Link>
              <Link to="/video-call">
                <Button size="lg">Pesan Lagi</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
