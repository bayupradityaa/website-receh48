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

            // Perbaikan: Ambil data langsung dari tabel members dengan join
            const { data: membersData, error: membersError } = await supabase
                .from('members')
                .select(`
                    id,
                    name,
                    is_active,
                    photo_url,
                    full_slots,
                    member_fees!inner (
                        fee_type,
                        fee_group_id,
                        fee_groups!inner (
                            id,
                            name,
                            fee,
                            fee_type,
                            is_active
                        )
                    )
                `)
                .eq('member_fees.fee_type', feeType)
                .eq('member_fees.fee_groups.is_active', true)
                .eq('is_active', true);

            if (membersError) throw membersError;

            if (!membersData || membersData.length === 0) {
                setGroups([]);
                return;
            }

            // Group by fee_group_id
            const groupMap = new Map();

            membersData.forEach((member) => {
                // Ambil fee_groups dari member_fees
                const feeGroup = member.member_fees?.[0]?.fee_groups;
                if (!feeGroup) return;

                const groupId = feeGroup.id;

                if (!groupMap.has(groupId)) {
                    groupMap.set(groupId, {
                        id: groupId,
                        name: feeGroup.name,
                        fee: feeGroup.fee,
                        members: [],
                    });
                }

                groupMap.get(groupId).members.push({
                    id: member.id,
                    name: member.name,
                    photo_url: member.photo_url,
                    full_slots: member.full_slots || [], // ← Pastikan full_slots disimpan
                });
            });

            // Sort groups by fee descending
            const grouped = Array.from(groupMap.values()).sort(
                (a, b) => b.fee - a.fee
            );

            console.log('Pricelist groups with full_slots:', grouped); // Debug
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