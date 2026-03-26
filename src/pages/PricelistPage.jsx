import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { usePricelist } from "../hooks/usePricelist";

/* ─── Config ─────────────────────────────────────────────────────────────── */

const SUPABASE_URL = "https://ngzvcfcsarxclfmxuwfc.supabase.co";
const BUCKET = "member-photos";
const FOLDER = "members";

/* ─── Service Types ──────────────────────────────────────────────────────── */

const SERVICE_TYPES = [
    {
        id: "vc",
        label: "Video Call",
        formPath: "/video-call",
        description: "Sesi video call langsung dengan member JKT48 favoritmu",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        id: "mng",
        label: "Meet & Greet",
        formPath: "/meet-greet",
        description: "Bertemu langsung dan berinteraksi dengan member JKT48",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
    {
        id: "twoshot",
        label: "2-Shot",
        formPath: "/twoshot",
        description: "Foto berdua bareng member JKT48 — abadikan momennya!",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
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

function buildPhotoMap(files) {
    const map = new Map();
    if (!files) return map;
    files.forEach((file) => {
        const basename = file.name.split("/").pop();
        const slug = basename.replace(/^\d+-/, "").replace(/\.[^.]+$/, "");
        const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${FOLDER}/${basename}`;
        map.set(slug, url);
        map.set(slug.toLowerCase(), url);
    });
    return map;
}

/* ─── Hook: fetch photo list from Storage once ───────────────────────────── */

function useMemberPhotos() {
    const [photoMap, setPhotoMap] = useState(new Map());
    const [ready, setReady] = useState(false);

    useEffect(() => {
        async function fetchPhotos() {
            try {
                const { data, error } = await supabase.storage
                    .from(BUCKET)
                    .list(FOLDER, { limit: 1000 });
                if (error) throw error;
                setPhotoMap(buildPhotoMap(data));
            } catch (err) {
                console.warn("Could not load member photos:", err.message);
            } finally {
                setReady(true);
            }
        }
        fetchPhotos();
    }, []);

    return { photoMap, ready };
}

/* ─── MemberCard ─────────────────────────────────────────────────────────── */

function MemberCard({ member, fee, isPremium, photoMap }) {
    const [imgFailed, setImgFailed] = useState(false);

    const photoUrl = useMemo(() => {
        const titleSlug = member.name
            .trim()
            .replace(/ JKT48$/i, "")
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9_]/g, "");
        const lowerSlug = titleSlug.toLowerCase();

        // try TitleCase first, fallback to lowercase
        return photoMap.get(titleSlug) ?? photoMap.get(lowerSlug) ?? null;
    }, [member.name, photoMap]);

    const initials = member.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

    const showPhoto = photoUrl && !imgFailed;

    return (
        <div
            className={`
                flex flex-col rounded-2xl overflow-hidden border transition-all duration-200
                ${isPremium
                    ? "bg-amber-400/[0.06] border-amber-400/20 hover:border-amber-400/40 hover:bg-amber-400/10"
                    : "bg-white/[0.03] border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.06]"
                }
            `}
        >
            {/* Photo area */}
            <div className="relative w-full aspect-square overflow-hidden bg-white/[0.04]">
                {showPhoto ? (
                    <img
                        src={photoUrl}
                        alt={member.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-top transition-transform duration-300 hover:scale-105"
                        onError={() => setImgFailed(true)}
                    />
                ) : (
                    <div
                        className={`
                            w-full h-full flex items-center justify-center text-2xl font-black tracking-tight select-none
                            ${isPremium ? "text-amber-400/30" : "text-white/20"}
                        `}
                    >
                        {initials}
                    </div>
                )}

                {/* Premium badge */}
                {isPremium && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
                        <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3 flex flex-col gap-1">
                <p className={`text-xs font-bold leading-tight truncate ${isPremium ? "text-amber-50" : "text-white/90"}`}>
                    {member.name.replace(/ JKT48$/i, "")}
                </p>
                <p className={`text-sm font-extrabold leading-none mt-0.5 ${isPremium ? "text-amber-300" : "text-white/70"}`}>
                    {formatRupiah(fee)}
                </p>
            </div>
        </div>
    );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */

function SkeletonGrid() {
    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 animate-pulse">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-white/[0.06]">
                    <div className="aspect-square bg-white/[0.06]" />
                    <div className="p-3 space-y-2">
                        <div className="h-3 w-3/4 bg-white/[0.08] rounded" />
                        <div className="h-2 w-1/2 bg-white/[0.05] rounded" />
                        <div className="h-3 w-2/3 bg-white/[0.08] rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─── TierSection ────────────────────────────────────────────────────────── */

function TierSection({ group, isPremium, photoMap, photosReady }) {
    const [showAll, setShowAll] = useState(false);
    const INITIAL = 12;
    const visibleMembers = showAll ? group.members : group.members.slice(0, INITIAL);
    const hasMore = group.members.length > INITIAL;

    return (
        <div className="mb-10">
            {/* Tier header */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span
                    className={`
                        inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border
                        ${isPremium
                            ? "bg-amber-400/15 border-amber-400/25 text-amber-200"
                            : "bg-white/[0.05] border-white/[0.09] text-white/35"
                        }
                    `}
                >
                    {isPremium && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    )}
                    {isPremium ? "Premium" : "Reguler"}
                </span>

                <p className={`text-sm font-bold ${isPremium ? "text-amber-100/80" : "text-white/60"}`}>
                    {group.name}
                </p>

                <div className="flex-1 h-px bg-white/[0.06] hidden sm:block" />

                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isPremium ? "bg-amber-400/10 text-amber-300/60" : "bg-white/[0.05] text-white/25"}`}>
                    {group.members.length} member
                </span>

                <p className={`text-sm font-extrabold ${isPremium ? "text-amber-300" : "text-white/50"}`}>
                    {formatRupiah(group.fee)}
                </p>
            </div>

            {/* Cards grid */}
            {!photosReady ? (
                <SkeletonGrid />
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {visibleMembers.map((m) => (
                        <MemberCard
                            key={m.id}
                            member={m}
                            fee={group.fee}
                            isPremium={isPremium}
                            photoMap={photoMap}
                        />
                    ))}
                </div>
            )}

            {/* Expand / collapse */}
            {hasMore && photosReady && (
                <div className="mt-4 text-center">
                    <button
                        onClick={() => setShowAll((v) => !v)}
                        className={`
                            px-5 py-2 rounded-xl text-xs font-bold border transition-all
                            ${isPremium
                                ? "border-amber-400/20 text-amber-300/60 hover:bg-amber-400/10 hover:text-amber-200"
                                : "border-white/[0.09] text-white/35 hover:bg-white/[0.05] hover:text-white/60"
                            }
                        `}
                    >
                        {showAll
                            ? "↑ Sembunyikan"
                            : `Lihat ${group.members.length - INITIAL} member lainnya`}
                    </button>
                </div>
            )}
        </div>
    );
}

/* ─── PricelistPage ──────────────────────────────────────────────────────── */

export default function PricelistPage() {
    const [activeService, setActiveService] = useState(SERVICE_TYPES[0]);
    const { groups, loading, error } = usePricelist(activeService.id);
    const { photoMap, ready: photosReady } = useMemberPhotos();

    return (
        <div className="min-h-screen bg-[#06070A] text-white">

            {/* ── Hero ── */}
            <section className="relative overflow-hidden pt-24 pb-10">
                {/* Background glows */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-amber-400/12 blur-[120px]" />
                    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-primary-600/8 blur-[100px]" />
                </div>
                {/* Dot grid */}
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
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        Harga Fee Joki
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black leading-tight tracking-tight mb-3">
                        Pricelist{" "}
                        <span className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent">
                            Receh48
                        </span>
                    </h1>

                    <p className="text-white/50 text-sm sm:text-base max-w-sm mx-auto mb-6">
                        <span className="text-amber-200/70 font-semibold">Bayar setelah tiket berhasil!</span>
                    </p>

                    <div className="flex flex-wrap justify-center gap-2">
                        {["Fast Response", "98% Kepuasan", "100% Aman"].map((t) => (
                            <span key={t} className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/50 text-xs font-medium">
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Service Tabs ── */}
            <div className="sticky top-16 z-20 bg-[#06070A]/90 backdrop-blur-xl border-b border-white/[0.07]">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-3">
                        {SERVICE_TYPES.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setActiveService(s)}
                                className={`
                                    flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-150
                                    ${activeService.id === s.id
                                        ? "bg-gradient-to-r from-amber-300 to-yellow-200 text-black shadow-[0_4px_20px_-6px_rgba(255,200,50,0.5)]"
                                        : "text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
                                    }
                                `}
                            >
                                {s.icon}
                                <span>{s.label}</span>
                            </button>
                        ))}
                        <p className="hidden md:block ml-auto text-white/30 text-xs flex-shrink-0 pl-4">
                            {activeService.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <section className="pb-24 pt-8">
                <div className="container mx-auto px-4 max-w-5xl">

                    {/* Mobile service description */}
                    <p className="md:hidden text-center text-white/35 text-xs mb-6">
                        {activeService.description}
                    </p>

                    {/* Loading state */}
                    {loading && (
                        <div className="space-y-10">
                            {[0, 1].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-5 w-20 bg-white/[0.08] rounded-lg" />
                                        <div className="h-4 w-32 bg-white/[0.05] rounded" />
                                        <div className="flex-1 h-px bg-white/[0.04]" />
                                        <div className="h-4 w-20 bg-white/[0.08] rounded" />
                                    </div>
                                    <SkeletonGrid />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error state */}
                    {!loading && error && (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <span className="text-4xl">😢</span>
                            <p className="text-white/60 font-semibold text-sm">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-2 px-5 py-2 rounded-xl text-xs font-bold border border-white/[0.09] text-white/40 hover:bg-white/[0.05] hover:text-white/70 transition-all"
                            >
                                Coba lagi
                            </button>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && !error && groups.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <span className="text-4xl">🎟️</span>
                            <p className="text-white font-bold">Pricelist {activeService.label} belum tersedia</p>
                            <p className="text-white/40 text-sm">Hubungi admin untuk info harga</p>
                        </div>
                    )}

                    {/* Tier sections */}
                    {!loading && !error && groups.length > 0 && (
                        <>
                            {groups.map((group, i) => (
                                <TierSection
                                    key={group.id}
                                    group={group}
                                    isPremium={i === 0}
                                    photoMap={photoMap}
                                    photosReady={photosReady}
                                />
                            ))}

                            {/* CTA */}
                            <div className="mt-6 flex flex-col items-center gap-4">
                                <Link
                                    to={activeService.formPath}
                                    className="
                                        inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-sm
                                        bg-gradient-to-r from-amber-300 to-yellow-200 text-black
                                        shadow-[0_8px_30px_-8px_rgba(255,200,50,0.5)]
                                        hover:shadow-[0_12px_40px_-8px_rgba(255,200,50,0.7)]
                                        hover:brightness-105 transition-all duration-200
                                    "
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
                        </>
                    )}

                </div>
            </section>

        </div>
    );
}