import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";

const PAGE_SIZE = 20;

export function useReviewsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // filters
  const [q, setQ] = useState("");
  const [service, setService] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  async function fetchReviews() {
    try {
      setLoading(true);
      setErr(null);

      let query = supabase
        .from("reviews")
        .select("id, service_type, rating, message, created_at, is_approved")
        .order("created_at", { ascending: false });

      // status filter
      if (status === "APPROVED") query = query.eq("is_approved", true);
      if (status === "PENDING") query = query.eq("is_approved", false);

      // service filter
      if (service !== "ALL") query = query.eq("service_type", service);

      // search
      if (q.trim()) query = query.ilike("message", `%${q.trim()}%`);

      // pagination
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error } = await query;
      if (error) throw error;

      setItems(data || []);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Gagal memuat review");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, [q, service, status, page]);

  async function approve(id, isApproved) {
    await supabase
      .from("reviews")
      .update({ is_approved: isApproved })
      .eq("id", id);

    fetchReviews();
  }

  async function remove(id) {
    await supabase.from("reviews").delete().eq("id", id);
    fetchReviews();
  }

  return {
    items,
    loading,
    err,
    q,
    setQ,
    service,
    setService,
    status,
    setStatus,
    page,
    setPage,
    approve,
    remove,
  };
}
