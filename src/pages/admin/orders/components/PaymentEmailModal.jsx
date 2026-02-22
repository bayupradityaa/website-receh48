import { useState, useEffect } from 'react';
import { X, Mail, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatRupiah = (num) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(num ?? 0);

const ORDER_TYPE_LABEL = {
    vc: 'Video Call (VC)',
    twoshot: '2 Shot',
    mng: 'Meet & Greet (MnG)',
};

// Info pembayaran tetap — hardcoded, tidak perlu diisi admin setiap kali
const PAYMENT_INFO =
    'BCA       : 0954406764\n' +
    'Seabank   : 901759323972\n' +
    'GoPay/Dana: 0895363264085\n\n' +
    'Semua a/n Bayu Praditya\n\n' +
    '*Jika mau pembayaran QRIS hubungi admin X kami @receh48';

// Lazy-load EmailJS dari CDN — tidak perlu npm install
function loadEmailJS() {
    return new Promise((resolve, reject) => {
        if (window.emailjs) return resolve(window.emailjs);
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        script.onload = () => resolve(window.emailjs);
        script.onerror = () => reject(new Error('Gagal memuat library EmailJS'));
        document.head.appendChild(script);
    });
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PaymentEmailModal({ order, isOpen, onClose, onSuccess, onError }) {
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const [editNote, setEditNote] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSent(false);
            setError('');
            setEditNote(order?.note || '');
        }
    }, [isOpen, order?.id]);

    if (!isOpen || !order) return null;

    const handleSend = async () => {
        setError('');
        setSending(true);

        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (!serviceId || !templateId || !publicKey) {
            setError(
                'Konfigurasi EmailJS belum lengkap. Pastikan VITE_EMAILJS_SERVICE_ID, ' +
                'VITE_EMAILJS_TEMPLATE_ID, dan VITE_EMAILJS_PUBLIC_KEY sudah diisi di file .env.'
            );
            setSending(false);
            return;
        }

        try {
            const emailjs = await loadEmailJS();
            emailjs.init({ publicKey });

            await emailjs.send(serviceId, templateId, {
                to_email: order.contact_email,
                to_name: order.customer_name || 'Customer',
                order_type: ORDER_TYPE_LABEL[order.order_type] ?? order.order_type ?? 'VC',
                total_fee: formatRupiah(order.total_fee ?? 0),
                order_note: editNote || '-',
                payment_info: PAYMENT_INFO,
                from_name: 'receh48',
            });

            setSent(true);
            onSuccess?.();
        } catch (err) {
            console.error('EmailJS error:', err);
            setError(err?.text || err?.message || 'Terjadi kesalahan. Silakan coba lagi.');
            onError?.();
        } finally {
            setSending(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget && !sending) onClose(); }}
        >
            <div className="bg-[#12161F] border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-amber-400" />
                        <h2 className="text-lg font-semibold text-white">Kirim Tagihan Pembayaran</h2>
                    </div>
                    {!sending && (
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Tutup">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* ── Body ── */}
                <div className="px-6 py-5 space-y-4">

                    {/* Sukses */}
                    {sent ? (
                        <div className="flex flex-col items-center py-8 gap-3 text-center">
                            <CheckCircle2 className="w-14 h-14 text-emerald-400" />
                            <p className="text-white font-semibold text-lg">Email berhasil dikirim!</p>
                            <p className="text-gray-400 text-sm">
                                Tagihan telah dikirim ke{' '}
                                <span className="text-white font-medium">{order.contact_email}</span>.
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-3 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Ringkasan pesanan */}
                            <div className="bg-[#1A1F2E] rounded-xl p-4 space-y-2.5 text-sm">
                                <InfoRow label="Customer" value={order.customer_name || '-'} />
                                <InfoRow label="Email Tujuan" value={order.contact_email || '-'} accent />
                                <InfoRow label="Tipe Order" value={ORDER_TYPE_LABEL[order.order_type] ?? order.order_type ?? 'VC'} />
                                <InfoRow label="Total Tagihan" value={formatRupiah(order.total_fee ?? 0)} accent />
                                <div className="pt-1 border-t border-gray-700">
                                    <label className="text-gray-400 mb-1.5 block">
                                        Detail Pesanan
                                        <span className="ml-1.5 text-xs text-amber-400">(bisa diedit sebelum kirim)</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={editNote}
                                        onChange={(e) => setEditNote(e.target.value)}
                                        className="w-full text-white text-xs leading-relaxed whitespace-pre-wrap bg-[#0F1420] rounded-lg px-3 py-2.5 border border-gray-700 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Preview info pembayaran yang akan dikirim */}
                            <div>
                                <p className="text-xs font-medium text-gray-400 mb-1.5">Info Pembayaran yang Dikirim</p>
                                <div className="bg-[#1A1F2E] border border-gray-700 rounded-lg px-4 py-3">
                                    <pre className="text-sm text-gray-200 font-mono whitespace-pre-wrap leading-relaxed">
                                        {PAYMENT_INFO}
                                    </pre>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex items-start gap-2 bg-red-900/30 border border-red-700/50 rounded-lg p-3 text-sm text-red-300">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── Footer ── */}
                {!sent && (
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-800">
                        <button
                            onClick={onClose}
                            disabled={sending}
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={sending}
                            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-60"
                        >
                            {sending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <Mail className="w-4 h-4" />
                                    Kirim Email Tagihan
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Sub-component ─────────────────────────────────────────────────────────────
function InfoRow({ label, value, accent = false }) {
    return (
        <div className="flex justify-between gap-4">
            <span className="text-gray-400 flex-shrink-0">{label}</span>
            <span className={`text-right font-medium truncate ${accent ? 'text-amber-300' : 'text-white'}`}>
                {value}
            </span>
        </div>
    );
}