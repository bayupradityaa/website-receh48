import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import { ErrorMessage } from "../components/shared/ErrorMessage";

/* =========================
   Reviews Slider (Supabase)
   ========================= */
function ReviewsSlider({ reviews }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!reviews || reviews.length <= 1) return;
    if (paused) return;

    const t = setInterval(() => {
      setActive((p) => (p + 1) % reviews.length);
    }, 3500);

    return () => clearInterval(t);
  }, [paused, reviews]);

  if (!reviews || reviews.length === 0) return null;

  const safeActive = Math.min(active, reviews.length - 1);
  const r = reviews[safeActive];

  const next = () => setActive((p) => (p + 1) % reviews.length);
  const prev = () => setActive((p) => (p - 1 + reviews.length) % reviews.length);

  return (
    <div
      className="relative max-w-5xl mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-primary-50 to-primary-100 p-1">
        <div className="bg-white rounded-3xl p-8 md:p-10">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold shadow-lg">
                W
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-dark-900 font-bold text-lg">
                    Warga #staywithreceh
                  </p>
                  <span className="inline-flex items-center text-xs font-bold px-2 py-1 rounded-full bg-primary-100 text-primary-700">
                    {r.service_type || "Layanan"}
                  </span>
                </div>

                <p className="text-dark-500 text-sm">
                  {r.created_at
                    ? new Date(r.created_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : ""}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
                    i < (r.rating || 0) ? "text-yellow-400" : "text-dark-200"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="mt-7 relative">
            <div className="absolute -top-8 -left-2 text-7xl font-bold text-primary-100 select-none">
              "
            </div>

            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-[carouselIn_420ms_cubic-bezier(0.2,0.8,0.2,1)]"
            >
              {items.map((r) => (
                <ReviewCard key={r.id} r={r} />
              ))}
            </div>

            <style>{`
              @keyframes carouselIn {
                from { opacity: 0; transform: translateX(26px) scale(0.985) rotate(0.2deg); }
                to   { opacity: 1; transform: translateX(0) scale(1) rotate(0deg); }
              }
            `}</style>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-3 rounded-full transition-all ${
                    i === safeActive
                      ? "bg-primary-600 w-8"
                      : "bg-primary-200 w-3 hover:bg-primary-300"
                  }`}
                />
              ))}
            </div>

            {reviews.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={prev}
                  className="w-10 h-10 rounded-full bg-dark-50 hover:bg-dark-100 border border-dark-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 text-dark-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={next}
                  className="w-10 h-10 rounded-full bg-dark-50 hover:bg-dark-100 border border-dark-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 text-dark-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="mt-5 text-sm text-dark-500">
            Menampilkan {safeActive + 1} dari {reviews.length} review
          </div>
        </div>
      </div>
    </div>
  );
}

function Stars({ rating = 0 }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < rating ? "text-yellow-400" : "text-dark-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ r }) {
  const dateText = r.created_at
    ? new Date(r.created_at).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className="relative group">
      {/* Strong shadow + lift */}
      <div className="absolute inset-0 rounded-[26px] bg-black/5 blur-xl translate-y-6 group-hover:translate-y-8 transition-transform duration-300" />

      {/* Gradient border */}
      <div className="absolute inset-0 rounded-[26px] p-[2px] bg-gradient-to-br from-primary-600 via-pink-500 to-yellow-300">
        <div className="h-full w-full rounded-[24px] bg-white/95" />
      </div>

      {/* Card */}
      <div className="relative rounded-[24px] bg-white/92 backdrop-blur-xl overflow-hidden border border-white/60 shadow-[0_25px_80px_-45px_rgba(0,0,0,0.55)] group-hover:shadow-[0_35px_100px_-55px_rgba(0,0,0,0.65)] transition-all duration-300">
        
        {/* Accent stripe (brand) */}
        <div className="absolute left-0 top-0 h-full w-[10px] bg-gradient-to-b from-primary-600 via-pink-500 to-yellow-300" />

        {/* Subtle top highlight */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-primary-100/60 to-transparent" />

        {/* Content */}
        <div className="relative p-7 md:p-8 pl-9">
          {/* Top row */}
          <div className="flex items-start justify-between gap-4">
            <Stars rating={r.rating || 0} />

            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-dark-900 text-white text-xs font-bold shadow">
                {(r.rating || 0).toFixed(1)}
              </div>
              <p className="text-sm text-dark-500 font-medium">{dateText}</p>
            </div>
          </div>

          {/* Quote + message */}
          <div className="mt-6 relative">
            <div className="absolute -top-7 -left-3 text-6xl font-black text-primary-200/60 select-none">
              "
            </div>
            <p className="relative text-dark-900 leading-relaxed text-[15px] md:text-base font-semibold">
              {r.message}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white flex items-center justify-center font-extrabold shadow-md">
                W
              </div>
              <div>
                <p className="font-extrabold text-dark-900 leading-tight">
                  Warga #staywithreceh
                </p>
                <p className="text-sm text-dark-600">
                  {r.service_type || "Layanan"}
                </p>
              </div>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.121 8.707a1 1 0 10-1.414 1.414l2.5 2.5a1 1 0 001.414 0l4.086-4.086z"
                  clipRule="evenodd"
                />
              </svg>
              Verified
            </div>
          </div>
        </div>

        {/* Shimmer */}
        <div className="absolute -left-48 top-0 h-full w-48 bg-gradient-to-r from-transparent via-white/70 to-transparent rotate-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-[680px] transition-all duration-700 pointer-events-none" />
      </div>
    </div>
  );
}


function ReviewsCarousel({ reviews = [] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const pages = Math.max(1, Math.ceil(reviews.length / 2));

  const prev = () => setIndex((p) => (p - 1 + pages) % pages);
  const next = () => setIndex((p) => (p + 1) % pages);

  useEffect(() => {
    if (paused) return;
    if (reviews.length <= 2) return;

    const t = setInterval(() => {
      setIndex((p) => (p + 1) % pages);
    }, 4500);

    return () => clearInterval(t);
  }, [paused, reviews.length, pages]);

  if (!reviews.length) return null;

  const start = index * 2;
  const items = reviews.slice(start, start + 2);

  return (
    <div
      className="relative max-w-6xl mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Arrows */}
      {reviews.length > 2 && (
        <>
          <button
            onClick={prev}
            className="hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg border border-dark-100 items-center justify-center hover:scale-105 transition"
            aria-label="Prev"
          >
            <svg className="w-6 h-6 text-dark-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={next}
            className="hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg border border-dark-100 items-center justify-center hover:scale-105 transition"
            aria-label="Next"
          >
            <svg className="w-6 h-6 text-dark-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Cards */}
      <div className="overflow-hidden">
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-8 animate-[slideIn_350ms_ease-out]"
        >
          {items.map((r) => (
            <ReviewCard key={r.id} r={r} />
          ))}
        </div>

        <style>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(16px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </div>

      {/* Dots */}
      {pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-3 rounded-full transition-all ${
                i === index ? "bg-primary-600 w-8" : "bg-primary-200 w-3 hover:bg-primary-300"
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Mobile buttons */}
      {reviews.length > 2 && (
        <div className="mt-6 flex md:hidden items-center justify-center gap-3">
          <button
            onClick={prev}
            className="w-11 h-11 rounded-full bg-white shadow border border-dark-100 flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-dark-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="w-11 h-11 rounded-full bg-white shadow border border-dark-100 flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-dark-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}


/* =========================
   FAQ Section
   ========================= */
const faqData = [
  {
    q: "Apa itu layanan Joki Tiket Receh48?",
    a: "Receh48 adalah layanan joki tiket terpercaya untuk event JKT48, mulai dari Video Call, Meet & Greet, 2-Shot, hingga Konser. Kami hadir buat kamu yang mau beli slot tapi terbatas waktu, takut kehabisan, atau butuh bantuan prosesnya dari awal sampai selesai.",
    emoji: "🎟️",
  },
  {
    q: "Apakah layanan ini aman dan terpercaya?",
    a: "100% aman! Receh48 sudah melayani 500+ pesanan dengan tingkat kepuasan 98%. Semua transaksi terdokumentasi dan kami berkomitmen penuh untuk menjaga kepercayaan setiap pelanggan. Cek thread review kami di X (Twitter) untuk bukti nyata #staywithreceh.",
    emoji: "🔒",
  },
  {
    q: "Bagaimana cara memesan layanan Joki di Receh48?",
    a: "Mudah banget! Klik tombol 'Form Pemesanan' → pilih 'Form Joki (sesuai apa yang kalian mau)' → isi form dengan detail pesanan kamu (member pilihan, slot, dll) → tim kami akan segera menghubungi kamu via DM atau kontak yang kamu cantumkan. Fast response dijamin! ⚡",
    emoji: "📋",
  },
  {
    q: "Berapa lama proses setelah pemesanan?",
    a: "Tim kami akan merespons pesanan kamu dalam waktu kurang dari 1 jam (selama jam operasional). Proses joki dilakukan sesuai jadwal event yang sudah ditentukan. Kami pastikan kamu dapat update real-time selama proses berlangsung.",
    emoji: "⏱️",
  },
  {
    q: "Metode pembayaran apa yang tersedia?",
    a: "Kami menerima berbagai metode pembayaran termasuk transfer bank, e-wallet (GoPay, OVO, Dana, ShopeePay), serta QRIS. Detail pembayaran akan diberikan saat konfirmasi pesanan. Kami juga tersedia di Shopee untuk transaksi lebih aman!",
    emoji: "💳",
  },
  {
    q: "Pembayarannya setelah atau sebelum joki?",
    a: "Untuk pembayaran fee joki di kita yaitu setelag mendapatkan tiket, jadi kalian melakukan pembayaran setelah menerima email tiket yang kalian pesan dengan kata lain bayarnya belakangan.",
    emoji: "🛡️",
  },
  {
    q: "Bisa request member JKT48 tertentu?",
    a: "Bisa! Kamu bebas request member favorit kamu (oshi). Saat mengisi form pemesanan, ada kolom khusus untuk memilih member yang diinginkan. Kami akan semaksimal mungkin memenuhi permintaan kamu sesuai ketersediaan slot.",
    emoji: "⭐",
  },
];

function FAQSection() {
  const [open, setOpen] = useState(null);
  const toggle = (i) => setOpen(open === i ? null : i);

  return (
    <section id="faq" className="relative overflow-hidden py-24 text-white">
      {/* Base */}
      <div className="absolute inset-0 bg-[#06070A]" />

      {/* Glow blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[860px] h-[860px] rounded-full bg-amber-400/10 blur-[140px]" />
        <div className="absolute -bottom-60 -right-48 w-[720px] h-[720px] rounded-full bg-primary-600/10 blur-[140px]" />
        <div className="absolute top-1/2 -left-48 w-[520px] h-[520px] rounded-full bg-yellow-300/8 blur-[120px]" />
      </div>

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.09] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10 max-w-4xl">

        {/* Title */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-300/10 border border-amber-300/20 text-amber-200 text-sm font-bold mb-5 tracking-wide">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            FAQ
          </div>

          <h2 className="text-3xl md:text-5xl font-display font-extrabold leading-tight">
            Ada Pertanyaan?{" "}
            <span className="block mt-1 bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
              Kami Punya Jawabannya
            </span>
          </h2>

          <p className="text-white/60 mt-4 text-lg max-w-xl mx-auto">
            Semua yang perlu kamu tahu tentang layanan Receh48, dijawab tuntas di sini 💬
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqData.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`group relative rounded-2xl transition-all duration-300 ${
                  isOpen
                    ? "bg-gradient-to-br from-amber-300/8 to-yellow-200/5 border border-amber-300/30 shadow-[0_0_60px_-20px_rgba(255,215,130,0.18)]"
                    : "bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.06]"
                }`}
              >
                {/* Left accent bar when open */}
                {isOpen && (
                  <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-gradient-to-b from-amber-300 via-yellow-200 to-amber-400" />
                )}

                {/* Question row */}
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center gap-4 px-6 py-5 text-left"
                >
                  {/* Emoji badge */}
                  <div
                    className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all duration-300 ${
                      isOpen
                        ? "bg-gradient-to-br from-amber-300/30 to-yellow-200/20 border border-amber-300/30"
                        : "bg-white/[0.07] border border-white/[0.08] group-hover:bg-white/[0.10]"
                    }`}
                  >
                    {faq.emoji}
                  </div>

                  <span
                    className={`flex-1 font-bold text-[15px] md:text-base leading-snug transition-colors duration-300 ${
                      isOpen ? "text-amber-200" : "text-white/90"
                    }`}
                  >
                    {faq.q}
                  </span>

                  {/* Chevron */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isOpen
                        ? "bg-amber-300/20 border border-amber-300/30 rotate-180"
                        : "bg-white/[0.07] border border-white/[0.08]"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 transition-colors duration-300 ${isOpen ? "text-amber-200" : "text-white/60"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Answer */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6 pl-[4.75rem]">
                    <p className="text-white/70 leading-relaxed text-[15px]">{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA bottom */}
        <div className="mt-14 text-center">
          <div className="inline-block rounded-3xl p-[1.5px] bg-gradient-to-br from-amber-300/50 via-primary-500/25 to-yellow-200/35">
            <div className="rounded-[22px] bg-white/5 backdrop-blur border border-transparent px-8 py-7">
              <p className="text-white/80 font-semibold text-lg mb-1">
                Masih ada pertanyaan lain?
              </p>
              <p className="text-white/50 text-sm mb-5">
                Hubungi kami langsung
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://x.com/receh_48"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold
                    bg-gradient-to-r from-amber-300 to-yellow-200 text-black hover:brightness-95
                    shadow-[0_15px_60px_-30px_rgba(255,215,130,0.50)] transition-all text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  DM di X (Twitter)
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


/* ==============
   Home Component
   ============== */
export default function Home() {
  // timetable images
  const [timetableImages, setTimetableImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(true);
  const [error, setError] = useState(null);

  // reviews from supabase
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(null);

  // UI
  const words = ["Specialist Joki", "Fast Response", "Aman & Terpercaya", "#staywithreceh"];
  const [animatedText, setAnimatedText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFormDropdown, setShowFormDropdown] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchTimetableImages();
    fetchReviews();
  }, []);

  /* ------- Fetch timetable images ------- */
  async function fetchTimetableImages() {
    try {
      setImagesLoading(true);
      setError(null);

      const { data, error: e } = await supabase
        .from("timetable_images")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (e) throw e;

      const imageUrls = (data || []).map((img) => img.image_url).filter(Boolean);
      setTimetableImages(imageUrls);
    } catch (err) {
      console.error("Error fetching timetable images:", err);
      setError(err?.message || "Gagal memuat timetable images.");
      setTimetableImages([]);
    } finally {
      setImagesLoading(false);
    }
  }

  /* ------- Fetch reviews (approved only) ------- */
  async function fetchReviews() {
    try {
      setReviewsLoading(true);
      setReviewsError(null);

      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, service_type, message, created_at")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(12);

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviewsError(err?.message || "Gagal memuat review.");
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }

  /* ------- Typing effect ------- */
  useEffect(() => {
    const currentWord = words[wordIndex % words.length];

    const typingSpeed = isDeleting ? 45 : 90;
    const pauseBeforeDelete = 1200;
    const pauseBeforeNext = 450;

    const timeout = setTimeout(() => {
      if (!isDeleting && animatedText === currentWord) {
        setTimeout(() => setIsDeleting(true), pauseBeforeDelete);
        return;
      }

      if (isDeleting && animatedText === "") {
        setIsDeleting(false);
        setWordIndex((p) => (p + 1) % words.length);
        return;
      }

      const nextText = isDeleting
        ? currentWord.substring(0, animatedText.length - 1)
        : currentWord.substring(0, animatedText.length + 1);

      setAnimatedText(nextText);
    }, animatedText === currentWord && !isDeleting ? pauseBeforeDelete : typingSpeed);

    return () => clearTimeout(timeout);
  }, [animatedText, isDeleting, wordIndex]);

  /* ------- Auto slide timetable ------- */
  useEffect(() => {
    if (timetableImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % timetableImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [timetableImages]);

  const hasTimetable = timetableImages.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ========================
          Hero Section
          ======================== */}
      <section
        id="home"
        className="relative min-h-screen overflow-hidden py-24 text-white"
      >
        {/* Background base */}
        <div className="absolute inset-0 bg-[#06070A]" />

        {/* Soft gold spotlight + red tint (brand) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-56 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-amber-400/18 blur-[120px]" />
          <div className="absolute -bottom-72 -left-48 w-[720px] h-[720px] rounded-full bg-primary-600/18 blur-[130px]" />
          <div className="absolute -top-40 -right-40 w-[620px] h-[620px] rounded-full bg-yellow-300/10 blur-[120px]" />
        </div>

        {/* Subtle grid + noise */}
        <div
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_55%)] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* LEFT - Logo card */}
            <div className="order-2 lg:order-1 lg:flex lg:justify-center">
              <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] mx-auto lg:mx-0">
                {/* outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/60 via-primary-500/40 to-yellow-200/40 blur-2xl opacity-80" />
                {/* ring */}
                <div className="absolute inset-0 rounded-full p-[3px] bg-gradient-to-br from-amber-300 via-primary-500 to-yellow-200">
                  <div className="w-full h-full rounded-full bg-black/60 backdrop-blur" />
                </div>

                {/* logo */}
                <img
                  src="https://pbs.twimg.com/profile_images/1810271835117981696/ypceIB66_400x400.jpg"
                  alt="Receh48 Logo"
                  className="absolute inset-[10px] rounded-full object-cover shadow-[0_30px_120px_-60px_rgba(255,210,120,0.55)]"
                />

                {/* floating badges */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/15 backdrop-blur">
                    ⭐ Trusted
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-300/15 text-amber-200 border border-amber-200/20 backdrop-blur">
                    #staywithreceh
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT - Content */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold leading-tight">
                Hi, Welcome
                <span className="block mt-2">
                  <span className="text-white">Receh48</span>{" "}
                  <span className="bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                    {animatedText}
                  </span>
                  <span className="ml-2 inline-block w-1 h-10 bg-amber-200/80 animate-pulse align-middle" />
                </span>
              </h1>

              <p className="mt-5 text-lg sm:text-xl text-white/80 max-w-xl mx-auto lg:mx-0">
                Specialist Joki Tiket VideoCall, Meet n Greet, 2-Shot, Konser JKT48.  
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-300 to-yellow-200 text-black hover:brightness-95 shadow-[0_20px_80px_-40px_rgba(255,215,130,0.70)]"
                  onClick={() => setShowFormDropdown(!showFormDropdown)}
                >
                  <span className="flex items-center gap-2">
                    Form Pemesanan
                    <svg
                      className={`w-4 h-4 transition-transform ${showFormDropdown ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </Button>

                <Link
                  to="/reviews"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold
                    bg-white/10 hover:bg-white/15 border border-white/15 text-white shadow-lg transition-all"
                >
                  ⭐ Lihat Review
                </Link>
              </div>

              {/* Dropdown form */}
              {showFormDropdown && (
                <div className="relative mt-3 max-w-[240px] mx-auto lg:mx-0">
                  <div className="absolute top-2 left-0 right-0 rounded-2xl bg-black/60 backdrop-blur border border-white/15 shadow-2xl overflow-hidden z-50">
                    <Link
                      to="/video-call"
                      className="block px-6 py-3 text-white/90 hover:bg-white/10 transition-colors"
                    >
                      Form Joki Video Call
                    </Link>
                    <Link
                      to="/twoshot"
                      className="block px-6 py-3 text-white/90 hover:bg-white/10 transition-colors"
                    >
                      Form Joki 2-Shoot
                    </Link>
                    <Link
                      to="/meet-greet"
                      className="block px-6 py-3 text-white/90 hover:bg-white/10 transition-colors"
                    >
                      Form Meet And Greet
                    </Link>
                  </div>
                </div>
              )}

              {/* Social */}
              <div className="mt-10 flex flex-col items-center lg:items-start gap-4">
                <p className="text-base font-semibold text-white/85">Contact Us</p>
                <div className="flex items-center gap-4">
                  <a
                    href="https://x.com/receh_48"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center transition-all hover:scale-110"
                  >
                    <svg className="w-6 h-6 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ========================
          TimeTable Section
          ======================== */}
      <section id="timetable" className="relative overflow-hidden py-20 text-white">
        {/* base */}
        <div className="absolute inset-0 bg-[#06070A]" />

        {/* glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-56 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-amber-400/14 blur-[130px]" />
          <div className="absolute -bottom-72 -left-48 w-[720px] h-[720px] rounded-full bg-primary-600/14 blur-[140px]" />
        </div>

        {/* grid */}
        <div
          className="absolute inset-0 opacity-[0.10] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-display font-extrabold">
              Time<span className="bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400 bg-clip-text text-transparent">Table</span>
            </h2>
            <p className="text-white/70 mt-3 text-lg">Jadwal terbaru biar gak miss moment ✨</p>
          </div>

          {/* glass card */}
          <div className="max-w-5xl mx-auto">
            <div className="rounded-[28px] p-[2px] bg-gradient-to-br from-amber-300/50 via-primary-500/25 to-yellow-200/35 shadow-[0_35px_120px_-70px_rgba(255,215,130,0.35)]">
              <div className="rounded-[26px] bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                {imagesLoading ? (
                  <div className="h-96 md:h-[520px] flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : error ? (
                  <div className="p-8">
                    <ErrorMessage message={error} />
                  </div>
                ) : !hasTimetable ? (
                  <div className="h-96 md:h-[520px] flex items-center justify-center text-white/70 font-semibold">
                    Timetable belum tersedia
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative h-96 md:h-[520px] bg-black/40">
                      {timetableImages.map((img, index) => (
                        <div
                          key={index}
                          className={`absolute inset-0 transition-opacity duration-500 ${
                            index === currentSlide ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Timetable ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer hover:scale-[1.03] transition-transform duration-300"
                            onClick={() => setLightboxImage(img)}
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/800x450/e5e7eb/6b7280?text=Image+Not+Available";
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {timetableImages.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setCurrentSlide((p) => (p - 1 + timetableImages.length) % timetableImages.length)
                          }
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full
                            bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur
                            flex items-center justify-center transition-all hover:scale-105"
                        >
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        <button
                          onClick={() => setCurrentSlide((p) => (p + 1) % timetableImages.length)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full
                            bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur
                            flex items-center justify-center transition-all hover:scale-105"
                        >
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {timetableImages.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentSlide(i)}
                              className={`h-3 rounded-full transition-all ${
                                i === currentSlide ? "bg-amber-200 w-8" : "bg-white/30 w-3 hover:bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <p className="text-center text-sm text-white/60 mt-6">
              Klik gambar untuk memperbesar.
            </p>
          </div>
        </div>
      </section>


      {/* ========================
          Services Section
          ======================== */}
      <section className="relative overflow-hidden py-20 text-white">
        <div className="absolute inset-0 bg-[#06070A]" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-56 -right-56 w-[820px] h-[820px] rounded-full bg-amber-400/12 blur-[140px]" />
          <div className="absolute -bottom-72 -left-52 w-[720px] h-[720px] rounded-full bg-primary-600/12 blur-[140px]" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.10] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-display font-extrabold">
              Layanan{" "}
              <span className="bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                Kami
              </span>
            </h2>
            <p className="text-white/70 text-lg mt-3">Pilih layanan joki yang Anda butuhkan</p>
          </div>

          {/* cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {/* VC */}
            <Link to="/video-call">
              <div className="group cursor-pointer">
                <div className="rounded-3xl p-[2px] bg-gradient-to-br from-amber-300/50 via-primary-500/30 to-yellow-200/40">
                  <div className="relative overflow-hidden rounded-[22px] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl hover:shadow-[0_30px_120px_-70px_rgba(255,215,130,0.45)] transition-all duration-300">
                    <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-400/18 rounded-full blur-3xl" />
                    <div className="p-8 relative">
                      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-white/10">
                        <svg className="w-8 h-8 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>

                      <h3 className="text-2xl font-extrabold mb-3">Joki Video Call</h3>
                      <p className="text-white/70 mb-5">
                        Layanan joki untuk mengikuti sesi video call dengan member JKT48 pilihan Anda
                      </p>

                      <div className="flex items-center gap-2 text-sm font-bold text-amber-200">
                        <span>Pesan Sekarang</span>
                        <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    <div className="absolute top-4 right-4">
                      <div className="bg-amber-300/15 text-amber-200 border border-amber-200/20 px-3 py-1 rounded-full text-xs font-extrabold backdrop-blur">
                        TERSEDIA
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Joki Meet & Greet */}
            <Link to="/meet-greet">
              <div className="group cursor-pointer">
                <div className="rounded-3xl p-[2px] bg-gradient-to-br from-amber-300/50 via-primary-500/30 to-yellow-200/40">
                  <div className="relative overflow-hidden rounded-[22px] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl hover:shadow-[0_30px_120px_-70px_rgba(255,215,130,0.45)] transition-all duration-300">
                    <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-400/18 rounded-full blur-3xl" />
                    <div className="p-8 relative">
                      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-white/10">
                        {/* icon Users */}
                        <svg className="w-8 h-8 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>

                      <h3 className="text-2xl font-extrabold mb-3">Joki Meet &amp; Greet</h3>
                      <p className="text-white/70 mb-5">
                        Joki meet &amp; greet dengan member favorit Anda. Dapatkan kesempatan bertemu langsung!
                      </p>

                      <div className="flex items-center gap-2 text-sm font-bold text-amber-200">
                        <span>Pesan Sekarang</span>
                        <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    <div className="absolute top-4 right-4">
                      <div className="bg-amber-300/15 text-amber-200 border border-amber-200/20 px-3 py-1 rounded-full text-xs font-extrabold backdrop-blur">
                        TERSEDIA
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Joki 2-Shot */}
            <Link to="/twoshot">
              <div className="group cursor-pointer">
                <div className="rounded-3xl p-[2px] bg-gradient-to-br from-amber-300/50 via-primary-500/30 to-yellow-200/40">
                  <div className="relative overflow-hidden rounded-[22px] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl hover:shadow-[0_30px_120px_-70px_rgba(255,215,130,0.45)] transition-all duration-300">
                    <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-400/18 rounded-full blur-3xl" />
                    <div className="p-8 relative">
                      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-white/10">
                        <svg className="w-8 h-8 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>

                      <h3 className="text-2xl font-extrabold mb-3">Joki 2-Shoot</h3>
                      <p className="text-white/70 mb-5">
                        Joki sesi foto bersama member JKT48. Abadikan momen berharga bersama oshi!
                      </p>

                      <div className="flex items-center gap-2 text-sm font-bold text-amber-200">
                        <span>Pesan Sekarang</span>
                        <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    <div className="absolute top-4 right-4">
                      <div className="bg-amber-300/15 text-amber-200 border border-amber-200/20 px-3 py-1 rounded-full text-xs font-extrabold backdrop-blur">
                        TERSEDIA
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: "500+", label: "Pesanan Selesai" },
              { value: "98%", label: "Kepuasan Pelanggan" },
              { value: "24/7", label: "Customer Support" },
              { value: "100%", label: "Aman & Terpercaya" },
            ].map((s) => (
              <div key={s.label} className="text-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur p-6">
                <div className="text-4xl font-extrabold bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400 bg-clip-text text-transparent mb-2">
                  {s.value}
                </div>
                <div className="text-white/70 font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ========================
          Testimoni Section (Supabase)
          ======================== */}
      <section id="testi" className="relative overflow-hidden py-20 text-white">
        {/* base */}
        <div className="absolute inset-0 bg-[#06070A]" />

        {/* glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-56 -left-56 w-[820px] h-[820px] rounded-full bg-primary-600/12 blur-[140px]" />
          <div className="absolute -bottom-72 -right-52 w-[860px] h-[860px] rounded-full bg-amber-400/12 blur-[150px]" />
        </div>

        {/* grid */}
        <div
          className="absolute inset-0 opacity-[0.10] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Title */}
            <div className="text-center mb-12">
              <h3 className="text-4xl md:text-5xl font-extrabold">
                Testimoni{" "}
                <span className="bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                  Mereka
                </span>
              </h3>

              <p className="text-white/70 text-lg max-w-2xl mx-auto mt-3">
                Ini kata mereka setelah pakai layanan Receh48 💖
              </p>

              {/* Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/review"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-semibold
                    bg-gradient-to-r from-amber-300 to-yellow-200 text-black hover:brightness-95
                    shadow-[0_20px_80px_-45px_rgba(255,215,130,0.55)] transition-all"
                >
                  Tulis Review
                </Link>

                <Link
                  to="/reviews"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-semibold
                    bg-white/10 hover:bg-white/15 border border-white/15 text-white shadow-lg transition-all"
                >
                  View All
                </Link>

                <a
                  href="https://x.com/receh_48/status/1818337639571112436"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-semibold
                    bg-white/10 hover:bg-white/15 border border-white/15 text-white shadow-lg transition-all"
                >
                  Lihat Thread X
                </a>
              </div>
            </div>

            {/* Reviews content */}
            {reviewsLoading ? (
              <div className="rounded-3xl bg-white/5 backdrop-blur border border-white/10 shadow-2xl p-12 flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : reviewsError ? (
              <div className="rounded-3xl bg-white/5 backdrop-blur border border-white/10 shadow-2xl p-8">
                <ErrorMessage message={reviewsError} />
              </div>
            ) : reviews.length === 0 ? (
              <div className="rounded-3xl bg-white/5 backdrop-blur border border-white/10 shadow-2xl p-12 text-center">
                <p className="text-white font-extrabold text-lg">
                  Belum ada review yang tampil 😢
                </p>
                <p className="text-white/70 mt-2">
                  Jadi yang pertama yuk, biar makin ramai #staywithreceh 💖
                </p>

                <div className="mt-6">
                  <Link
                    to="/review"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold
                      bg-gradient-to-r from-amber-300 to-yellow-200 text-black hover:brightness-95 transition-all"
                  >
                    Tulis Review Sekarang
                  </Link>
                </div>
              </div>
            ) : (
              <ReviewsCarousel reviews={reviews} />
            )}
          </div>
        </div>
      </section>


      {/* ========================
          FAQ Section
          ======================== */}
      <FAQSection />


      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-2xl transition-colors"
          >
            ×
          </button>

          <img
            src={lightboxImage}
            alt="Lightbox"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}