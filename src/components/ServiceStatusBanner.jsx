import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// =============================================
//  ServiceStatusBanner — Redesigned (clean, no emoji)
//  Lokasi: src/components/ServiceStatusBanner.jsx
// =============================================

const POPUP_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap');

@keyframes overlayIn {
  from { opacity: 0 }
  to   { opacity: 1 }
}
@keyframes cardIn {
  0%   { opacity: 0; transform: translateY(40px) scale(.95) }
  100% { opacity: 1; transform: translateY(0)    scale(1)   }
}
@keyframes ringPulse {
  0%, 100% { transform: scale(1);    opacity: 1   }
  50%       { transform: scale(1.06); opacity: .75 }
}
@keyframes barSlide {
  0%   { transform: scaleX(0); opacity: 0 }
  100% { transform: scaleX(1); opacity: 1 }
}
@keyframes shimBtn {
  0%   { left: -60% }
  100% { left: 130%  }
}
@keyframes rotateSlow {
  from { transform: rotate(0deg) }
  to   { transform: rotate(360deg) }
}
`;

const STATUS_CONFIG = {
  OPEN: { show: false },

  CLOSED: {
    show: true,
    accent: "#f43f5e",
    accentRgb: "244,63,94",
    badge: "CLOSED",
    headline: "Layanan Ditutup",
    sub: "Sementara tidak menerima pemesanan baru.",
  },

  FULL_SLOT: {
    show: true,
    accent: "#f97316",
    accentRgb: "249,115,22",
    badge: "FULL SLOT",
    headline: "Slot Penuh",
    sub: "Semua slot telah terisi untuk periode ini.",
  },

  COMING_SOON: {
    show: true,
    accent: "#6366f1",
    accentRgb: "99,102,241",
    badge: "COMING SOON",
    headline: "Segera Hadir",
    sub: "Layanan ini sedang dalam persiapan.",
  },
};

/* ── Clean SVG Icons ─────────────────────────── */
function IconClosed({ color }) {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      <rect x="6" y="14" width="22" height="16" rx="4" stroke={color} strokeWidth="1.8" />
      <path d="M11 14v-4.5a6 6 0 0112 0V14" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="17" cy="22" r="2.2" fill={color} />
      <line x1="17" y1="24.2" x2="17" y2="27" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconFullSlot({ color }) {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      <rect x="3" y="21" width="6" height="9" rx="2" fill={color} opacity=".45" />
      <rect x="12" y="14" width="6" height="16" rx="2" fill={color} opacity=".7" />
      <rect x="21" y="7" width="6" height="23" rx="2" fill={color} />
      <line x1="1" y1="32" x2="33" y2="32" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconComingSoon({ color }) {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      <circle cx="17" cy="17" r="13" stroke={color} strokeWidth="1.8" strokeDasharray="3.5 2.5" />
      <path d="M17 9v8l5 4.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getIcon(status, color) {
  if (status === "CLOSED") return <IconClosed color={color} />;
  if (status === "FULL_SLOT") return <IconFullSlot color={color} />;
  if (status === "COMING_SOON") return <IconComingSoon color={color} />;
  return null;
}

/* ── Main Popup ──────────────────────────────── */
function StatusPopup({ serviceData, cfg, onDismiss }) {
  const displayMessage = serviceData.message || cfg.sub;
  const { accent, accentRgb } = cfg;

  const updatedAt = serviceData.updated_at
    ? new Date(serviceData.updated_at).toLocaleDateString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
    : null;

  return (
    <>
      <style>{POPUP_CSS}</style>

      {/* Overlay */}
      <div
        onClick={onDismiss}
        style={{
          position: "fixed", inset: 0, zIndex: 9998,
          background: `radial-gradient(ellipse at 50% 40%, rgba(${accentRgb},.06) 0%, rgba(4,6,14,.93) 65%)`,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          animation: "overlayIn .3s ease forwards",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px",
        }}
      >
        {/* Card */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative",
            width: "min(400px, 100%)",
            background: "linear-gradient(160deg, #0e1220 0%, #080b13 100%)",
            borderRadius: "24px",
            overflow: "hidden",
            animation: "cardIn .48s cubic-bezier(.16,1,.3,1) forwards",
            fontFamily: "'Outfit', sans-serif",
            boxShadow: `
              0 0 0 1px rgba(${accentRgb},.16),
              0 0 80px rgba(${accentRgb},.1),
              0 40px 100px rgba(0,0,0,.9)
            `,
          }}
        >
          {/* top line */}
          <div style={{
            height: "2px",
            background: `linear-gradient(90deg, transparent 0%, ${accent} 50%, transparent 100%)`,
            transformOrigin: "left",
            animation: "barSlide .55s cubic-bezier(.16,1,.3,1) .15s both",
          }} />

          {/* Body */}
          <div style={{
            position: "relative", zIndex: 1,
            padding: "44px 36px 36px",
            display: "flex", flexDirection: "column",
            alignItems: "center", textAlign: "center",
          }}>

            {/* Icon with double ring */}
            <div style={{ position: "relative", marginBottom: "28px" }}>
              <div style={{
                position: "absolute", inset: -12,
                borderRadius: "50%",
                border: `1px dashed rgba(${accentRgb},.18)`,
                animation: "rotateSlow 14s linear infinite",
              }} />
              <div style={{
                position: "absolute", inset: -5,
                borderRadius: "50%",
                border: `1px solid rgba(${accentRgb},.12)`,
              }} />
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: `radial-gradient(circle, rgba(${accentRgb},.12) 0%, rgba(${accentRgb},.03) 100%)`,
                border: `1.5px solid rgba(${accentRgb},.28)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 32px rgba(${accentRgb},.18), inset 0 0 20px rgba(${accentRgb},.05)`,
                animation: "ringPulse 3.5s ease-in-out infinite",
              }}>
                {getIcon(serviceData.status, accent)}
              </div>
            </div>

            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "4px 14px", borderRadius: "99px",
              background: `rgba(${accentRgb},.09)`,
              border: `1px solid rgba(${accentRgb},.2)`,
              marginBottom: "16px",
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: "50%",
                background: accent, flexShrink: 0,
                boxShadow: `0 0 8px ${accent}`,
                animation: "ringPulse 1.5s ease-in-out infinite",
              }} />
              <span style={{
                fontSize: "10px", fontWeight: 700,
                letterSpacing: "2.5px", color: accent,
                textTransform: "uppercase",
              }}>
                {cfg.badge}
              </span>
            </div>

            {/* Headline */}
            <h2 style={{
              fontSize: "clamp(22px, 5vw, 28px)",
              fontWeight: 900, color: "#f1f5f9",
              margin: "0 0 5px", lineHeight: 1.1,
              letterSpacing: "-0.7px",
            }}>
              {cfg.headline}
            </h2>

            {/* Service name */}
            {serviceData.service_name && (
              <p style={{
                fontSize: "10px", fontWeight: 600,
                color: `rgba(${accentRgb},.65)`,
                letterSpacing: "2.5px", textTransform: "uppercase",
                margin: "0 0 24px",
              }}>
                {serviceData.service_name}
              </p>
            )}

            {/* Divider */}
            <div style={{
              width: "100%", height: "1px",
              background: `linear-gradient(90deg, transparent, rgba(${accentRgb},.14), transparent)`,
              marginBottom: "20px",
            }} />

            {/* Message */}
            <p style={{
              fontSize: "14px", fontWeight: 300,
              color: "#64748b", lineHeight: 1.8,
              margin: 0, maxWidth: "300px",
            }}>
              {displayMessage}
            </p>

            {/* CTA */}
            <button
              onClick={onDismiss}
              style={{
                marginTop: "28px", width: "100%",
                padding: "14px 0", borderRadius: "14px",
                border: "none",
                background: `linear-gradient(135deg, rgba(${accentRgb},.95), rgba(${accentRgb},.72))`,
                color: "#fff",
                fontSize: "15px", fontWeight: 700,
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: ".3px", cursor: "pointer",
                position: "relative", overflow: "hidden",
                boxShadow: `0 6px 28px rgba(${accentRgb},.28)`,
                transition: "transform .15s ease, box-shadow .15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 10px 36px rgba(${accentRgb},.42)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 6px 28px rgba(${accentRgb},.28)`;
              }}
            >
              <span aria-hidden style={{
                position: "absolute", top: 0, height: "100%", width: "28%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,.13), transparent)",
                animation: "shimBtn 2.8s ease-in-out infinite",
              }} />
              Kembali ke Beranda
            </button>

          </div>

          {/* ✕ close */}
          <button
            onClick={onDismiss}
            aria-label="Tutup"
            style={{
              position: "absolute", top: 14, right: 14,
              width: 28, height: 28, borderRadius: "50%",
              border: "1px solid rgba(255,255,255,.06)",
              background: "rgba(255,255,255,.03)",
              color: "#334155", fontSize: "12px",
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              transition: "all .15s", zIndex: 2,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#e2e8f0";
              e.currentTarget.style.background = "rgba(255,255,255,.08)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#334155";
              e.currentTarget.style.background = "rgba(255,255,255,.03)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,.06)";
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Skeleton ────────────────────────────────── */
function BannerSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-5 mb-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 rounded-full bg-white/10" />
          <div className="h-4 w-full rounded bg-white/10" />
          <div className="h-3 w-40 rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}

/* ── Default export ──────────────────────────── */
export default function ServiceStatusBanner({ serviceKey }) {
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!serviceKey) return;
    async function fetchStatus() {
      const { data } = await supabase
        .from("service_status")
        .select("*")
        .eq("service_key", serviceKey)
        .single();
      setServiceData(data || null);
      setLoading(false);
    }
    fetchStatus();
  }, [serviceKey]);

  const handleDismiss = () => {
    setDismissed(true);
    window.location.href = "/";
  };

  if (loading) return <BannerSkeleton />;
  if (!serviceData) return null;

  const cfg = STATUS_CONFIG[serviceData.status];
  if (!cfg || !cfg.show || dismissed) return null;

  return (
    <StatusPopup
      serviceData={serviceData}
      cfg={cfg}
      onDismiss={handleDismiss}
    />
  );
}

// =============================================
//  Hook helper — tidak berubah
//  const { isOpen } = useIsServiceOpen("video_call");
// =============================================
export function useIsServiceOpen(serviceKey) {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serviceKey) return;
    async function fetchStatus() {
      const { data } = await supabase
        .from("service_status")
        .select("status")
        .eq("service_key", serviceKey)
        .single();
      setIsOpen(!data || data.status === "OPEN");
      setLoading(false);
    }
    fetchStatus();
  }, [serviceKey]);

  return { isOpen, loading };
}