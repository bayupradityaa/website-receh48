import { useState } from "react";
import { useServiceStatus } from "./hooks/useServiceStatus";

// =============================================
//  ServiceStatusManagement — Minimalis
//  Lokasi: src/pages/admin/settings/ServiceStatusManagement.jsx
// =============================================

const STATUS_OPTIONS = [
  { value: "OPEN",        label: "Open",        dot: "bg-emerald-400", text: "text-emerald-400" },
  { value: "CLOSED",      label: "Closed",      dot: "bg-red-400",     text: "text-red-400"     },
  { value: "FULL_SLOT",   label: "Full Slot",   dot: "bg-orange-400",  text: "text-orange-400"  },
  { value: "COMING_SOON", label: "Coming Soon", dot: "bg-blue-400",    text: "text-blue-400"    },
];

const STATUS_ICON = {
  video_call: "📹",
  two_shot:   "📸",
};

const BANNER_CONFIG = {
  OPEN:        { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400", label: "Open — form aktif" },
  CLOSED:      { bg: "bg-red-500/10 border-red-500/20",         text: "text-red-400",     label: "Layanan Ditutup Sementara" },
  FULL_SLOT:   { bg: "bg-orange-500/10 border-orange-500/20",   text: "text-orange-400",  label: "Slot Penuh" },
  COMING_SOON: { bg: "bg-blue-500/10 border-blue-500/20",       text: "text-blue-400",    label: "Segera Hadir" },
};

function ServiceCard({ service, onSave, saving }) {
  const [status,       setStatus]       = useState(service.status);
  const [message,      setMessage]      = useState(service.message || "");
  const [showPreview,  setShowPreview]  = useState(false);
  const [saved,        setSaved]        = useState(false);

  const isDirty = status !== service.status || message !== (service.message || "");

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === status);
  const liveStatus    = STATUS_OPTIONS.find((s) => s.value === service.status);
  const bannerCfg     = BANNER_CONFIG[status];

  async function handleSave() {
    const result = await onSave(service.id, status, message.trim() || null);
    if (result?.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  return (
    <div className="bg-[#12161F] border border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-xl">{STATUS_ICON[service.service_key] || "⚙️"}</span>
          <div>
            <p className="font-bold text-white text-sm">{service.service_name}</p>
            <p className="text-gray-500 text-xs font-mono">{service.service_key}</p>
          </div>
        </div>

        {/* Live badge */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
          <span className={`w-2 h-2 rounded-full animate-pulse ${liveStatus?.dot}`} />
          LIVE: <span className={liveStatus?.text}>{liveStatus?.label}</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">

        {/* Status dropdown */}
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm text-gray-400 font-medium shrink-0">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`
              flex-1 max-w-[200px] px-3 py-2 rounded-lg text-sm font-semibold
              bg-[#0A0E17] border border-gray-700
              focus:outline-none focus:ring-1 focus:ring-amber-400/40
              ${currentStatus?.text}
            `}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="text-white font-normal">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Pesan custom — hanya muncul kalau bukan OPEN */}
        {status !== "OPEN" && (
          <div className="flex items-start gap-4">
            <label className="text-sm text-gray-400 font-medium shrink-0 mt-2">Pesan</label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Pesan untuk user (opsional)"
              className="flex-1 px-3 py-2 rounded-lg text-sm bg-[#0A0E17] border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-400/40"
            />
          </div>
        )}

        {/* Preview collapsed */}
        {status !== "OPEN" && (
          <div>
            <button
              onClick={() => setShowPreview((p) => !p)}
              className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors"
            >
              <svg
                className={`w-3 h-3 transition-transform ${showPreview ? "rotate-90" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {showPreview ? "Sembunyikan preview" : "Lihat preview banner"}
            </button>

            {showPreview && (
              <div className={`mt-2 rounded-xl border px-4 py-3 flex items-center gap-3 ${bannerCfg.bg}`}>
                <span className="text-base">
                  {{ CLOSED: "🔒", FULL_SLOT: "🎫", COMING_SOON: "⏳" }[status]}
                </span>
                <div>
                  <p className={`text-xs font-bold ${bannerCfg.text}`}>{bannerCfg.label}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {message.trim() || "Pesan default akan tampil"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer: last updated + save button */}
        <div className="flex items-center justify-between pt-1">
          {service.updated_at ? (
            <p className="text-gray-600 text-xs">
              {new Date(service.updated_at).toLocaleDateString("id-ID", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          ) : <span />}

          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className={`
              px-4 py-1.5 rounded-lg text-xs font-bold transition-all
              ${saved
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : isDirty && !saving
                ? "bg-amber-400 hover:bg-amber-300 text-black"
                : "bg-white/5 text-gray-600 cursor-not-allowed"
              }
            `}
          >
            {saving ? "Menyimpan..." : saved ? "✓ Tersimpan" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ServiceStatusManagement() {
  const { statuses, loading, saving, error, updateStatus } = useServiceStatus();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[#12161F] border border-gray-800 rounded-2xl h-40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Status Layanan</h2>
        <p className="text-gray-500 text-sm mt-1">Kelola status form pemesanan secara real-time</p>
      </div>

      {/* 2 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statuses.length === 0 ? (
          <p className="text-gray-500 text-sm col-span-2 py-8 text-center">
            Tidak ada data. Pastikan sudah menjalankan SQL migration.
          </p>
        ) : (
          statuses.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSave={updateStatus}
              saving={saving}
            />
          ))
        )}
      </div>
    </div>
  );
}