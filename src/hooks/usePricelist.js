import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function usePricelist(feeType = 'vc') {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPricelist();
    }, [feeType]);

    async function fetchPricelist() {
        try {
            setLoading(true);
            setError(null);

            // 1. Fetch rows dari view members_with_fees, filter by fee_group_type
            const { data: rows, error: rowsError } = await supabase
                .from('members_with_fees')
                .select('id, name, fee_group_id, fee_group_name, fee')
                .eq('fee_group_type', feeType)
                .eq('is_active', true)
                .order('fee', { ascending: false });

            if (rowsError) throw rowsError;

            if (!rows || rows.length === 0) {
                setGroups([]);
                return;
            }

            // 2. Group by fee_group_id — setiap grup punya list members
            const groupMap = new Map();

            rows.forEach((row) => {
                if (!groupMap.has(row.fee_group_id)) {
                    groupMap.set(row.fee_group_id, {
                        id: row.fee_group_id,
                        name: row.fee_group_name,
                        fee: row.fee,
                        members: [],
                    });
                }
                groupMap.get(row.fee_group_id).members.push({
                    id: row.id,
                    name: row.name,
                });
            });

            // 3. Sort grup by fee descending (Premium → Regular → Basic)
            const grouped = Array.from(groupMap.values()).sort(
                (a, b) => b.fee - a.fee
            );

            setGroups(grouped);
        } catch (err) {
            console.error('Error fetching pricelist:', err);
            setError(err?.message || 'Gagal memuat pricelist.');
        } finally {
            setLoading(false);
        }
    }

    return { groups, loading, error, refetch: fetchPricelist };
}