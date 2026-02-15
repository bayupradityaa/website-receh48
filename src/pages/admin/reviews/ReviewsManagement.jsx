import { useMemo, useState } from "react";
import { useReviewsAdmin } from "./hooks/useReviewsAdmin";

import Section from "../shared/Section";
import EmptyState from "../shared/EmptyState";
import ConfirmDeleteModal from "../shared/ConfirmDeleteModal";

import ReviewsTable from "./components/ReviewsTable";
import ReviewDetailModal from "./components/ReviewDetailModal";

import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";

export default function ReviewsManagement() {
  const {
    items,
    loading,
    err,
    q,
    setQ,
    service,
    setService,
    status,
    setStatus,
    approve,
    remove,
  } = useReviewsAdmin();

  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const serviceOptions = useMemo(() => {
    const set = new Set(items.map((x) => x.service_type).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [items]);

  const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "ALL", label: "All" },
  ];

  const serviceSelectOptions = serviceOptions.map((x) => ({
    value: x,
    label: x === "ALL" ? "Semua" : x,
  }));

  async function onApprove(id) {
    await approve(id, true);
  }
  async function onUnapprove(id) {
    await approve(id, false);
  }

  return (
    <Section
      title="Reviews Approval"
      subtitle="Approve/unapprove review yang masuk sebelum tampil di Home."
    >
      {/* Filters */}
      <div className="bg-[#12161F] rounded-2xl border border-gray-800 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Cari pesan"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="contoh: cepat / aman / recommended..."
            />
          </div>

          <div>
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={statusOptions}
            />
          </div>

          <div>
            <Select
              label="Layanan"
              value={service}
              onChange={(e) => setService(e.target.value)}
              options={serviceSelectOptions}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {err && (
        <div className="mb-6">
          <EmptyState title="Error" description={err} />
        </div>
      )}

      {loading ? (
        <div className="bg-[#12161F] rounded-2xl border border-gray-800 p-12 text-center font-semibold text-gray-300">
          Loading...
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Tidak ada review"
          description="Belum ada review untuk kondisi filter ini."
        />
      ) : (
        <ReviewsTable
          items={items}
          onOpen={(r) => setDetail(r)}
          onApprove={onApprove}
          onUnapprove={onUnapprove}
          onDelete={(r) => setDeleteTarget(r)}
        />
      )}

      {/* Detail modal */}
      <ReviewDetailModal open={!!detail} review={detail} onClose={() => setDetail(null)} />

      {/* Delete confirm */}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Hapus review?"
        description="Review yang dihapus tidak bisa dikembalikan."
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await remove(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </Section>
  );
}
