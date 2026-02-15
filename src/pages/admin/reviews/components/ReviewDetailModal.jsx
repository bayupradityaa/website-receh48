import { Badge } from "../../../../components/ui/Badge";
import { Button } from "../../../../components/ui/Button";

export default function ReviewDetailModal({ open, onClose, review }) {
  if (!open || !review) return null;

  const dateText = review.created_at ? new Date(review.created_at).toLocaleString("id-ID") : "-";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#12161F] rounded-2xl shadow-2xl border border-gray-800 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-white">Detail Review</h3>
            <p className="text-sm text-gray-400 mt-1">{dateText}</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-10 h-10 p-0 rounded-full"
            aria-label="Close"
          >
            ✕
          </Button>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Badge className="bg-primary-500/15 text-primary-200 border-primary-500/30">
              {review.service_type || "-"}
            </Badge>

            <Badge className="bg-white/5 text-white border-gray-800">
              {(review.rating || 0).toFixed(1)}
            </Badge>

            {review.is_approved ? (
              <Badge variant="success">Approved</Badge>
            ) : (
              <Badge variant="warning">Pending</Badge>
            )}
          </div>

          <div className="rounded-2xl border border-gray-800 bg-[#0A0E17] p-4">
            <p className="text-gray-200 font-medium whitespace-pre-wrap">
              {review.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
