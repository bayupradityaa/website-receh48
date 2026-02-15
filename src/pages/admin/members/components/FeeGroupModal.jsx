import { useState, useEffect } from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { Textarea } from '../../../../components/ui/Textarea';
import { Button } from '../../../../components/ui/Button';
import { Video, Camera, Handshake } from 'lucide-react';

function formatNumberID(value) {
  const clean = String(value).replace(/\D/g, '');
  if (!clean) return '';
  return new Intl.NumberFormat('id-ID').format(Number(clean));
}

function parseNumberID(value) {
  return Number(String(value).replace(/\D/g, '')) || 0;
}

const FEE_TYPES = [
  {
    value: 'vc',
    label: 'Video Call',
    icon: <Video className="w-5 h-5" />,
    active:   'border-blue-500   bg-blue-900/20   text-blue-300',
    inactive: 'border-gray-700   bg-gray-900/20   text-gray-400 hover:border-gray-600',
  },
  {
    value: 'twoshot',
    label: 'TwoShot',
    icon: <Camera className="w-5 h-5" />,
    active:   'border-purple-500 bg-purple-900/20 text-purple-300',
    inactive: 'border-gray-700   bg-gray-900/20   text-gray-400 hover:border-gray-600',
  },
  {
    value: 'mng',
    label: 'Meet & Greet',
    icon: <Handshake className="w-5 h-5" />,
    active:   'border-green-500  bg-green-900/20  text-green-300',
    inactive: 'border-gray-700   bg-gray-900/20   text-gray-400 hover:border-gray-600',
  },
];

export default function FeeGroupModal({ isOpen, onClose, onSave, group }) {
  const [formData, setFormData] = useState({
    name:        '',
    fee:         '',
    description: '',
    fee_type:    'vc',
    is_active:   true,
  });

  useEffect(() => {
    if (!isOpen) return;
    if (group) {
      setFormData({
        name:        group.name        || '',
        fee:         formatNumberID(group.fee || 0),
        description: group.description || '',
        fee_type:    group.fee_type    || 'vc',
        is_active:   group.is_active   ?? true,
      });
    } else {
      setFormData({ name: '', fee: '', description: '', fee_type: 'vc', is_active: true });
    }
  }, [group, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Nama fee group harus diisi!');
    const feeValue = parseNumberID(formData.fee);
    if (feeValue <= 0) return alert('Harga harus lebih dari 0!');

    const success = await onSave({
      name:        formData.name.trim(),
      fee:         feeValue,
      description: formData.description.trim(),
      fee_type:    formData.fee_type,
      is_active:   !!formData.is_active,
    });
    if (success) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={group ? 'Edit Fee Group' : 'Tambah Fee Group Baru'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Fee Type — 3 kolom */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tipe Fee <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {FEE_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setFormData((p) => ({ ...p, fee_type: t.value }))}
                className={`px-3 py-3 rounded-lg border-2 transition-all font-medium flex flex-col items-center gap-1 text-sm ${
                  formData.fee_type === t.value ? t.active : t.inactive
                }`}
              >
                {t.icon}
                <span className="text-xs text-center leading-tight">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Nama Fee Group"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
          placeholder="Contoh: VC 50K / MnG 80K"
          required
        />

        <Input
          label="Harga per Member & Sesi"
          type="text"
          value={formData.fee}
          onChange={(e) => setFormData((p) => ({ ...p, fee: formatNumberID(e.target.value) }))}
          placeholder="Contoh: 50.000"
          helperText={`Preview: Rp ${parseNumberID(formData.fee).toLocaleString('id-ID')}`}
          required
        />

        <Textarea
          label="Deskripsi"
          value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          placeholder="Contoh: Harga per member & sesi"
          rows={3}
        />

        <div className="flex items-center gap-3 pt-1">
          <input
            type="checkbox"
            id="is_active"
            checked={!!formData.is_active}
            onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))}
            className="w-4 h-4 accent-primary-600 rounded"
          />
          <label htmlFor="is_active" className="text-sm text-gray-300">Fee group aktif</label>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-800">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">Batal</Button>
          <Button type="submit" variant="primary" className="flex-1">{group ? 'Update' : 'Tambah'}</Button>
        </div>
      </form>
    </Modal>
  );
}