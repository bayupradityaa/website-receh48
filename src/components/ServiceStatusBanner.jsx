import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const STATUS_CONFIG = {
  OPEN: {
    show: false,
  },
  CLOSED: {
    label: "Layanan Ditutup Sementara",
    desc: "Layanan ini sedang tidak tersedia untuk saat ini. Pantau terus update kami ya!",
    icon: "🔒",
    bg: "from-red-500/15 to-rose-500/10",
    border: "border-red-400/30",
    badge: "bg-red-500/20 text-red-300 border-red-400/30",
    dot: "bg-red-400",
  },
  FULL_SLOT: {
    label: "Slot Penuh",
    desc: "Semua slot sudah terisi. Tunggu pembukaan slot berikutnya ya!",
    icon: "🎫",
    bg: "from-orange-500/15 to-amber-500/10",
    border: "border-orange-400/30",
    badge: "bg-orange-500/20 text-orange-300 border-orange-400/30",
    dot: "bg-orange-400",
  },
  COMING_SOON: {
    label: "Segera Hadir",
    desc: "Layanan ini belum tersedia. Kami sedang mempersiapkannya untuk kamu!",
    icon: "⏳",
    bg: "from-blue-500/15 to-indigo-500/10",
    border: "border-blue-400/30",
    badge: "bg-blue-500/20 text-blue-300 border-blue-400/30",
    dot: "bg-blue-400",
  },
};

export default function ServiceStatusBanner({ serviceKey }) {
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!serviceKey) return;

    async function fetch() {
      const { data } = await supabase
        .from("service_status")
        .select("*")
        .eq("service_key", serviceKey)
        .single();

      setServiceData(data || null);
      setLoading(false);
    }

    fetch();
  }, [serviceKey]);

  // loading → return null, biar form tidak langsung di-disable duluan
  if (loading || !serviceData) return <BannerSkeleton />;

  const isOpen  = serviceData.status === "OPEN";
  const config  = STATUS_CONFIG[serviceData.status];

  if (isOpen) return null; // status OPEN → tidak ada banner

  const displayMessage = serviceData.message || config.desc;

  return (
    <div
      className={`
        relative w-full rounded-2xl overflow-hidden border backdrop-blur-sm
        bg-gradient-to-br ${config.bg} ${config.border}
        p-5 md:p-6 mb-6
      `}
    >
      {/* Subtle shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl">
          {config.icon}
        </div>

        <div className="flex-1 min-w-0">
          {/* Badge + label */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className={`
                inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                text-xs font-extrabold border ${config.badge}
              `}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
              {config.label}
            </span>
          </div>

          {/* Message */}
          <p className="text-white/80 text-sm leading-relaxed">
            {displayMessage}
          </p>

          {/* Last updated */}
          {serviceData.updated_at && (
            <p className="text-white/40 text-xs mt-2">
              Update terakhir:{" "}
              {new Date(serviceData.updated_at).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Skeleton saat loading
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

// =============================================
//  Hook helper — gunakan ini di VideoCall.jsx
//  dan TwoShot.jsx untuk disable form-nya
//
//  const { isOpen } = useIsServiceOpen("video_call");
//  lalu di form: disabled={!isOpen}
// =============================================
export function useIsServiceOpen(serviceKey) {
  const [isOpen,  setIsOpen]  = useState(true);  // default true biar tidak flicker
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serviceKey) return;

    async function fetch() {
      const { data } = await supabase
        .from("service_status")
        .select("status")
        .eq("service_key", serviceKey)
        .single();

      setIsOpen(!data || data.status === "OPEN");
      setLoading(false);
    }

    fetch();
  }, [serviceKey]);

  return { isOpen, loading };
}