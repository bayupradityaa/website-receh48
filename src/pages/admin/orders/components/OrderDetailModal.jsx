import { useState, useEffect } from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Textarea } from '../../../../components/ui/Textarea';
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
  onSaveAdminNote,
  adminsList = [],
}) {
  const [editTotalFee, setEditTotalFee] = useState('');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (!order) return;
    setEditTotalFee(formatNumberID(order.total_fee ?? 0));
    setEditAssignedTo(order.assigned_to ?? '');
    setAdminNote(order.admin_note ?? '');
    setShowPassword(false);
    setSaving(false);
    setSavingNote(false);
  }, [order, isOpen]);

  if (!order) return null;

  const handleSaveMeta = async () => {
    try {
      setSaving(true);
      const success = await onSaveMeta(
        order.id,
        parseNumberID(editTotalFee),
        editAssignedTo || null
      );
      if (success) {
        window.dispatchEvent(new Event('refreshDashboardStats'));
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNote = async () => {
    if (!onSaveAdminNote) return;
    try {
      setSavingNote(true);
      await onSaveAdminNote(order.id, adminNote);
    } finally {
      setSavingNote(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setSaving(true);

      if (newStatus === 'done') {
        const inputFee = parseNumberID(editTotalFee);
        const fallbackFee = Number(order.total_fee ?? 0);
        const finalFee = inputFee > 0 ? inputFee : fallbackFee;

        if (!finalFee || finalFee <= 0) {
          alert('Total Fee masih kosong. Isi dulu biar masuk ke Profit.');
          return;
        }

        const metaOk = await onSaveMeta(order.id, finalFee, editAssignedTo || null);
        if (!metaOk) return;
      }

      const success = await onUpdateStatus(order.id, newStatus);
      if (success) {
        window.dispatchEvent(new Event('refreshDashboardStats'));
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const assignedAdmin = adminsList.find((a) => a.id === order.assigned_to);

  return (
    <Modal isOpen={isOpen} onClose={saving ? () => { } : onClose} title="Detail Pesanan" size="lg">
      <div className="space-y-5">

        {/* ── Order Info ───────────────────────────────────────────────────── */}
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

          {/* Password JKT48 */}
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

          {/* ── BARU: Tipe Akun ── */}
          <div>
            <strong className="text-white">Tipe Akun:</strong>
            <div className="mt-1">
              {order.account_type === 'ofc' ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-sm font-semibold">
                  OFC
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 bg-gray-800 text-gray-400 border border-gray-700 rounded-full text-sm">
                  General
                </span>
              )}
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

        {/* ── Detail Pesanan ───────────────────────────────────────────────── */}
        <div>
          <strong className="text-white">Detail Pesanan:</strong>
          <div className="mt-2 bg-dark-900 p-4 rounded-lg border border-dark-600">
            <p className="whitespace-pre-wrap text-dark-300">{order.note || '-'}</p>
          </div>
        </div>

        {/* ── Catatan Admin ────────────────────────────────────────────────── */}
        <div className="border-t border-gray-800 pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              Catatan Admin
              <span className="text-xs font-normal text-gray-500">
                (tidak terlihat oleh customer)
              </span>
            </h4>
            <Button
              onClick={handleSaveNote}
              variant="outline"
              size="sm"
              isLoading={savingNote}
              disabled={saving}
            >
              Simpan Catatan
            </Button>
          </div>

          <Textarea
            label=""
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="Tulis catatan internal admin di sini..."
            rows={3}
            disabled={saving || savingNote}
          />

          {order.admin_note_updated_at && (
            <p className="mt-1.5 text-xs text-gray-500">
              Terakhir diedit: {formatDateTime(order.admin_note_updated_at)}
            </p>
          )}
        </div>

        {/* ── Update Order ─────────────────────────────────────────────────── */}
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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Admin PIC (Dikerjakan Oleh)
              </label>
              <div className="relative">
                <select
                  value={editAssignedTo}
                  onChange={(e) => setEditAssignedTo(e.target.value)}
                  disabled={saving}
                  className="w-full px-3 py-2.5 bg-[#0A0E17] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none disabled:opacity-50"
                >
                  <option value="">— Belum di-assign —</option>
                  {adminsList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.full_name || a.email || a.id}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                  ▼
                </span>
              </div>
              {assignedAdmin && (
                <p className="mt-1 text-xs text-gray-500">
                  Saat ini: {assignedAdmin.full_name || assignedAdmin.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Actions ──────────────────────────────────────────────────────── */}
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
              ✅ Selesai
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