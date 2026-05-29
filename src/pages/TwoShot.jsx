import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { PageLoader } from "../components/shared/LoadingSpinner";
import { ErrorMessage } from "../components/shared/ErrorMessage";
import { formatCurrency } from "../lib/utils";
import ServiceStatusBanner, {
  useIsServiceOpen,
} from "../components/ServiceStatusBanner";
import OrderSuccess from "./OrderSuccess";
import {
  Trash2,
  Plus,
  ShoppingCart,
  Search,
  Calendar,
  Clock,
  AlertCircle,
  Shield,
  Camera,
} from "lucide-react";

const ORDER_TYPE = "twoshot";
const TERMS_KEY = "terms_twoshot";

const TOUR_EVENTS = [
  { id: "jogja_27_passion", war: "war_15", date: "Yogyakarta, 27 Juni 2026 (Passion)", label: "Yogyakarta - 27 Juni 2026 (Passion) [War 15 Juni]" },
  { id: "sby_28_love", war: "war_15", date: "Surabaya, 28 Juni 2026 (Love)", label: "Surabaya - 28 Juni 2026 (Love) [War 15 Juni]" },
  { id: "sby_02_dream", war: "war_15", date: "Surabaya, 2 Juli 2026 (Dream)", label: "Surabaya - 02 Juli 2026 (Dream) [War 15 Juni]" },
  { id: "jogja_04_love", war: "war_22", date: "Yogyakarta, 4 Juli 2026 (Love)", label: "Yogyakarta - 4 Juli 2026 (Love) [War 22 Juni]" },
  { id: "jogja_05_dream", war: "war_22", date: "Yogyakarta, 5 Juli 2026 (Dream)", label: "Yogyakarta - 05 Juli 2026 (Dream) [War 22 Juni]" },
  { id: "sby_09_passion", war: "war_22", date: "Surabaya, 9 Juli 2026 (Passion)", label: "Surabaya - 09 Juli 2026 (Passion) [War 22 Juni]" }
];

const TEAMS = [
  {
    id: "love",
    name: "Team Love",
    badgeClass: "bg-pink-600 text-white border border-pink-500/30 shadow-sm",
    order: 1,
    members: [
      "Alya Amanda", "Anindya Ramadhani", "Aurellia", "Aurhel Alana",
      "Cathleen Nixie", "Celline Thefani", "Cynthia Yaputera", "Fiony Alveria",
      "Fritzy Rosmerian", "Grace Octaviani", "Hillary Abigail", "Indah Cahya",
      "Jazzlyn Trisha", "Michelle Alexandra", "Nayla Suji"
    ]
  },
  {
    id: "dream",
    name: "Team Dream",
    badgeClass: "bg-sky-600 text-white border border-sky-500/30 shadow-sm",
    order: 2,
    members: [
      "Adeline Wijaya", "Chelsea Davina", "Febriola Sinambela", "Freya Jayawardana",
      "Gabriela Abigail", "Gendis Mayrannisa", "Gita Sekar Andarini", "Greesella Adhalia",
      "Helisma Putri", "Jesslyn Elly", "Marsha Lenathea", "Nina Tutachia",
      "Oline Manuel", "Shabilqis Naila"
    ]
  },
  {
    id: "passion",
    name: "Team Passion",
    badgeClass: "bg-emerald-600 text-white border border-emerald-500/30 shadow-sm",
    order: 3,
    members: [
      "Abigail Rachel", "Angelina Christy", "Catherina Vallencia", "Cornelia Vanisa",
      "Dena Natalia", "Desy Natalia", "Feni Fitriyanti", "Jessica Chandra",
      "Kathrina Irene", "Lulu Salsabila", "Michelle Levia", "Mutiara Azzahra",
      "Raisha Syifa", "Ribka Budiman", "Victoria Kimberly"
    ]
  },
  {
    id: "trainee",
    name: "Trainee",
    badgeClass: "bg-purple-600 text-white border border-purple-500/30 shadow-sm",
    order: 4,
    members: [
      "Astrella Virgiananda", "Aulia Riza", "Bong Aprilli", "Hagia Sopia",
      "Humaira Ramadhani", "Jacqueline Immanuela", "Jemima Evodie",
      "Mikaela Kusjanto", "Nur Intan",
      "Afera Thalia", "Carissa Dini", "Christabella Bonita", "Fahira Putri",
      "Fatimah Azzahra", "Heidi Suyangga", "Maxine Faye",
      "Putry Jazyta", "Ralyne Van Irwan", "Sona Kalyana"
    ]
  }
];

function getMemberTeamDetails(memberName) {
  const cleanName = memberName.replace(/ JKT48$/i, "").trim().toLowerCase();
  const team = TEAMS.find(t =>
    t.members.some(tm => tm.trim().toLowerCase() === cleanName)
  );
  if (team) {
    let rowBg = "bg-[#12161F]";
    let rowHover = "hover:bg-[#1A1F2E]";
    let mobileBg = "bg-[#0A0E17]";
    let mobileBorder = "border-gray-700";

    if (team.id === "love") {
      rowBg = "bg-pink-500/[0.04]";
      rowHover = "hover:bg-pink-500/[0.09]";
      mobileBg = "bg-pink-500/[0.03]";
      mobileBorder = "border-pink-500/25 hover:border-pink-500/40";
    } else if (team.id === "dream") {
      rowBg = "bg-sky-500/[0.04]";
      rowHover = "hover:bg-sky-500/[0.09]";
      mobileBg = "bg-sky-500/[0.03]";
      mobileBorder = "border-sky-500/25 hover:border-sky-500/40";
    } else if (team.id === "passion") {
      rowBg = "bg-emerald-500/[0.04]";
      rowHover = "hover:bg-emerald-500/[0.09]";
      mobileBg = "bg-emerald-500/[0.03]";
      mobileBorder = "border-emerald-500/25 hover:border-emerald-500/40";
    } else if (team.id === "trainee") {
      rowBg = "bg-purple-500/[0.04]";
      rowHover = "hover:bg-purple-500/[0.09]";
      mobileBg = "bg-purple-500/[0.03]";
      mobileBorder = "border-purple-500/25 hover:border-purple-500/40";
    }

    return {
      name: team.name,
      badgeClass: team.badgeClass,
      order: team.order,
      rowBg,
      rowHover,
      mobileBg,
      mobileBorder
    };
  }
  return {
    name: "Trainee / Lainnya",
    badgeClass: "bg-purple-950/40 text-purple-400 border border-purple-700/30",
    order: 4,
    rowBg: "bg-purple-500/[0.04]",
    rowHover: "hover:bg-purple-500/[0.09]",
    mobileBg: "bg-purple-500/[0.03]",
    mobileBorder: "border-purple-500/25 hover:border-purple-500/40"
  };
}

const orderSchema = z
  .object({
    customer_name: z.string().min(3, "Nama minimal 3 karakter"),
    contact_twitter: z.string().optional(),
    contact_line: z.string().optional(),
    contact_email: z.string().email("Email tidak valid"),
    password_jkt: z.string().min(1, "Password harus diisi"),
    account_type: z.enum(["ofc", "general"], {
      required_error: "Pilih tipe akun terlebih dahulu",
    }),
    agree_terms: z.boolean().refine((val) => val === true, {
      message: "Anda harus menyetujui syarat dan ketentuan",
    }),
  })
  .refine((data) => data.contact_twitter || data.contact_line, {
    message: "Minimal salah satu dari Twitter atau No. WhatsApp harus diisi",
    path: ["contact_twitter"],
  });

function getFeeByType(member, feeType) {
  const arr = Array.isArray(member?.member_fees) ? member.member_fees : [];
  const item = arr.find((x) => x?.fee_type === feeType);
  return item?.fee_groups || null;
}

function isFullSlot(member, serviceType) {
  const fullSlots = Array.isArray(member?.full_slots) ? member.full_slots : [];
  return fullSlots.includes(serviceType);
}

const teamColors = {
  Dream: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  Love: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  Passion: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  Trainee: "bg-slate-500/15 text-slate-300 border-slate-500/30"
};

function TeamBadge({ teamName }) {
  let key = "Trainee";
  if (teamName.includes("Dream")) key = "Dream";
  else if (teamName.includes("Love")) key = "Love";
  else if (teamName.includes("Passion")) key = "Passion";

  const colorClass = teamColors[key] || teamColors.Trainee;

  return (
    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold align-middle shrink-0 ${colorClass}`}>
      {teamName}
    </span>
  );
}

function TeamFilterChips({ selectedTeam, setSelectedTeam }) {
  const teams = ["Semua", "Dream", "Love", "Passion", "Trainee"];

  const activeStyles = {
    Semua: "bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20",
    Dream: "bg-violet-500 text-white border-violet-400 shadow-lg shadow-violet-500/20",
    Love: "bg-pink-500 text-white border-pink-400 shadow-lg shadow-pink-500/20",
    Passion: "bg-orange-500 text-slate-950 border-orange-400 shadow-lg shadow-orange-500/20",
    Trainee: "bg-slate-500 text-white border-slate-400 shadow-lg shadow-slate-500/20"
  };

  const hoverStyles = {
    Semua: "hover:border-amber-500/50 hover:text-amber-300",
    Dream: "hover:border-violet-500/50 hover:text-violet-300",
    Love: "hover:border-pink-500/50 hover:text-pink-300",
    Passion: "hover:border-orange-500/50 hover:text-orange-300",
    Trainee: "hover:border-slate-500/50 hover:text-slate-300"
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
      {teams.map((team) => {
        const isActive = selectedTeam === team;
        return (
          <button
            key={team}
            type="button"
            onClick={() => setSelectedTeam(team)}
            className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-full border transition-all shrink-0 ${isActive
              ? activeStyles[team]
              : `bg-[#0A0E17] text-gray-400 border-gray-800 ${hoverStyles[team]}`
              }`}
          >
            {team}
          </button>
        );
      })}
    </div>
  );
}

function MemberSearch({ searchQuery, setSearchQuery, isOpen }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
      <input
        type="text"
        placeholder="Cari nama member..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={!isOpen}
        className="w-full pl-10 pr-4 py-2.5 bg-[#0A0E17] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:cursor-not-allowed text-sm"
      />
    </div>
  );
}

function MemberTable({
  filteredMembers,
  isOpen,
  cart,
  addToCart,
  orderType,
  isFullSlot,
  getFeeByType,
  getMemberTeamDetails
}) {
  return (
    <div className="overflow-x-auto">
      <div className="max-h-[520px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-[#1A1F2E] z-10">
            <tr className="border-b border-gray-800">
              <th className="px-3 md:px-6 py-3 md:py-4 text-left text-sm font-semibold text-gray-300">Member</th>
              <th className="px-3 md:px-6 py-3 md:py-4 text-right text-sm font-semibold text-gray-300">
                {orderType === "mng" ? "Harga Meet & Greet" : "Harga TwoShot"}
              </th>
              <th className="px-3 md:px-6 py-3 md:py-4 text-center text-sm font-semibold text-gray-300">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredMembers.map((m) => {
              const fg = getFeeByType(m, orderType);
              const price = fg?.fee || 0;
              const full = isFullSlot(m, orderType);
              const teamDetails = getMemberTeamDetails(m.name);
              const inCart = cart.some((item) => item.member_id === m.id);

              return (
                <tr
                  key={m.id}
                  className={[
                    'transition-all duration-200',
                    full ? 'opacity-50 bg-red-950/10' : `${teamDetails.rowBg} ${teamDetails.rowHover}`
                  ].join(' ')}
                >
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=3B82F6&color=fff`}
                        alt={m.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-700"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=3B82F6&color=fff`; }}
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-white">{m.name}</span>
                          <TeamBadge teamName={teamDetails.name} />
                          {full && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-bold align-middle">
                              FULLSLOT
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-right">
                    <span className="font-semibold text-amber-500">{formatCurrency(price)}</span>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                    <button
                      onClick={() => addToCart(m)}
                      disabled={!isOpen || full}
                      title={full ? 'Member ini sedang fullslot' : ''}
                      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm w-36 ${full
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600"
                        : inCart
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
                          : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-md shadow-amber-500/10"
                        }`}
                    >
                      {full ? (
                        'Fullslot'
                      ) : inCart ? (
                        <span>✓ Ditambahkan</span>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Tambah</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 px-4 flex flex-col items-center justify-center animate-fadeIn">
      <div className="w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center mb-3">
        <Search className="w-5 h-5 text-gray-500" />
      </div>
      <h3 className="text-base font-semibold text-white mb-1">Member tidak ditemukan</h3>
      <p className="text-xs text-gray-400 max-w-xs">
        Coba gunakan kata kunci lain atau ubah filter team.
      </p>
    </div>
  );
}

function MemberSection({
  filteredMembers,
  isOpen,
  cart,
  addToCart,
  orderType,
  isFullSlot,
  getFeeByType,
  getMemberTeamDetails,
  searchQuery,
  setSearchQuery,
  selectedTeam,
  setSelectedTeam,
  sortBy,
  setSortBy
}) {
  return (
    <div className={`bg-[#12161F] rounded-2xl border border-gray-800 overflow-hidden transition-opacity ${!isOpen ? "opacity-60 pointer-events-none select-none" : ""}`}>
      <div className="p-4 md:p-6 border-b border-gray-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg md:text-xl font-bold shrink-0">Pilih Member</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:flex-1 md:justify-end max-w-xl">
            <div className="flex-1 min-w-[200px]">
              <MemberSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} isOpen={isOpen} />
            </div>
            <div className="shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                disabled={!isOpen}
                className="w-full sm:w-44 px-3 py-2.5 bg-[#0A0E17] border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm focus:border-transparent cursor-pointer disabled:cursor-not-allowed"
              >
                <option value="default">Urutkan: Default</option>
                <option value="name_asc">Nama A-Z</option>
                <option value="price_asc">Harga Termurah</option>
                <option value="price_desc">Harga Tertinggi</option>
              </select>
            </div>
          </div>
        </div>

        <TeamFilterChips selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} />
      </div>

      <div>
        {filteredMembers.length === 0 ? (
          <EmptyState />
        ) : (
          <MemberTable
            filteredMembers={filteredMembers}
            isOpen={isOpen}
            cart={cart}
            addToCart={addToCart}
            orderType={orderType}
            isFullSlot={isFullSlot}
            getFeeByType={getFeeByType}
            getMemberTeamDetails={getMemberTeamDetails}
          />
        )}
      </div>
    </div>
  );
}

export default function TwoShot() {
  const { user } = useAuth(); // eslint-disable-line no-unused-vars
  const { showToast } = useToast();

  const { isOpen, loading: statusLoading } = useIsServiceOpen("two_shot");

  const [successOpen, setSuccessOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [members, setMembers] = useState([]);
  const [terms, setTerms] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [cart, setCart] = useState([]);
  const [targetWar, setTargetWar] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState("Semua");
  const [sortBy, setSortBy] = useState("default");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer_name: "",
      contact_twitter: "",
      contact_line: "",
      contact_email: "",
      password_jkt: "",
      account_type: "",
      agree_terms: false,
    },
  });

  const watchAccountType = watch("account_type");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('members-fullslot')
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'members',
          filter: `is_active=eq.true`
        },
        (payload) => {
          console.log('Realtime update member:', payload.new.name, 'full_slots:', payload.new.full_slots);

          setMembers(prev =>
            prev.map(m =>
              m.id === payload.new.id
                ? { ...m, full_slots: payload.new.full_slots || [] }
                : m
            )
          );

          setCart(prev =>
            prev.filter(item => {
              if (item.member_id === payload.new.id && isFullSlot(payload.new, ORDER_TYPE)) {
                showToast(`${payload.new.name} telah menjadi FULLSLOT, dihapus dari keranjang.`, "warning");
                return false;
              }
              if (item.backup_id === payload.new.id && isFullSlot(payload.new, ORDER_TYPE)) {
                showToast(`Member cadangan ${payload.new.name} telah menjadi FULLSLOT, cadangan dihapus.`, "warning");
                return false;
              }
              return true;
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [members]);

  useEffect(() => {
    document.body.style.overflow = successOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [successOpen]);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      const { data: membersData, error: membersError } = await supabase
        .from("members")
        .select(`
          id, name, is_active, photo_url, full_slots,
          member_fees (
            id, fee_type, fee_group_id,
            fee_groups ( id, name, fee, description, fee_type, is_active )
          )
        `)
        .eq("is_active", true);

      if (membersError) throw membersError;

      const normalized = (membersData || []).map((m) => ({
        ...m,
        member_fees: Array.isArray(m.member_fees) ? m.member_fees : [],
      }));

      const onlyWithFee = normalized.filter((m) => {
        const fg = getFeeByType(m, ORDER_TYPE);
        return !!fg?.id && (fg?.is_active ?? true);
      });

      // Sort by JKT48 Team order and alphabetically inside
      const sortedMembers = onlyWithFee.sort((a, b) => {
        const teamA = getMemberTeamDetails(a.name);
        const teamB = getMemberTeamDetails(b.name);
        if (teamA.order !== teamB.order) return teamA.order - teamB.order;
        return (a.name || "").localeCompare(b.name || "");
      });

      const { data: termsData, error: termsError } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", TERMS_KEY)
        .maybeSingle();

      if (termsError) throw termsError;

      setMembers(sortedMembers);
      setTerms(termsData?.value || "");
    } catch (err) {
      setError(err?.message || "Gagal memuat data.");
      showToast("Gagal memuat data: " + (err?.message || "unknown error"), "error");
    } finally {
      setLoading(false);
    }
  }

  const filteredMembers = useMemo(() => {
    const q = (searchQuery || "").toLowerCase();

    // 1. Filter
    const filtered = members.filter((m) => {
      const matchesSearch = (m.name || "").toLowerCase().includes(q);
      const teamDetails = getMemberTeamDetails(m.name);
      const matchesTeam = selectedTeam === "Semua" ||
        (selectedTeam === "Dream" && teamDetails.name === "Team Dream") ||
        (selectedTeam === "Love" && teamDetails.name === "Team Love") ||
        (selectedTeam === "Passion" && teamDetails.name === "Team Passion") ||
        (selectedTeam === "Trainee" && (teamDetails.name === "Trainee" || teamDetails.name === "Trainee / Lainnya"));
      return matchesSearch && matchesTeam;
    });

    // 2. Sort
    return [...filtered].sort((a, b) => {
      if (sortBy === "name_asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "price_asc") {
        const priceA = getFeeByType(a, ORDER_TYPE)?.fee || 0;
        const priceB = getFeeByType(b, ORDER_TYPE)?.fee || 0;
        return priceA - priceB;
      }
      if (sortBy === "price_desc") {
        const priceA = getFeeByType(a, ORDER_TYPE)?.fee || 0;
        const priceB = getFeeByType(b, ORDER_TYPE)?.fee || 0;
        return priceB - priceA;
      }
      // Default: team order and alphabetical inside
      const teamA = getMemberTeamDetails(a.name);
      const teamB = getMemberTeamDetails(b.name);
      if (teamA.order !== teamB.order) return teamA.order - teamB.order;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [members, searchQuery, selectedTeam, sortBy]);

  const addToCart = (member) => {
    if (!isOpen) return;

    if (isFullSlot(member, ORDER_TYPE)) {
      showToast(`${member.name} sedang fullslot untuk layanan ini`, 'error');
      return;
    }
    const fg = getFeeByType(member, ORDER_TYPE);

    // Auto-pick default event date based on filtered targetWar
    const activeEvents = TOUR_EVENTS.filter((x) => targetWar === "all" || x.war === targetWar);
    const defaultEvent = activeEvents.length > 0 ? activeEvents[0] : null;

    setCart((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        order_type: ORDER_TYPE,
        member_id: member.id,
        member_name: member.name,
        fee_group_id: fg?.id || null,
        fee: fg?.fee || 0,
        eventId: defaultEvent ? defaultEvent.id : "",
        date: defaultEvent ? defaultEvent.date : "",
        session: "",
        backup_id: "",
        backup_name: "",
        backup_eventId: "",
        backup_date: "",
        backup_session: "",
      },
    ]);
    showToast(`${member.name} ditambahkan ke keranjang`, "success");
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    showToast("Item dihapus dari keranjang", "info");
  };

  const updateCartItem = (itemId, field, value) =>
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );

  const updateBackupMember = (itemId, memberId) => {
    const member = members.find((m) => String(m.id) === String(memberId));
    const activeEvents = TOUR_EVENTS.filter((x) => targetWar === "all" || x.war === targetWar);
    const defaultEvent = activeEvents.length > 0 ? activeEvents[0] : null;

    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
            ...item,
            backup_id: memberId,
            backup_name: member?.name || "",
            backup_eventId: memberId ? (defaultEvent ? defaultEvent.id : "") : "",
            backup_date: memberId ? (defaultEvent ? defaultEvent.date : "") : "",
          }
          : item
      )
    );
  };

  const handleEventChange = (itemId, eventId) => {
    if (eventId === "custom") {
      setCart((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, eventId: "custom", date: "" } : item
        )
      );
    } else {
      const ev = TOUR_EVENTS.find((x) => x.id === eventId);
      setCart((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, eventId: eventId, date: ev ? ev.date : "" }
            : item
        )
      );
    }
  };

  const handleBackupEventChange = (itemId, eventId) => {
    if (eventId === "custom") {
      setCart((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, backup_eventId: "custom", backup_date: "" } : item
        )
      );
    } else {
      const ev = TOUR_EVENTS.find((x) => x.id === eventId);
      setCart((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, backup_eventId: eventId, backup_date: ev ? ev.date : "" }
            : item
        )
      );
    }
  };

  const getAvailableBackupMembers = () => members;

  const totalFee = useMemo(
    () => cart.reduce((sum, item) => sum + (Number(item.fee) || 0), 0),
    [cart]
  );

  const filteredEvents = useMemo(() => {
    return TOUR_EVENTS.filter((x) => targetWar === "all" || x.war === targetWar);
  }, [targetWar]);

  async function onSubmit(data) {
    if (!isOpen) return;

    if (cart.length === 0) {
      showToast("Keranjang kosong! Tambahkan minimal 1 member.", "error");
      return;
    }

    const invalidItems = cart.filter((item) => !item.date || !item.session);
    if (invalidItems.length > 0) {
      showToast("Lengkapi tanggal dan sesi untuk semua item di keranjang!", "error");
      return;
    }

    const invalidBackups = cart.filter((item) => {
      if (!item.backup_id) return false;
      if (item.backup_id && (!item.backup_date || !item.backup_session)) return true;
      if (
        item.backup_id === item.member_id &&
        item.backup_date === item.date &&
        item.backup_session === item.session
      ) return true;
      return false;
    });

    if (invalidBackups.length > 0) {
      showToast("Cadangan dengan member & tanggal sama harus sesi berbeda!", "error");
      return;
    }

    try {
      setSubmitting(true);

      const noteLines = cart.map((item, idx) => {
        let dateStr = item.date;
        if (item.eventId && item.eventId !== "custom") {
          const ev = TOUR_EVENTS.find((x) => x.id === item.eventId);
          if (ev) {
            const warLbl = ev.war === "war_15" ? "War 15 Juni" : "War 22 Juni";
            dateStr = `${ev.date} [${warLbl}]`;
          }
        }

        let backupStr = "";
        if (item.backup_name && item.backup_date && item.backup_session) {
          let backupDateStr = item.backup_date;
          if (item.backup_eventId && item.backup_eventId !== "custom") {
            const ev = TOUR_EVENTS.find((x) => x.id === item.backup_eventId);
            if (ev) {
              const warLbl = ev.war === "war_15" ? "War 15 Juni" : "War 22 Juni";
              backupDateStr = `${ev.date} [${warLbl}]`;
            }
          }
          backupStr = ` | backup: ${item.backup_name} (${backupDateStr} | ${item.backup_session})`;
        }

        const main = `${dateStr} | ${item.session} | ${item.member_name}`;
        return `${idx + 1}. ${main}${backupStr}`;
      });

      const payload = {
        customer_name: data.customer_name,
        contact_twitter: data.contact_twitter || null,
        contact_line: data.contact_line || null,
        contact_email: data.contact_email,
        password_jkt: data.password_jkt,
        account_type: data.account_type,
        order_type: ORDER_TYPE,
        status: "pending",
        total_fee: totalFee,
        note: noteLines.join("\n"),
      };

      const { error } = await supabase.from("orders").insert(payload);
      if (error) throw error;

      setCart([]);
      setCreatedOrder({ ...payload, created_at: new Date().toISOString() });
      setSuccessOpen(true);
    } catch (err) {
      showToast("Gagal membuat pesanan: " + (err?.message || "unknown error"), "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || statusLoading) return <PageLoader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  return (
    <div className="min-h-screen bg-[#0A0E17] text-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 anim-fade-up">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 flex items-center justify-center gap-3">
            <Camera className="w-8 h-8 md:w-10 md:h-10 text-primary-500" />
            Joki TwoShot <span className="text-primary-500">JKT48</span>
          </h1>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
            Dapatkan foto TwoShot bareng member favoritmu! Booking mudah, cepat, dan aman.
          </p>
        </div>

        <div className="max-w-6xl mx-auto mb-6 anim-fade-up anim-d2">
          <ServiceStatusBanner serviceKey="two_shot" />
        </div>

        {/* War Tour Selection Banner */}
        <div className="max-w-6xl mx-auto mb-6 bg-[#12161F] border border-gray-800 rounded-2xl p-4 md:p-6 shadow-xl anim-fade-up anim-d2">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-base md:text-lg font-bold flex items-center gap-2 text-white">
                <Calendar className="w-5 h-5 text-amber-500" />
                Target Jadwal War Teater Sementara (Tour Yogyakarta &amp; Surabaya)
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Pilih target jadwal war untuk menyaring pilihan event dan mempermudah pengisian formulir.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "all", label: "Semua Event" },
                { id: "war_15", label: "War 15 Juni" },
                { id: "war_22", label: "War 22 Juni" }
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setTargetWar(btn.id)}
                  className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-lg border transition-all ${targetWar === btn.id
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20"
                    : "bg-[#0A0E17] text-gray-300 border-gray-700 hover:border-gray-500 hover:text-white"
                    }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6 anim-fade-up anim-d3">
            <MemberSection
              filteredMembers={filteredMembers}
              isOpen={isOpen}
              cart={cart}
              addToCart={addToCart}
              orderType={ORDER_TYPE}
              isFullSlot={isFullSlot}
              getFeeByType={getFeeByType}
              getMemberTeamDetails={getMemberTeamDetails}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedTeam={selectedTeam}
              setSelectedTeam={setSelectedTeam}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />

            {/* Terms */}
            <div className="bg-[#12161F] rounded-2xl border border-gray-800 p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold mb-2 md:mb-3">Syarat dan Ketentuan</h3>
              <p className="text-sm text-gray-400 mb-3 md:mb-4">Harap dibaca sebelum melakukan pemesanan</p>
              {showTerms ? (
                <div className="bg-[#0A0E17] border border-gray-700 rounded-lg p-4 max-h-80 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans">{terms}</pre>
                  <button onClick={() => setShowTerms(false)} className="mt-4 text-primary-400 hover:text-primary-300 font-medium text-sm">← Tutup</button>
                </div>
              ) : (
                <div className="bg-[#0A0E17] border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 mb-3 text-sm">Dengan melakukan pemesanan, Anda menyetujui syarat dan ketentuan yang berlaku...</p>
                  <button onClick={() => setShowTerms(true)} className="text-primary-400 hover:text-primary-300 font-medium text-sm">Baca Selengkapnya →</button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6 anim-slide-l anim-d4">
            {/* Cart */}
            <div className={`bg-[#12161F] rounded-2xl border border-gray-800 transition-opacity ${!isOpen ? "opacity-60 pointer-events-none select-none" : ""}`}>
              <div className="p-4 md:p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-primary-500" />
                    Keranjang ({cart.length})
                  </h3>
                  {cart.length > 0 && (
                    <button onClick={() => setCart([])} className="text-sm text-red-400 hover:text-red-300 font-medium">Kosongkan</button>
                  )}
                </div>
              </div>

              <div className="p-4 md:p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="mb-1">Keranjang kosong</p>
                    <p className="text-sm">Tambahkan member dari daftar</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[55vh] lg:max-h-[600px] overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.id} className="bg-[#0A0E17] border border-gray-700 rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-white truncate">{item.member_name}</h4>
                            <p className="text-sm text-gray-400">{formatCurrency(item.fee)}</p>
                            <p className="text-xs text-gray-500 mt-1">1 member = 1 foto</p>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300 p-1 flex-shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className={item.eventId === "custom" ? "sm:col-span-2" : "sm:col-span-1"}>
                            <label className="text-xs text-gray-300 mb-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-amber-400" /> Pilih Event / Tanggal
                            </label>
                            <select
                              value={item.eventId || ""}
                              onChange={(e) => handleEventChange(item.id, e.target.value)}
                              className="w-full px-3 py-2 text-sm bg-[#12161F] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                              required
                            >
                              <option value="">-- Pilih Event --</option>
                              {filteredEvents.map((ev) => (
                                <option key={ev.id} value={ev.id}>{ev.label}</option>
                              ))}
                              <option value="custom">Input Manual / Tanggal Lain</option>
                            </select>
                            {item.eventId === "custom" && (
                              <input
                                type="date"
                                value={item.date}
                                onChange={(e) => updateCartItem(item.id, "date", e.target.value)}
                                className="w-full mt-2 px-3 py-2 text-sm bg-[#0A0E17] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                required
                              />
                            )}
                          </div>
                          <div className={item.eventId === "custom" ? "sm:col-span-2" : "sm:col-span-1"}>
                            <label className="text-xs text-gray-300 mb-1 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-300" /> Sesi
                            </label>
                            <select
                              value={item.session}
                              onChange={(e) => updateCartItem(item.id, "session", e.target.value)}
                              className="w-full px-3 py-2 text-sm bg-[#12161F] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                              required
                            >
                              <option value="">Pilih</option>
                              <option value="Sesi 1">Sesi 1</option>
                              <option value="Sesi 2">Sesi 2</option>
                              <option value="Sesi 3">Sesi 3</option>
                              <option value="Sesi 4">Sesi 4</option>
                              <option value="Sesi 5">Sesi 5</option>
                              <option value="Sesi 6">Sesi 6</option>
                              <option value="Sesi 7">Sesi 7</option>
                              <option value="Sesi 8">Sesi 8</option>
                            </select>
                          </div>
                        </div>

                        {/* Backup */}
                        <div className="border-t border-gray-700 pt-3 space-y-3">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Shield className="w-3 h-3" />
                            <span>Member Cadangan (Opsional)</span>
                          </div>
                          <div>
                            <label className="text-xs text-gray-300 mb-1 block">Pilih Member</label>
                            <select
                              value={item.backup_id}
                              onChange={(e) => updateBackupMember(item.id, e.target.value)}
                              className="w-full px-3 py-2 text-sm bg-[#12161F] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="">Tidak ada cadangan</option>
                              {getAvailableBackupMembers().map((m) => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                              ))}
                            </select>
                          </div>
                          {item.backup_id && (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className={item.backup_eventId === "custom" ? "sm:col-span-2" : "sm:col-span-1"}>
                                  <label className="text-xs text-gray-300 mb-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-amber-400" /> Event Cadangan
                                  </label>
                                  <select
                                    value={item.backup_eventId || ""}
                                    onChange={(e) => handleBackupEventChange(item.id, e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-[#12161F] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    required
                                  >
                                    <option value="">-- Pilih Event --</option>
                                    {filteredEvents.map((ev) => (
                                      <option key={ev.id} value={ev.id}>{ev.label}</option>
                                    ))}
                                    <option value="custom">Input Manual / Tanggal Lain</option>
                                  </select>
                                  {item.backup_eventId === "custom" && (
                                    <input
                                      type="date"
                                      value={item.backup_date}
                                      onChange={(e) => updateCartItem(item.id, "backup_date", e.target.value)}
                                      className="w-full mt-2 px-3 py-2 text-sm bg-[#0A0E17] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                      required
                                    />
                                  )}
                                </div>
                                <div className={item.backup_eventId === "custom" ? "sm:col-span-2" : "sm:col-span-1"}>
                                  <label className="text-xs text-gray-300 mb-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-gray-300" /> Sesi Cadangan
                                  </label>
                                  <select
                                    value={item.backup_session}
                                    onChange={(e) => updateCartItem(item.id, "backup_session", e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-[#12161F] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                  >
                                    <option value="">Pilih</option>
                                    <option value="Sesi 1">Sesi 1</option>
                                    <option value="Sesi 2">Sesi 2</option>
                                    <option value="Sesi 3">Sesi 3</option>
                                    <option value="Sesi 4">Sesi 4</option>
                                    <option value="Sesi 5">Sesi 5</option>
                                    <option value="Sesi 6">Sesi 6</option>
                                    <option value="Sesi 7">Sesi 7</option>
                                    <option value="Sesi 8">Sesi 8</option>
                                  </select>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-gray-700 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">{cart.length} Sesi</span>
                        <span className="text-sm text-gray-400">Total:</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Pembayaran</span>
                        <span className="text-2xl font-bold text-primary-400">{formatCurrency(totalFee)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <div className={`bg-[#12161F] rounded-2xl border border-gray-800 transition-opacity ${!isOpen ? "opacity-60 pointer-events-none select-none" : ""}`}>
              <div className="p-4 md:p-6 border-b border-gray-800">
                <h3 className="text-base md:text-lg font-bold">Data Pelanggan</h3>
                <p className="text-sm text-gray-400 mt-1">Isi data dengan lengkap dan benar</p>
              </div>

              <div className="p-4 md:p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nama Lengkap *</label>
                    <input
                      type="text"
                      {...register("customer_name")}
                      disabled={!isOpen}
                      className="w-full px-4 py-3 bg-[#0A0E17] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed"
                      placeholder="Nama lengkap Anda"
                    />
                    {errors.customer_name && (
                      <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />{errors.customer_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Username Twitter</label>
                    <input
                      type="text"
                      {...register("contact_twitter")}
                      disabled={!isOpen}
                      className="w-full px-4 py-3 bg-[#0A0E17] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed"
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">No. WhatsApp Aktif</label>
                    <input
                      type="text"
                      {...register("contact_line")}
                      disabled={!isOpen}
                      className="w-full px-4 py-3 bg-[#0A0E17] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed"
                      placeholder="Contoh: 08123456789"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimal isi salah satu: Twitter atau WhatsApp</p>
                    {errors.contact_twitter && (
                      <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />{errors.contact_twitter.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Gmail Akun JKT48 *</label>
                    <input
                      type="email"
                      {...register("contact_email")}
                      disabled={!isOpen}
                      className="w-full px-4 py-3 bg-[#0A0E17] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed"
                      placeholder="email@example.com"
                    />
                    {errors.contact_email && (
                      <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />{errors.contact_email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Password Akun JKT48 *</label>
                    <input
                      type="password"
                      {...register("password_jkt")}
                      disabled={!isOpen}
                      className="w-full px-4 py-3 bg-[#0A0E17] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed"
                      placeholder="••••••••"
                    />
                    {errors.password_jkt && (
                      <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />{errors.password_jkt.message}
                      </p>
                    )}
                  </div>

                  {/* ── Tipe Akun ── */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tipe Akun JKT48 *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "ofc", label: "OFC" },
                        { value: "general", label: "General" },
                      ].map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex flex-col gap-1 p-3 rounded-lg border-2 cursor-pointer transition-all select-none ${watchAccountType === opt.value
                            ? "border-primary-500 bg-primary-900/20"
                            : "border-gray-700 bg-[#0A0E17] hover:border-gray-500"
                            } ${!isOpen ? "cursor-not-allowed opacity-50" : ""}`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              value={opt.value}
                              {...register("account_type")}
                              disabled={!isOpen}
                              className="accent-primary-600 w-4 h-4"
                            />
                            <span className={`font-semibold text-sm ${watchAccountType === opt.value ? "text-primary-400" : "text-white"}`}>
                              {opt.label}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 pl-6">{opt.desc}</span>
                        </label>
                      ))}
                    </div>
                    {errors.account_type && (
                      <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />{errors.account_type.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="agree_terms"
                      {...register("agree_terms")}
                      disabled={!isOpen}
                      className="mt-1 w-4 h-4 accent-primary-600 bg-[#0A0E17] border-gray-700 rounded disabled:cursor-not-allowed"
                    />
                    <label htmlFor="agree_terms" className="text-sm text-gray-300">
                      Saya setuju dengan{" "}
                      <button type="button" onClick={() => setShowTerms(true)} className="text-primary-400 hover:text-primary-300 underline">
                        syarat dan ketentuan
                      </button>{" "}
                      yang berlaku
                    </label>
                  </div>
                  {errors.agree_terms && (
                    <p className="text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />{errors.agree_terms.message}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || cart.length === 0 || !isOpen}
                    className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                  >
                    {submitting ? "Memproses..." : !isOpen ? "Layanan Tidak Tersedia" : "Kirim Pesanan"}
                  </button>

                  {cart.length === 0 && isOpen && (
                    <p className="text-xs text-center text-gray-500">Tambahkan minimal 1 member ke keranjang untuk melanjutkan</p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>

        {successOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 md:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSuccessOpen(false)} />
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto rounded-2xl border border-gray-800 bg-[#0A0E17] shadow-2xl">
              <OrderSuccess order={createdOrder} inModal onClose={() => setSuccessOpen(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}