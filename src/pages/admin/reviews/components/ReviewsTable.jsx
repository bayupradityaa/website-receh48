import { Button } from "../../../../components/ui/Button";
import { Badge } from "../../../../components/ui/Badge";

export default function ReviewsTable({ items, onOpen, onApprove, onUnapprove, onDelete }) {
  return (
    <div className="bg-[#12161F] rounded-2xl border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#0A0E17] text-gray-300 border-b border-gray-800">
            <tr>
              <th className="text-left px-5 py-4 font-bold">Tanggal</th>
              <th className="text-left px-5 py-4 font-bold">Layanan</th>
              <th className="text-left px-5 py-4 font-bold">Rating</th>
              <th className="text-left px-5 py-4 font-bold">Pesan</th>
              <th className="text-left px-5 py-4 font-bold">Status</th>
              <th className="text-right px-5 py-4 font-bold">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800">
            {items.map((r) => {
              const dateText = r.created_at
                ? new Date(r.created_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "-";

              return (
                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap text-gray-300">{dateText}</td>

                  <td className="px-5 py-4">
                    <Badge variant="warning" className="bg-primary-500/15 text-primary-200 border-primary-500/30">
                      {r.service_type || "-"}
                    </Badge>
                  </td>

                  <td className="px-5 py-4 font-bold text-white">
                    {(r.rating || 0).toFixed(1)}
                  </td>

                  <td className="px-5 py-4 max-w-[520px]">
                    <button
                      onClick={() => onOpen(r)}
                      className="text-left text-gray-200 hover:text-white hover:underline"
                      title="Lihat detail"
                    >
                      {String(r.message || "").length > 80
                        ? String(r.message).slice(0, 80) + "…"
                        : r.message}
                    </button>
                  </td>

                  <td className="px-5 py-4">
                    {r.is_approved ? (
                      <Badge variant="success">Approved</Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </td>

                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => onOpen(r)}>
                        Detail
                      </Button>

                      {!r.is_approved ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onApprove(r.id)}
                          className="border border-green-500/30 bg-green-500/15 text-green-200 hover:bg-green-500/25"
                        >
                          Approve
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onUnapprove(r.id)}
                        >
                          Unapprove
                        </Button>
                      )}

                      <Button variant="destructive" size="sm" onClick={() => onDelete(r)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center text-gray-400 font-semibold">
                  Tidak ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
