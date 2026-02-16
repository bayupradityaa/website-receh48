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

const orderSchema = z
  .object({
    customer_name: z.string().min(3, "Nama minimal 3 karakter"),
    contact_twitter: z.string().optional(),
    contact_line: z.string().optional(),
    contact_email: z.string().email("Email tidak valid"),
    password_jkt: z.string().min(1, "Password harus diisi"),
    agree_terms: z.boolean().refine((val) => val === true, {
      message: "Anda harus menyetujui syarat dan ketentuan",
    }),
  })
  .refine((data) => data.contact_twitter || data.contact_line, {
    message: "Minimal salah satu dari Twitter atau LINE harus diisi",
    path: ["contact_twitter"],
  });

function getFeeByType(member, feeType) {
  const arr = Array.isArray(member?.member_fees) ? member.member_fees : [];
  const item = arr.find((x) => x?.fee_type === feeType);
  return item?.fee_groups || null;
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // eslint-disable-line no-unused-vars
  } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer_name: "",
      contact_twitter: "",
      contact_line: "",
      contact_email: "",
      password_jkt: "",
      agree_terms: false,
    },
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

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
        .select(
          `
          id, name, is_active, photo_url,
          member_fees (
            id, fee_type, fee_group_id,
            fee_groups ( id, name, fee, description, fee_type, is_active )
          )
        `
        )
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

      const sortedMembers = onlyWithFee.sort((a, b) => {
        const feeA = getFeeByType(a, ORDER_TYPE)?.fee ?? 0;
        const feeB = getFeeByType(b, ORDER_TYPE)?.fee ?? 0;
        if (feeB !== feeA) return feeB - feeA;
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
      showToast(
        "Gagal memuat data: " + (err?.message || "unknown error"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredMembers = useMemo(() => {
    const q = (searchQuery || "").toLowerCase();
    return members.filter((m) => (m.name || "").toLowerCase().includes(q));
  }, [members, searchQuery]);

  const addToCart = (member) => {
    if (!isOpen) return;

    const fg = getFeeByType(member, ORDER_TYPE);
    setCart((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        order_type: ORDER_TYPE,
        member_id: member.id,
        member_name: member.name,
        fee_group_id: fg?.id || null,
        fee: fg?.fee || 0,
        date: "",
        session: "",
        backup_id: "",
        backup_name: "",
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
    updateCartItem(itemId, "backup_id", memberId);
    updateCartItem(itemId, "backup_name", member?.name || "");
  };

  const getAvailableBackupMembers = () => members;

  const totalFee = useMemo(
    () => cart.reduce((sum, item) => sum + (Number(item.fee) || 0), 0),
    [cart]
  );

  async function onSubmit(data) {
    if (!isOpen) return;

    if (cart.length === 0) {
      showToast("Keranjang kosong! Tambahkan minimal 1 member.", "error");
      return;
    }

    const invalidItems = cart.filter((item) => !item.date || !item.session);
    if (invalidItems.length > 0) {
      showToast(
        "Lengkapi tanggal dan sesi untuk semua item di keranjang!",
        "error"
      );
      return;
    }

    const invalidBackups = cart.filter((item) => {
      if (!item.backup_id) return false;
      if (item.backup_id && (!item.backup_date || !item.backup_session))
        return true;

      if (
        item.backup_id === item.member_id &&
        item.backup_date === item.date &&
        item.backup_session === item.session
      )
        return true;

      return false;
    });

    if (invalidBackups.length > 0) {
      showToast("Cadangan dengan member & tanggal sama harus sesi berbeda!", "error");
      return;
    }

    try {
      setSubmitting(true);

      const noteLines = cart.map((item, idx) => {
        const main = `${item.date} | ${item.session} | ${item.member_name}`;
        if (item.backup_name && item.backup_date && item.backup_session) {
          return `${idx + 1}. ${main} | backup: ${item.backup_name} (${item.backup_date} | ${item.backup_session})`;
        }
        return `${idx + 1}. ${main}`;
      });

      const payload = {
        customer_name: data.customer_name,
        contact_twitter: data.contact_twitter || null,
        contact_line: data.contact_line || null,
        contact_email: data.contact_email,
        password_jkt: data.password_jkt,
        order_type: ORDER_TYPE,
        status: "pending",
        total_fee: totalFee,
        note: noteLines.join("\n"),
      };

      const { error } = await supabase.from("orders").insert(payload);

      if (error) throw error;

      setCart([]);

      setCreatedOrder({
        ...payload,
        created_at: new Date().toISOString(),
      });

      setSuccessOpen(true);
    } catch (err) {
      showToast(
        "Gagal membuat pesanan: " + (err?.message || "unknown error"),
        "error"
      );
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
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 flex items-center justify-center gap-3">
            <Camera className="w-8 h-8 md:w-10 md:h-10 text-primary-500" />
            Joki TwoShot <span className="text-primary-500">JKT48</span>
          </h1>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
            Dapatkan foto TwoShot bareng member favoritmu! Booking mudah, cepat,
            dan aman.
          </p>
        </div>

        {/* Banner status */}
        <div className="max-w-7xl mx-auto mb-6">
          <ServiceStatusBanner serviceKey="two_shot" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <div
              className={`bg-[#12161F] rounded-2xl border border-gray-800 overflow-hidden transition-opacity ${
                !isOpen ? "opacity-60 pointer-events-none select-none" : ""
              }`}
            >
              <div className="p-4 md:p-6 border-b border-gray-800">
                <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">
                  Pilih Member
                </h2>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Cari nama member..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={!isOpen}
                    className="w-full pl-10 pr-4 py-3 bg-[#0A0E17] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Desktop: Table */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <div className="max-h-[520px] overflow-y-auto">
                    <table className="w-full">
                      <thead className="sticky top-0 bg-[#1A1F2E] z-10">
                        <tr className="border-b border-gray-800">
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                            Member
                          </th>
                          <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                            Harga TwoShot
                          </th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                            Aksi
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-800">
                        {filteredMembers.map((m) => {
                          const fg = getFeeByType(m, ORDER_TYPE);
                          const price = fg?.fee || 0;

                          return (
                            <tr
                              key={m.id}
                              className="hover:bg-[#1A1F2E] transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={
                                      m.photo_url ||
                                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        m.name
                                      )}&background=3B82F6&color=fff`
                                    }
                                    alt={m.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-700"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        m.name
                                      )}&background=3B82F6&color=fff`;
                                    }}
                                  />
                                  <span className="font-medium text-white">
                                    {m.name}
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-4 text-right">
                                <span className="font-semibold text-primary-400">
                                  {formatCurrency(price)}
                                </span>
                              </td>

                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => addToCart(m)}
                                  disabled={!isOpen}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm"
                                >
                                  <Plus className="w-4 h-4" />
                                  Tambah
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {filteredMembers.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <p>Tidak ada member yang ditemukan.</p>
                        <p className="text-sm mt-2">
                          Pastikan member sudah di-assign ke fee group TwoShot
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile: Card list */}
              <div className="md:hidden p-4">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <p>Tidak ada member yang ditemukan.</p>
                    <p className="text-sm mt-2">
                      Pastikan member sudah di-assign ke fee group TwoShot
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    {filteredMembers.map((m) => {
                      const fg = getFeeByType(m, ORDER_TYPE);
                      const price = fg?.fee || 0;

                      return (
                        <div
                          key={m.id}
                          className="bg-[#0A0E17] border border-gray-700 rounded-xl p-3 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={
                                m.photo_url ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  m.name
                                )}&background=3B82F6&color=fff`
                              }
                              alt={m.name}
                              className="w-11 h-11 rounded-full object-cover border border-gray-700 flex-shrink-0"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  m.name
                                )}&background=3B82F6&color=fff`;
                              }}
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate">
                                {m.name}
                              </p>
                              <p className="text-sm font-semibold text-primary-400">
                                {formatCurrency(price)}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => addToCart(m)}
                            disabled={!isOpen}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm flex-shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                            Tambah
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="bg-[#12161F] rounded-2xl border border-gray-800 p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold mb-2 md:mb-3">
                Syarat dan Ketentuan
              </h3>
              <p className="text-sm text-gray-400 mb-3 md:mb-4">
                Harap dibaca sebelum melakukan pemesanan
              </p>

              {showTerms ? (
                <div className="bg-[#0A0E17] border border-gray-700 rounded-lg p-4 max-h-80 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans">
                    {terms}
                  </pre>
                  <button
                    onClick={() => setShowTerms(false)}
                    className="mt-4 text-primary-400 hover:text-primary-300 font-medium text-sm"
                  >
                    ← Tutup
                  </button>
                </div>
              ) : (
                <div className="bg-[#0A0E17] border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 mb-3 text-sm">
                    Dengan melakukan pemesanan, Anda menyetujui syarat dan
                    ketentuan yang berlaku...
                  </p>
                  <button
                    onClick={() => setShowTerms(true)}
                    className="text-primary-400 hover:text-primary-300 font-medium text-sm"
                  >
                    Baca Selengkapnya →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            {/* Cart */}
            <div
              className={`bg-[#12161F] rounded-2xl border border-gray-800 transition-opacity lg:sticky lg:top-6 ${
                !isOpen ? "opacity-60 pointer-events-none select-none" : ""
              }`}
            >
              <div className="p-4 md:p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-primary-500" />
                    Keranjang ({cart.length})
                  </h3>

                  {cart.length > 0 && (
                    <button
                      onClick={() => setCart([])}
                      className="text-sm text-red-400 hover:text-red-300 font-medium"
                    >
                      Kosongkan
                    </button>
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
                      <div
                        key={item.id}
                        className="bg-[#0A0E17] border border-gray-700 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-white truncate">
                              {item.member_name}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {formatCurrency(item.fee)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              1 member = 1 foto
                            </p>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-300 p-1 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-300 mb-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-300" />{" "}
                              Tanggal
                            </label>
                            <input
                              type="date"
                              value={item.date}
                              onChange={(e) =>
                                updateCartItem(item.id, "date", e.target.value)
                              }
                              className="w-full px-3 py-2 text-sm bg-[#12161F] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                              required
                            />
                          </div>

                          <div>
                            <label className="text-xs text-gray-300 mb-1 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-300" /> Sesi
                            </label>
                            <select
                              value={item.session}
                              onChange={(e) =>
                                updateCartItem(
                                  item.id,
                                  "session",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 text-sm bg-[#12161F] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                              required
                            >
                              <option value="">Pilih</option>
                              <option value="Sesi 1">Sesi 1</option>
                              <option value="Sesi 2">Sesi 2</option>
                              <option value="Sesi 3">Sesi 3</option>
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
                            <label className="text-xs text-gray-300 mb-1 block">
                              Pilih Member
                            </label>
                            <select
                              value={item.backup_id}
                              onChange={(e) =>
                                updateBackupMember(item.id, e.target.value)
                              }
                              className="w-full px-3 py-2 text-sm bg-[#12161F] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="">Tidak ada cadangan</option>
                              {getAvailableBackupMembers().map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {item.backup_id && (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs text-gray-300 mb-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-gray-300" />{" "}
                                    Tanggal Cadangan
                                  </label>
                                  <input
                                    type="date"
                                    value={item.backup_date}
                                    onChange={(e) =>
                                      updateCartItem(
                                        item.id,
                                        "backup_date",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 text-sm bg-[#12161F] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                  />
                                </div>

                                <div>
                                  <label className="text-xs text-gray-300 mb-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-gray-300" />{" "}
                                    Sesi Cadangan
                                  </label>
                                  <select
                                    value={item.backup_session}
                                    onChange={(e) =>
                                      updateCartItem(
                                        item.id,
                                        "backup_session",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 text-sm bg-[#12161F] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                  >
                                    <option value="">Pilih</option>
                                    <option value="Sesi 1">Sesi 1</option>
                                    <option value="Sesi 2">Sesi 2</option>
                                    <option value="Sesi 3">Sesi 3</option>
                                  </select>
                                </div>
                              </div>

                              {item.backup_name &&
                                item.backup_date &&
                                item.backup_session && (
                                  <div className="bg-[#12161F] border border-green-900/30 rounded p-2 text-xs">
                                    <p className="text-green-400 font-medium mb-1">
                                      ✓ Backup aktif
                                    </p>
                                    <p className="text-gray-400">
                                      {item.backup_name} - {item.backup_date} -{" "}
                                      {item.backup_session}
                                    </p>
                                    {item.backup_id === item.member_id &&
                                      item.backup_date === item.date &&
                                      item.backup_session === item.session && (
                                        <p className="text-red-400 text-xs mt-1">
                                          ⚠️ Member & tanggal sama, sesi harus
                                          berbeda!
                                        </p>
                                      )}
                                  </div>
                                )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-gray-700 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">
                          {cart.length} foto
                        </span>
                        <span className="text-sm text-gray-400">Total:</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Pembayaran</span>
                        <span className="text-2xl font-bold text-primary-400">
                          {formatCurrency(totalFee)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <div
              className={`bg-[#12161F] rounded-2xl border border-gray-800 transition-opacity ${
                !isOpen ? "opacity-60 pointer-events-none select-none" : ""
              }`}
            >
              <div className="p-4 md:p-6 border-b border-gray-800">
                <h3 className="text-base md:text-lg font-bold">Data Pelanggan</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Isi data dengan lengkap dan benar
                </p>
              </div>

              <div className="p-4 md:p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      {...register("customer_name")}
                      disabled={!isOpen}
                      className="w-full px-4 py-3 bg-[#0A0E17] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed"
                      placeholder="Nama lengkap Anda"
                    />
                    {errors.customer_name && (
                      <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.customer_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Username Twitter
                    </label>
                    <input
                      type="text"
                      {...register("contact_twitter")}
                      disabled={!isOpen}
                      className="w-full px-4 py-3 bg-[#0A0E17] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed"
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ID LINE
                    </label>
                    <input
                      type="text"
                      {...register("contact_line")}
                      disabled={!isOpen}
                      className="w-full px-4 py-3 bg-[#0A0E17] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed"
                      placeholder="line_id"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimal isi salah satu: Twitter atau LINE
                    </p>
                    {errors.contact_twitter && (
                      <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.contact_twitter.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Gmail Akun JKT48 *
                    </label>
                    <input
                      type="email"
                      {...register("contact_email")}
                      disabled={!isOpen}
                      className="w-full px-4 py-3 bg-[#0A0E17] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed"
                      placeholder="email@example.com"
                    />
                    {errors.contact_email && (
                      <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.contact_email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Password Akun JKT48 *
                    </label>
                    <input
                      type="password"
                      {...register("password_jkt")}
                      disabled={!isOpen}
                      className="w-full px-4 py-3 bg-[#0A0E17] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed"
                      placeholder="••••••••"
                    />
                    {errors.password_jkt && (
                      <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.password_jkt.message}
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
                      <button
                        type="button"
                        onClick={() => setShowTerms(true)}
                        className="text-primary-400 hover:text-primary-300 underline"
                      >
                        syarat dan ketentuan
                      </button>{" "}
                      yang berlaku
                    </label>
                  </div>
                  {errors.agree_terms && (
                    <p className="text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.agree_terms.message}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || cart.length === 0 || !isOpen}
                    className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                  >
                    {submitting
                      ? "Memproses..."
                      : !isOpen
                      ? "Layanan Tidak Tersedia"
                      : "Kirim Pesanan"}
                  </button>

                  {cart.length === 0 && isOpen && (
                    <p className="text-xs text-center text-gray-500">
                      Tambahkan minimal 1 member ke keranjang untuk melanjutkan
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {successOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 md:p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSuccessOpen(false)}
            />
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto rounded-2xl border border-gray-800 bg-[#0A0E17] shadow-2xl">
              <OrderSuccess
                order={createdOrder}
                inModal
                onClose={() => setSuccessOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
