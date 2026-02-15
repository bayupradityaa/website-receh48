import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ErrorMessage } from "../components/shared/ErrorMessage";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";

const SERVICE_OPTIONS = [
  { value: "Joki VC", label: "Joki Video Call" },
  { value: "Joki MNG", label: "Joki Meet & Greet" },
  { value: "Joki 2S", label: "Joki 2-Shot" },
  { value: "Lainnya", label: "Lainnya" },
];

function StarPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              active ? "bg-yellow-100" : "bg-dark-50 hover:bg-dark-100"
            }`}
            aria-label={`Rate ${star} stars`}
          >
            <svg
              className={`w-6 h-6 ${active ? "text-yellow-400" : "text-dark-300"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

export default function ReviewPage() {
  const [name, setName] = useState("");
  const [serviceType, setServiceType] = useState(SERVICE_OPTIONS[0].value);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");

  // Honeypot anti-bot (disembunyikan)
  const [website, setWebsite] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Cooldown anti-spam ringan (client-side)
  const COOLDOWN_KEY = "review_last_submit_at";
  const COOLDOWN_MS = 60_000; // 60 detik

  const now = Date.now();
  const nextAllowedAt = useMemo(() => {
    const last = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    return last + COOLDOWN_MS;
  }, [success]);

  const remainingMs = Math.max(0, nextAllowedAt - now);
  const isCooldown = remainingMs > 0;

  useEffect(() => {
    // supaya countdown terasa, trigger re-render tiap 1 detik
    if (!isCooldown) return;
    const t = setInterval(() => {}, 1000);
    return () => clearInterval(t);
  }, [isCooldown]);

  function validate() {
    const cleanName = (name || "").trim();
    const cleanMessage = (message || "").trim();

    if (website.trim().length > 0) return "Spam terdeteksi.";
    if (cleanName.length < 2) return "Nama minimal 2 karakter (atau isi 'Anonim').";
    if (cleanMessage.length < 10) return "Pesan testimoni minimal 10 karakter.";
    if (cleanMessage.length > 500) return "Pesan terlalu panjang (maks 500 karakter).";
    if (rating < 1 || rating > 5) return "Rating harus 1 sampai 5.";
    if (!serviceType) return "Pilih jenis layanan.";
    if (isCooldown) return `Tunggu sebentar sebelum kirim lagi.`;
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: name.trim(),
        service_type: serviceType,
        rating,
        message: message.trim(),
        is_approved: false, // penting: RLS juga memaksa false
      };

      const { error: insertError } = await supabase.from("reviews").insert(payload);
      if (insertError) throw insertError;

      localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
      setSuccess(true);
      setName("");
      setServiceType(SERVICE_OPTIONS[0].value);
      setRating(5);
      setMessage("");
    } catch (e2) {
      setError(e2?.message || "Gagal mengirim review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link to="/" className="text-primary-700 hover:text-primary-800 font-semibold">
              ← Kembali ke Home
            </Link>
          </div>

          <Card className="p-8 rounded-3xl shadow-xl">
            <h1 className="text-3xl font-bold text-dark-900 mb-2">Tulis Review</h1>

            {error && <ErrorMessage message={error} />}
            {success && (
              <div className="p-4 rounded-xl bg-green-50 text-green-800 font-semibold mb-4">
                Review berhasil dikirim! ✅ 
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Honeypot hidden */}
              <div className="hidden">
                <label>Website</label>
                <input value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>

              <div>
                <label className="block font-semibold text-dark-800 mb-2">Nama</label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
                  placeholder="Misal: Nur Intan / Anonim"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block font-semibold text-dark-800 mb-2">Layanan</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                >
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-dark-800 mb-2">Rating</label>
                <StarPicker value={rating} onChange={setRating} />
              </div>

              <div>
                <label className="block font-semibold text-dark-800 mb-2">Pesan</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white min-h-[140px]"
                  placeholder="Ceritain pengalaman kamu…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                />
                <div className="text-sm text-dark-500 mt-1">
                  {message.length}/500
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                disabled={submitting || isCooldown}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" /> Mengirim...
                  </span>
                ) : isCooldown ? (
                  "Tunggu sebentar..."
                ) : (
                  "Kirim Review"
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
