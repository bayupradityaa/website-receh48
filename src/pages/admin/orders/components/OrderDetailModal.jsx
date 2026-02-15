import { useState, useEffect } from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import {
  formatCurrency,
  formatDateTime,
  getStatusColor,
  getStatusLabel,
} from '../../../../lib/utils';

function formatNumberID(value) {
  const clean = String(value ?? '').replace(/\D/g, '');
  if (!clean) return '';
  return new Intl.NumberFormat('id-ID').format(Number(clean));
}

function parseNumberID(value) {
  return Number(String(value ?? '').replace(/\D/g, '')) || 0;
}

export default function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onSaveMeta,
}) {
  const [editTotalFee, setEditTotalFee] = useState('');
  const [editHandledBy, setEditHandledBy] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!order) return;
    setEditTotalFee(formatNumberID(order.total_fee ?? 0));
    setEditHandledBy(order.handled_by ?? '');
    setShowPassword(false);
    setSaving(false);
  }, [order, isOpen]);

  if (!order) return null;

  const handleSaveMeta = async () => {
    try {
      setSaving(true);
      const success = await onSaveMeta(
        order.id,
        parseNumberID(editTotalFee),
        editHandledBy
      );

      if (success) {
        window.dispatchEvent(new Event('refreshDashboardStats'));
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setSaving(true);

      // ✅ kalau mark done, pastikan total_fee tersimpan dulu
      if (newStatus === 'done') {
        const inputFee = parseNumberID(editTotalFee);
        const fallbackFee = Number(order.total_fee ?? 0);
        const finalFee = inputFee > 0 ? inputFee : fallbackFee;

        if (!finalFee || finalFee <= 0) {
          alert('Total Fee masih kosong. Isi dulu biar masuk ke Profit.');
          return;
        }

        // simpan meta dulu (fee + handled_by), biar revenue pasti kebaca
        const metaOk = await onSaveMeta(order.id, finalFee, editHandledBy);
        if (!metaOk) return;
      }

      const success = await onUpdateStatus(order.id, newStatus);

      if (success) {
        // ✅ trigger refresh stats segera
        window.dispatchEvent(new Event('refreshDashboardStats'));
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={saving ? () => {} : onClose} title="Detail Pesanan" size="lg">
      <div className="space-y-5">
        {/* Order Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong className="text-white">Nama:</strong>
            <p className="text-dark-300 mt-1">{order.customer_name || '-'}</p>
          </div>

          <div>
            <strong className="text-white">Email:</strong>
            <p className="text-dark-300 mt-1">{order.contact_email || '-'}</p>
          </div>

          <div>
            <strong className="text-white">Twitter:</strong>
            <p className="text-dark-300 mt-1">{order.contact_twitter || '-'}</p>
          </div>

          <div>
            <strong className="text-white">LINE:</strong>
            <p className="text-dark-300 mt-1">{order.contact_line || '-'}</p>
          </div>

          {/* Password JKT */}
          <div className="md:col-span-2">
            <strong className="text-white">Password Akun JKT48:</strong>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1">
                <Input
                  label=""
                  type={showPassword ? 'text' : 'password'}
                  value={order.password_jkt || ''}
                  readOnly
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPassword((v) => !v)}
                disabled={saving}
              >
                {showPassword ? 'Sembunyikan' : 'Tampilkan'}
              </Button>
            </div>
            <p className="mt-1 text-xs text-dark-500">
              Pastikan hanya admin yang berwenang membuka password.
            </p>
          </div>

          <div>
            <strong className="text-white">Status:</strong>
            <div className="mt-1">
              <Badge className={getStatusColor(order.status)}>
                {getStatusLabel(order.status)}
              </Badge>
            </div>
          </div>

          <div>
            <strong className="text-white">Dibuat:</strong>
            <p className="text-dark-300 mt-1">{formatDateTime(order.created_at)}</p>
          </div>

          <div className="md:col-span-2">
            <strong className="text-white">Total Fee:</strong>
            <p className="text-dark-300 mt-1 text-lg font-semibold">
              {formatCurrency(order.total_fee ?? 0)}
            </p>
          </div>
        </div>

        {/* Note */}
        <div>
          <strong className="text-white">Detail Pesanan:</strong>
          <div className="mt-2 bg-dark-900 p-4 rounded-lg border border-dark-600">
            <p className="whitespace-pre-wrap text-dark-300">{order.note || '-'}</p>
          </div>
        </div>

        {/* Editable */}
        <div className="border-t border-gray-800 pt-4">
          <h4 className="font-semibold text-white mb-3">Update Order</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Total Fee (Manual)"
              type="text"
              value={editTotalFee}
              onChange={(e) => setEditTotalFee(formatNumberID(e.target.value))}
              placeholder="contoh: 120.000"
              helperText={`Preview: ${formatCurrency(parseNumberID(editTotalFee))}`}
            />

            <Input
              label="Dikerjakan Oleh"
              type="text"
              value={editHandledBy}
              onChange={(e) => setEditHandledBy(e.target.value)}
              placeholder="Nama admin / operator"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-800">
          <Button onClick={handleSaveMeta} variant="primary" size="sm" isLoading={saving}>
            Simpan
          </Button>

          <div className="flex gap-2 ml-auto">
            <Button
              onClick={() => handleUpdateStatus('confirmed')}
              variant="primary"
              size="sm"
              disabled={saving}
            >
              Confirm
            </Button>

            <Button
              onClick={() => handleUpdateStatus('done')}
              variant="secondary"
              size="sm"
              disabled={saving}
            >
              ✅ Mark Done
            </Button>

            <Button
              onClick={() => handleUpdateStatus('cancelled')}
              variant="danger"
              size="sm"
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
