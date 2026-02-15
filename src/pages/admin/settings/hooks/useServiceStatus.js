import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";

// =============================================
//  useServiceStatus
//  Lokasi: src/pages/admin/settings/hooks/useServiceStatus.js
//  Bisa dipakai di admin (read+write) maupun user (read only)
// =============================================

export function useServiceStatus(serviceKey = null) {
  const [statuses, setStatuses]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);

  const fetchStatuses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("service_status")
        .select("*")
        .order("service_name");

      if (serviceKey) {
        query = query.eq("service_key", serviceKey).single();
      }

      const { data, error: e } = await query;
      if (e) throw e;

      // kalau single (serviceKey ada), wrap jadi array biar konsisten
      setStatuses(serviceKey ? [data] : (data || []));
    } catch (err) {
      setError(err?.message || "Gagal memuat status layanan.");
    } finally {
      setLoading(false);
    }
  }, [serviceKey]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  // Update status + message
  const updateStatus = useCallback(async (id, newStatus, newMessage = null) => {
    try {
      setSaving(true);
      setError(null);

      const { error: e } = await supabase
        .from("service_status")
        .update({ status: newStatus, message: newMessage })
        .eq("id", id);

      if (e) throw e;

      // update local state langsung tanpa refetch
      setStatuses((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: newStatus, message: newMessage } : s
        )
      );

      return { success: true };
    } catch (err) {
      setError(err?.message || "Gagal update status.");
      return { success: false, error: err?.message };
    } finally {
      setSaving(false);
    }
  }, []);

  // Helper: ambil status satu service by key
  const getStatus = useCallback(
    (key) => statuses.find((s) => s.service_key === key) || null,
    [statuses]
  );

  return { statuses, loading, saving, error, updateStatus, getStatus, refetch: fetchStatuses };
}