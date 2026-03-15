import { useState } from "react";
import { Link } from "react-router-dom";
import { usePricelist } from "../hooks/usePricelist";

/* ─── Service Types ──────────────────────────────────────────────────────── */

const SERVICE_TYPES = [
    {
        id: "vc",
        label: "Video Call",
        emoji: "📹",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        ),
        formPath: "/video-call",
        description: "Sesi video call langsung dengan member JKT48 favoritmu",
    },
    {
        id: "mng",
        label: "Meet & Greet",
        emoji: "🤝",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        formPath: "/meet-greet",
        description: "Bertemu langsung dan berinteraksi dengan member JKT48",
    },
    {
        id: "twoshot",
        label: "2-Shot",
        emoji: "📸",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        formPath: "/twoshot",
        description: "Foto berdua bareng member JKT48 — abadikan momennya!",
    },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatRupiah(amount) {
    if (!amount && amount !== 0) return "—";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/* ─── MemberChip ─────────────────────────────────────────────────────────── */

function MemberChip({ name, isPremium }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium transition-colors
      ${isPremium
                ? "bg-amber-400/15 border border-amber-400/25 text-amber-100/80"
                : "bg-white/[0.05] border border-white/[0.09] text-white/60"
            }`}
        >
            {name}
        </span>
    );
}

/* ─── Table Row ──────────────────────────────────────────────────────────── */

function PriceRow({ group, index, isPremium }) {
    const [expanded, setExpanded] = useState(false);
    const SHOW = 6;
    const visible = expanded ? group.members : group.members.slice(0, SHOW);
    const hasMore = group.members.length > SHOW;

    return (
        <div className={`grid grid-cols-[1fr_auto] md:grid-cols-[200px_140px_1fr] gap-x-4 gap-y-3 px-5 py-4 border-b border-white/[0.07] last:border-0 transition-colors
      ${isPremium ? "bg-amber-400/[0.06]" : "hover:bg-white/[0.02]"}`}
        >
            {/* Col 1 — Nama & Tier */}
            <div className="flex flex-col justify-center gap-1.5">
                {isPremium && (
                    <span className="inline-flex items-center gap-1 w-fit text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/30 text-amber-200">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Premium
                    </span>
                )}
                {!isPremium && (
                    <span className="inline-flex items-center w-fit text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.09] text-white/35">
                        Reguler
                    </span>
                )}
                <p className={`font-bold text-sm leading-snug ${isPremium ? "text-amber-50" : "text-white/90"}`}>
                    {group.name}
                </p>
            </div>

            {/* Col 2 — Harga (desktop inline, mobile pojok kanan) */}
            <div className={`flex flex-col justify-center text-right md:text-left col-start-2 row-start-1 md:col-start-auto md:row-start-auto`}>
                <p className={`text-[10px] font-semibold uppercase tracking-widest mb-0.5
          ${isPremium ? "text-amber-300/50" : "text-white/30"}`}>
                    Fee Joki
                </p>
                <p className={`text-base font-extrabold leading-none
          ${isPremium
                        ? "text-amber-200"
                        : "text-white/80"
                    }`}>
                    {formatRupiah(group.fee)}
                </p>
            </div>

            {/* Col 3 — Members (full width on mobile) */}
            <div className="col-span-2 md:col-span-1">
                {group.members.length === 0 ? (
                    <p className="text-white/25 text-xs italic">Belum ada member</p>
                ) : (
                    <div className="flex flex-wrap gap-1.5 items-center">
                        {visible.map((m) => (
                            <MemberChip key={m.id} name={m.name} isPremium={isPremium} />
                        ))}
                        {hasMore && !expanded && (
                            <button
                                onClick={() => setExpanded(true)}
                                className="text-[11px] font-bold text-amber-300/60 hover:text-amber-200 transition-colors px-1"
                            >
                                +{group.members.length - SHOW} lainnya
                            </button>
                        )}
                        {expanded && (
                            <button
                                onClick={() => setExpanded(false)}
                                className="text-[11px] font-bold text-white/35 hover:text-white/60 transition-colors px-1"
                            >
                                ↑ Sembunyikan
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */

function SkeletonRow() {
    return (
        <div className="grid grid-cols-[1fr_auto] md:grid-cols-[200px_140px_1fr] gap-4 px-5 py-4 border-b border-white/[0.07] last:border-0 animate-pulse">
            <div className="space-y-2">
                <div className="h-3 w-12 bg-white/10 rounded" />
                <div className="h-4 w-28 bg-white/10 rounded" />
            </div>
            <div className="space-y-1.5">
                <div className="h-3 w-10 bg-white/10 rounded" />
                <div className="h-5 w-20 bg-white/10 rounded" />
            </div>
            <div className="col-span-2 md:col-span-1 flex gap-1.5 flex-wrap">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-5 w-16 bg-white/[0.06] rounded-md" />
                ))}
            </div>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */

export default function PricelistPage() {
    const [activeService, setActiveService] = useState(SERVICE_TYPES[0]);
    const { groups, loading, error } = usePricelist(activeService.id);

    return (
        <div className="min-h-screen bg-[#06070A] text-white">

            {/* ── Hero ── */}
            <section className="relative overflow-hidden pt-24 pb-10">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-amber-400/12 blur-[120px]" />
                    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-primary-600/8 blur-[100px]" />
                </div>
                <div
                    className="absolute inset-0 opacity-[0.07] pointer-events-none"
                    style={{
                        backgroundImage: "radial-gradient(circle, rgba(255,215,130,0.4) 1px, transparent 1px)",
                        backgroundSize: "36px 36px",
                    }}
                />

                <div className="container mx-auto px-4 relative z-10 max-w-2xl text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-300/10 border border-amber-300/20 text-amber-200/80 text-[11px] font-bold mb-4 tracking-widest uppercase">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        Harga Transparan
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black leading-tight tracking-tight mb-3">
                        Pricelist{" "}
                        <span className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent">
                            Receh48
                        </span>
                    </h1>

                    <p className="text-white/50 text-sm sm:text-base max-w-sm mx-auto mb-6">
                        <span className="text-amber-200/70 font-semibold">Bayar setelah tiket berhasil! 🎟️</span>
                    </p>

                    <div className="flex flex-wrap justify-center gap-2">
                        {["⚡ Fast Response", "⭐ 98% Kepuasan", "🔒 100% Aman"].map((t) => (
                            <span key={t} className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/50 text-xs font-medium">
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Tabs ── */}
            <div className="sticky top-16 z-20 bg-[#06070A]/90 backdrop-blur-xl border-b border-white/[0.07]">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-3">
                        {SERVICE_TYPES.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setActiveService(s)}
                                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-150
                  ${activeService.id === s.id
                                        ? "bg-gradient-to-r from-amber-300 to-yellow-200 text-black shadow-[0_4px_20px_-6px_rgba(255,200,50,0.5)]"
                                        : "text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
                                    }`}
                            >
                                {s.icon}
                                <span>{s.label}</span>
                            </button>
                        ))}
                        <p className="hidden md:block ml-auto text-white/30 text-xs flex-shrink-0">
                            {activeService.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Table ── */}
            <section className="pb-20 pt-8">
                <div className="container mx-auto px-4 max-w-4xl">

                    <p className="md:hidden text-center text-white/35 text-xs mb-5">
                        {activeService.description}
                    </p>

                    {/* Table container */}
                    <div className="rounded-2xl border border-white/[0.09] overflow-hidden">

                        {/* Table header — desktop only */}
                        <div className="hidden md:grid grid-cols-[200px_140px_1fr] gap-4 px-5 py-3 bg-white/[0.03] border-b border-white/[0.09]">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Grup / Tier</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Fee Joki</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Member</p>
                        </div>

                        {loading ? (
                            <>
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                            </>
                        ) : error ? (
                            <div className="p-10 text-center">
                                <p className="text-3xl mb-3">😢</p>
                                <p className="text-white/60 font-semibold text-sm">{error}</p>
                            </div>
                        ) : groups.length === 0 ? (
                            <div className="p-10 text-center">
                                <p className="text-3xl mb-3">🎟️</p>
                                <p className="text-white font-bold">Pricelist {activeService.label} belum tersedia</p>
                                <p className="text-white/40 text-sm mt-1">Hubungi admin untuk info harga</p>
                            </div>
                        ) : (
                            groups.map((group, i) => (
                                <PriceRow
                                    key={group.id}
                                    group={group}
                                    index={i}
                                    isPremium={i === 0}
                                />
                            ))
                        )}
                    </div>

                    {/* CTA */}
                    {!loading && !error && groups.length > 0 && (
                        <div className="mt-8 flex flex-col items-center gap-4">
                            <Link
                                to={activeService.formPath}
                                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-sm
                  bg-gradient-to-r from-amber-300 to-yellow-200 text-black
                  shadow-[0_8px_30px_-8px_rgba(255,200,50,0.5)]
                  hover:shadow-[0_12px_40px_-8px_rgba(255,200,50,0.7)]
                  hover:brightness-105 transition-all duration-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                Pesan {activeService.label} Sekarang
                            </Link>

                            <p className="text-white/30 text-xs text-center max-w-xs leading-relaxed">
                                Bayar <span className="text-amber-200/50 font-semibold">setelah tiket berhasil</span> · Fast response · 100% aman
                            </p>
                        </div>
                    )}

                </div>
            </section>

        </div>
    );
}