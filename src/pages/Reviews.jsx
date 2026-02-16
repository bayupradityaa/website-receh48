import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import { ErrorMessage } from "../components/shared/ErrorMessage";

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

// Pakai card style yang kamu sudah suka (versi keren)
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
      <div className="absolute inset-0 rounded-[26px] bg-black/5 blur-xl translate-y-6 group-hover:translate-y-8 transition-transform duration-300" />

      <div className="absolute inset-0 rounded-[26px] p-[2px] bg-gradient-to-br from-primary-600 via-pink-500 to-yellow-300">
        <div className="h-full w-full rounded-[24px] bg-white/95" />
      </div>

      <div className="relative rounded-[24px] bg-white/92 backdrop-blur-xl overflow-hidden border border-white/60 shadow-[0_25px_80px_-45px_rgba(0,0,0,0.55)] transition-all duration-300">
        <div className="absolute left-0 top-0 h-full w-[10px] bg-gradient-to-b from-primary-600 via-pink-500 to-yellow-300" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-primary-100/60 to-transparent" />

        <div className="relative p-7 md:p-8 pl-9">
          <div className="flex items-start justify-between gap-4">
            <Stars rating={r.rating || 0} />

            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-dark-900 text-white text-xs font-bold shadow">
                {(r.rating || 0).toFixed(1)}
              </div>
              <p className="text-sm text-dark-500 font-medium">{dateText}</p>
            </div>
          </div>

          <div className="mt-6 relative">
            <div className="absolute -top-7 -left-3 text-6xl font-black text-primary-200/60 select-none">
              “
            </div>
            <p className="relative text-dark-900 leading-relaxed text-[15px] md:text-base font-semibold">
              {r.message}
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white flex items-center justify-center font-extrabold shadow-md">
                W
              </div>
              <div>
                <p className="font-extrabold text-dark-900 leading-tight">
                  Warga #staywithreceh
                </p>
                <p className="text-sm text-dark-600">{r.service_type || "Layanan"}</p>
              </div>
            </div>

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
      </div>
    </div>
  );
}

export default function Reviews() {
  const PAGE_SIZE = 8;

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [service, setService] = useState("ALL");
  const [page, setPage] = useState(1);

  // daftar layanan untuk filter (ambil dari DB biar otomatis)
  const [serviceOptions, setServiceOptions] = useState(["ALL"]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  useEffect(() => {
    fetchServiceOptions();
  }, []);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, service]);

  // search pakai debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchReviews();
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function fetchServiceOptions() {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("service_type")
        .eq("is_approved", true);

      if (error) throw error;

      const set = new Set(
        (data || [])
          .map((x) => x.service_type)
          .filter(Boolean)
          .map((x) => String(x).trim())
      );

      setServiceOptions(["ALL", ...Array.from(set)]);
    } catch {
      setServiceOptions(["ALL"]);
    }
  }

  async function fetchReviews() {
    try {
      setLoading(true);
      setError("");

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // query data
      let query = supabase
        .from("reviews")
        .select("id, rating, service_type, message, created_at", { count: "exact" })
        .eq("is_approved", true);

      if (service !== "ALL") query = query.eq("service_type", service);

      // search: pakai ilike di message
      if (q.trim()) {
        query = query.ilike("message", `%${q.trim()}%`);
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setItems(data || []);
      setTotal(count || 0);
    } catch (err) {
      setError(err?.message || "Gagal memuat reviews.");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-dark-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-dark-900">
                Semua <span className="text-primary-600">Review</span>
              </h1>
              <p className="text-dark-600 mt-2">
                Review yang sudah di-approve admin. Total: <span className="font-bold">{total}</span>
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                to="/"
                className="px-5 py-3 rounded-xl bg-white border border-dark-100 shadow-sm font-semibold hover:bg-dark-50 transition"
              >
                ← Back Home
              </Link>
              <Link
                to="/review"
                className="px-5 py-3 rounded-xl bg-primary-600 text-white shadow-lg font-semibold hover:bg-primary-700 transition"
              >
                Tulis Review
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/80 backdrop-blur rounded-2xl border border-dark-100 shadow-lg p-5 md:p-6 mb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-bold text-dark-700">Cari review</label>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="contoh: admin cepat / recommended / aman..."
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-dark-700">Filter layanan</label>
                <select
                  value={service}
                  onChange={(e) => {
                    setService(e.target.value);
                    setPage(1);
                  }}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
                >
                  {serviceOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === "ALL" ? "Semua Layanan" : opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end justify-between gap-3">
                <div className="text-sm text-dark-600">
                  Halaman <span className="font-bold">{page}</span> / {totalPages}
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={!canPrev}
                    onClick={() => setPage((p) => p - 1)}
                    className={`px-4 py-3 rounded-xl font-semibold border transition ${
                      canPrev
                        ? "bg-white hover:bg-dark-50 border-dark-200"
                        : "bg-dark-50 border-dark-100 text-dark-300 cursor-not-allowed"
                    }`}
                  >
                    Prev
                  </button>
                  <button
                    disabled={!canNext}
                    onClick={() => setPage((p) => p + 1)}
                    className={`px-4 py-3 rounded-xl font-semibold border transition ${
                      canNext
                        ? "bg-dark-900 hover:bg-dark-800 text-white border-dark-900"
                        : "bg-dark-50 border-dark-100 text-dark-300 cursor-not-allowed"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="rounded-3xl bg-white/70 backdrop-blur shadow-xl p-12 flex items-center justify-center border border-dark-100">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <ErrorMessage message={error} />
          ) : items.length === 0 ? (
            <div className="rounded-3xl border border-dark-100 bg-white/70 backdrop-blur shadow-xl p-12 text-center">
              <p className="text-dark-900 font-bold text-lg">Tidak ada hasil.</p>
              <p className="text-dark-600 mt-2">Coba ubah kata kunci atau filter layanan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {items.map((r) => (
                <ReviewCard key={r.id} r={r} />
              ))}
            </div>
          )}

          {/* Bottom pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-3">
              <button
                disabled={!canPrev}
                onClick={() => setPage((p) => p - 1)}
                className={`w-12 h-12 rounded-full border shadow-sm transition ${
                  canPrev
                    ? "bg-white hover:bg-dark-50 border-dark-200"
                    : "bg-dark-50 border-dark-100 text-dark-300 cursor-not-allowed"
                }`}
                aria-label="Prev"
              >
                ‹
              </button>

              <div className="px-4 py-2 rounded-full bg-white border border-dark-100 shadow-sm text-sm font-semibold">
                Page {page} / {totalPages}
              </div>

              <button
                disabled={!canNext}
                onClick={() => setPage((p) => p + 1)}
                className={`w-12 h-12 rounded-full border shadow-sm transition ${
                  canNext
                    ? "bg-dark-900 hover:bg-dark-800 text-white border-dark-900"
                    : "bg-dark-50 border-dark-100 text-dark-300 cursor-not-allowed"
                }`}
                aria-label="Next"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
