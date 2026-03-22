import { useState, useEffect, useMemo, useRef } from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { X, Image as ImageIcon, Upload, Video, Camera, Handshake } from 'lucide-react';

function getFeeGroupIdByType(member, type) {
  const item = member?.member_fees?.find((x) => x.fee_type === type);
  return item?.fee_group_id || item?.fee_groups?.id || '';
}

export default function MemberModal({ isOpen, onClose, onSave, member, feeGroups = [] }) {
  const vcFeeGroups = useMemo(() => feeGroups.filter((g) => (g.fee_type || 'vc') === 'vc'), [feeGroups]);
  const tsFeeGroups = useMemo(() => feeGroups.filter((g) => g.fee_type === 'twoshot'), [feeGroups]);
  const mngFeeGroups = useMemo(() => feeGroups.filter((g) => g.fee_type === 'mng'), [feeGroups]);

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    is_active: true,
    fee_group_vc_id: '',
    fee_group_twoshot_id: '',
    fee_group_mng_id: '',
  });

  // photoPreview: string (base64 data URL atau URL lama dari member)
  // photoFile: File object jika user upload baru, null jika tidak ada upload baru
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (member) {
      setFormData({
        name: member.name || '',
        is_active: member.is_active ?? true,
        fee_group_vc_id: getFeeGroupIdByType(member, 'vc') || '',
        fee_group_twoshot_id: getFeeGroupIdByType(member, 'twoshot') || '',
        fee_group_mng_id: getFeeGroupIdByType(member, 'mng') || '',
      });
      setPhotoPreview(member.photo_url || '');
    } else {
      setFormData({
        name: '',
        is_active: true,
        fee_group_vc_id: vcFeeGroups?.[0]?.id || '',
        fee_group_twoshot_id: tsFeeGroups?.[0]?.id || '',
        fee_group_mng_id: mngFeeGroups?.[0]?.id || '',
      });
      setPhotoPreview('');
    }

    setPhotoFile(null);
  }, [member, isOpen, vcFeeGroups, tsFeeGroups, mngFeeGroups]);

  // Proses file yang dipilih / di-drop
  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar (JPG, PNG, WEBP, dll).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto maksimal 5 MB.');
      return;
    }

    setPhotoFile(file);

    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => processFile(e.target.files?.[0]);

  const handleClearPhoto = () => {
    setPhotoPreview('');
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag & Drop handlers
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) { alert('Nama member harus diisi!'); return; }

    if (!formData.fee_group_vc_id && !formData.fee_group_twoshot_id && !formData.fee_group_mng_id) {
      alert('Minimal pilih Fee Group VC, TwoShot, atau Meet & Greet!');
      return;
    }

    const success = await onSave({
      name: formData.name.trim(),
      is_active: formData.is_active,
      // Kirim file baru kalau ada, fallback ke preview (URL lama), fallback null
      photo_file: photoFile || null,
      photo_url: !photoFile ? (photoPreview || null) : null,
      fee_group_vc_id: formData.fee_group_vc_id || null,
      fee_group_twoshot_id: formData.fee_group_twoshot_id || null,
      fee_group_mng_id: formData.fee_group_mng_id || null,
    });
    if (success) onClose();
  };

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'Member')}&size=256&background=random&bold=true&length=2`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={member ? 'Edit Member' : 'Tambah Member Baru'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Upload Foto */}
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-2">Foto Member</label>
          <div className="flex items-start gap-4">

            {/* Preview */}
            <div className="relative flex-shrink-0">
              <div className="w-40 h-40 rounded-lg overflow-hidden border-2 border-dark-200 bg-dark-50 flex items-center justify-center">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = fallbackAvatar; }}
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-dark-400" />
                )}
              </div>
              {photoPreview && (
                <button
                  type="button"
                  onClick={handleClearPhoto}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  title="Hapus foto"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Drop Zone */}
            <div className="flex-1 space-y-2">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  w-full h-28 rounded-lg border-2 border-dashed cursor-pointer
                  flex flex-col items-center justify-center gap-2
                  transition-colors select-none
                  ${isDragging
                    ? 'border-primary-400 bg-primary-900/20'
                    : 'border-dark-600 bg-dark-800 hover:border-primary-500 hover:bg-dark-700'}
                `}
              >
                <Upload className={`w-6 h-6 ${isDragging ? 'text-primary-400' : 'text-dark-400'}`} />
                <span className="text-xs text-dark-400 text-center px-2">
                  {isDragging
                    ? 'Lepaskan untuk upload'
                    : 'Klik atau drag & drop foto di sini'}
                </span>
                <span className="text-xs text-dark-600">JPG, PNG, WEBP — maks. 5 MB</span>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Pilih File
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearPhoto}
                  disabled={!photoPreview}
                >
                  Hapus
                </Button>
              </div>

              {photoFile && (
                <p className="text-xs text-green-400 truncate">✓ {photoFile.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Name */}
        <Input
          label="Nama Member"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Contoh: Freya Jayawardana"
          required
        />

        {/* Fee Group VC */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Fee Group VC <span className="text-gray-400">(opsional)</span>
          </label>
          <select
            value={formData.fee_group_vc_id || ''}
            onChange={(e) => setFormData({ ...formData, fee_group_vc_id: e.target.value })}
            className="w-full px-4 py-2 border border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-dark-900 text-gray-200"
          >
            <option value="">-- Tidak ada VC --</option>
            {vcFeeGroups.map((fg) => (
              <option key={fg.id} value={fg.id}>{fg.name} - Rp {Number(fg.fee || 0).toLocaleString('id-ID')}</option>
            ))}
          </select>
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <Video className="w-4 h-4" /> Dipakai untuk order VC
          </div>
        </div>

        {/* Fee Group TwoShot */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Fee Group TwoShot <span className="text-gray-400">(opsional)</span>
          </label>
          <select
            value={formData.fee_group_twoshot_id || ''}
            onChange={(e) => setFormData({ ...formData, fee_group_twoshot_id: e.target.value })}
            className="w-full px-4 py-2 border border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-dark-900 text-gray-200"
          >
            <option value="">-- Tidak ada TwoShot --</option>
            {tsFeeGroups.map((fg) => (
              <option key={fg.id} value={fg.id}>{fg.name} - Rp {Number(fg.fee || 0).toLocaleString('id-ID')}</option>
            ))}
          </select>
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <Camera className="w-4 h-4" /> Dipakai untuk order TwoShot
          </div>
        </div>

        {/* Fee Group Meet & Greet */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Fee Group Meet &amp; Greet <span className="text-gray-400">(opsional)</span>
          </label>
          <select
            value={formData.fee_group_mng_id || ''}
            onChange={(e) => setFormData({ ...formData, fee_group_mng_id: e.target.value })}
            className="w-full px-4 py-2 border border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-dark-900 text-gray-200"
          >
            <option value="">-- Tidak ada Meet &amp; Greet --</option>
            {mngFeeGroups.map((fg) => (
              <option key={fg.id} value={fg.id}>{fg.name} - Rp {Number(fg.fee || 0).toLocaleString('id-ID')}</option>
            ))}
          </select>
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <Handshake className="w-4 h-4" /> Dipakai untuk order Meet &amp; Greet
          </div>
        </div>

        {/* Active */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox" id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="h-4 w-4 accent-primary-600 cursor-pointer"
          />
          <label htmlFor="is_active" className="text-sm text-dark-200 cursor-pointer">Member aktif</label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">Batal</Button>
          <Button type="submit" variant="primary" className="flex-1">{member ? 'Update' : 'Tambah'}</Button>
        </div>
      </form>
    </Modal>
  );
}