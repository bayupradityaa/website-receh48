import { Button } from '../../../components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDeleteModal({
  isOpen,
  title = 'Hapus Data',
  description = 'Aksi ini tidak bisa dibatalkan. Yakin ingin menghapus?',
  confirmText,
  cancelText,
  confirmLabel,
  cancelLabel,
  isLoading,
  loading,
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null;

  const finalLoading = typeof isLoading === 'boolean' ? isLoading : !!loading;
  const finalConfirmText = confirmText || confirmLabel || 'Hapus';
  const finalCancelText = cancelText || cancelLabel || 'Batal';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={finalLoading ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-[#12161F] border border-gray-800 shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={finalLoading}
              className="px-4 py-2 bg-[#0A0E17] hover:bg-[#1A1F2E] border border-gray-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {finalCancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={finalLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {finalLoading ? 'Menghapus...' : finalConfirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}