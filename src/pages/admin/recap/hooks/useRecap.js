import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../lib/supabase';

/**
 * Hook for manual monthly_recaps CRUD.
 * Table: monthly_recaps (id, year, month, total_orders, total_revenue,
 *   total_done, total_cancelled, total_pending, new_members, notes,
 *   created_at, updated_at)
 */
export function useRecap() {
    const [recaps, setRecaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchRecaps = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data, error: err } = await supabase
                .from('monthly_recaps')
                .select('*')
                .order('year', { ascending: false })
                .order('month', { ascending: false });
            if (err) throw err;
            setRecaps(data || []);
        } catch (e) {
            console.error('useRecap fetchRecaps:', e);
            setError(e.message || 'Gagal memuat data rekap');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRecaps(); }, [fetchRecaps]);

    /** Upsert (insert or update) a recap row */
    async function saveRecap(formData) {
        try {
            setSaving(true);
            setError(null);

            // Check if entry for same year+month already exists (for insert)
            const payload = {
                year: Number(formData.year),
                month: Number(formData.month),
                total_orders: Number(formData.total_orders || 0),
                total_revenue: Number(formData.total_revenue || 0),
                total_done: Number(formData.total_done || 0),
                total_cancelled: Number(formData.total_cancelled || 0),
                total_pending: Number(formData.total_pending || 0),
                new_members: Number(formData.new_members || 0),
                notes: formData.notes || null,
                updated_at: new Date().toISOString(),
            };

            let op;
            if (formData.id) {
                // Update existing
                op = await supabase
                    .from('monthly_recaps')
                    .update(payload)
                    .eq('id', formData.id);
            } else {
                // Insert new
                op = await supabase
                    .from('monthly_recaps')
                    .insert({ ...payload, created_at: new Date().toISOString() });
            }

            if (op.error) throw op.error;
            await fetchRecaps();
            return true;
        } catch (e) {
            console.error('useRecap saveRecap:', e);
            setError(e.message || 'Gagal menyimpan rekap');
            return false;
        } finally {
            setSaving(false);
        }
    }

    async function deleteRecap(id) {
        try {
            setSaving(true);
            const { error: err } = await supabase
                .from('monthly_recaps')
                .delete()
                .eq('id', id);
            if (err) throw err;
            await fetchRecaps();
            return true;
        } catch (e) {
            console.error('useRecap deleteRecap:', e);
            setError(e.message || 'Gagal menghapus rekap');
            return false;
        } finally {
            setSaving(false);
        }
    }

    return { recaps, loading, error, saving, fetchRecaps, saveRecap, deleteRecap };
}
