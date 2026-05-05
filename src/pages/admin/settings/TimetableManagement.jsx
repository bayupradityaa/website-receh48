import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../contexts/ToastContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { Image as ImageIcon } from 'lucide-react';
import Section from '../shared/Section';
import EmptyState from '../shared/EmptyState';

const BUCKET = 'timetable';

export default function TimetableManagement() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [editUploading, setEditUploading] = useState(false);

  // Add modal state
  const [addMode, setAddMode] = useState('upload'); // 'upload' or 'url'
  const [newImageUrl, setNewImageUrl] = useState('');
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Edit modal state
  const [editMode, setEditMode] = useState('upload');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editPreviewFile, setEditPreviewFile] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState('');
  const editFileInputRef = useRef(null);

  const { showToast } = useToast();

  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchImages() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('timetable_images')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (err) {
      showToast('error', 'Gagal memuat gambar: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ------- Upload file to Supabase Storage ------- */
  async function uploadFile(file) {
    const ext = file.name.split('.').pop();
    const fileName = `timetable_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  /* ------- Handle file selection ------- */
  function handleFileSelect(file, isEdit = false) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('error', 'File harus berupa gambar (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'Ukuran file maksimal 10MB');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    if (isEdit) {
      setEditPreviewFile(file);
      setEditPreviewUrl(objectUrl);
    } else {
      setPreviewFile(file);
      setPreviewUrl(objectUrl);
    }
  }

  /* ------- Add image ------- */
  async function addImage() {
    try {
      setUploading(true);
      let imageUrl = '';

      if (addMode === 'upload') {
        if (!previewFile) {
          showToast('error', 'Pilih file gambar terlebih dahulu');
          return;
        }
        imageUrl = await uploadFile(previewFile);
      } else {
        if (!newImageUrl.trim()) {
          showToast('error', 'URL gambar tidak boleh kosong');
          return;
        }
        imageUrl = newImageUrl.trim();
      }

      const maxOrder = images.length > 0 ? Math.max(...images.map((img) => img.order_index)) : 0;

      const { error } = await supabase.from('timetable_images').insert({
        image_url: imageUrl,
        order_index: maxOrder + 1,
        is_active: true,
      });

      if (error) throw error;

      showToast('success', 'Gambar berhasil ditambahkan');
      resetAddModal();
      fetchImages();
    } catch (err) {
      showToast('error', 'Gagal menambah gambar: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  function resetAddModal() {
    setShowAddModal(false);
    setNewImageUrl('');
    setPreviewFile(null);
    setPreviewUrl('');
    setAddMode('upload');
    setDragOver(false);
  }

  /* ------- Update image ------- */
  async function updateImage(imageId) {
    try {
      setEditUploading(true);
      let imageUrl = '';

      if (editMode === 'upload' && editPreviewFile) {
        imageUrl = await uploadFile(editPreviewFile);
      } else if (editMode === 'url') {
        if (!editImageUrl.trim()) {
          showToast('error', 'URL gambar tidak boleh kosong');
          return;
        }
        imageUrl = editImageUrl.trim();
      } else {
        showToast('error', 'Pilih file atau masukkan URL gambar');
        return;
      }

      const { error } = await supabase
        .from('timetable_images')
        .update({ image_url: imageUrl })
        .eq('id', imageId);

      if (error) throw error;

      showToast('success', 'Gambar berhasil diupdate');
      resetEditState();
      fetchImages();
    } catch (err) {
      showToast('error', 'Gagal update gambar: ' + err.message);
    } finally {
      setEditUploading(false);
    }
  }

  function resetEditState() {
    setEditingImage(null);
    setEditImageUrl('');
    setEditPreviewFile(null);
    setEditPreviewUrl('');
    setEditMode('upload');
  }

  /* ------- Delete image ------- */
  async function deleteImage(imageId) {
    if (!confirm('Yakin ingin menghapus gambar ini?')) return;

    try {
      const { error } = await supabase.from('timetable_images').delete().eq('id', imageId);
      if (error) throw error;

      showToast('success', 'Gambar berhasil dihapus');
      fetchImages();
    } catch (err) {
      showToast('error', 'Gagal menghapus gambar: ' + err.message);
    }
  }

  /* ------- Toggle active ------- */
  async function toggleActive(imageId, currentStatus) {
    try {
      const { error } = await supabase
        .from('timetable_images')
        .update({ is_active: !currentStatus })
        .eq('id', imageId);

      if (error) throw error;

      showToast('success', 'Status gambar diupdate');
      fetchImages();
    } catch (err) {
      showToast('error', 'Gagal update status: ' + err.message);
    }
  }

  /* ------- Move image ------- */
  async function moveImage(imageId, direction) {
    try {
      const currentIndex = images.findIndex((img) => img.id === imageId);
      if (currentIndex === -1) return;

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= images.length) return;

      const currentImage = images[currentIndex];
      const targetImage = images[targetIndex];

      const { error } = await supabase.from('timetable_images').upsert([
        {
          id: currentImage.id,
          image_url: currentImage.image_url,
          order_index: targetImage.order_index,
          is_active: currentImage.is_active,
        },
        {
          id: targetImage.id,
          image_url: targetImage.image_url,
          order_index: currentImage.order_index,
          is_active: targetImage.is_active,
        },
      ]);

      if (error) throw error;

      showToast('success', 'Urutan gambar diupdate');
      fetchImages();
    } catch (err) {
      showToast('error', 'Gagal mengubah urutan: ' + err.message);
    }
  }

  /* ------- Drop zone handlers ------- */
  function handleDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }
  function handleDragLeave(e) {
    e.preventDefault();
    setDragOver(false);
  }
  function handleDrop(e, isEdit = false) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file, isEdit);
  }

  return (
    <Section
      title="Manajemen Gambar Timetable"
      description="Kelola gambar yang ditampilkan di slider timetable homepage"
      actions={
        <Button onClick={() => setShowAddModal(true)} variant="primary">
          Tambah Gambar
        </Button>
      }
    >
      {loading ? (
        <LoadingSpinner size="lg" className="py-20" />
      ) : (
        <>
          {images.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title="Belum ada gambar timetable"
              description='Klik tombol "Tambah Gambar" untuk menambahkan gambar slider'
              actionLabel="Tambah Gambar"
              onAction={() => setShowAddModal(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="bg-[#12161F] rounded-2xl border border-gray-800 overflow-hidden hover:bg-white/5 transition-colors"
                >
                  <div className="relative aspect-video bg-[#0A0E17]">
                    <img
                      src={image.image_url}
                      alt={`Timetable ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />

                    <div className="absolute top-2 right-2">
                      <Badge variant={image.is_active ? 'success' : 'danger'}>
                        {image.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-lg text-sm font-semibold border border-gray-800">
                      #{image.order_index}
                    </div>
                  </div>

                  <div className="p-4">
                    {editingImage === image.id ? (
                      <div className="space-y-3">
                        {/* Edit mode tabs */}
                        <div className="flex gap-1 bg-[#0A0E17] rounded-lg p-1">
                          <button
                            onClick={() => setEditMode('upload')}
                            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
                              editMode === 'upload'
                                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            📁 Upload File
                          </button>
                          <button
                            onClick={() => setEditMode('url')}
                            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
                              editMode === 'url'
                                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            🔗 URL
                          </button>
                        </div>

                        {editMode === 'upload' ? (
                          <div>
                            <input
                              ref={editFileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileSelect(e.target.files?.[0], true)}
                            />
                            <button
                              onClick={() => editFileInputRef.current?.click()}
                              className="w-full py-3 border-2 border-dashed border-gray-700 hover:border-amber-500/50 rounded-xl text-center text-xs text-gray-400 hover:text-amber-300 transition-all"
                            >
                              {editPreviewFile ? editPreviewFile.name : 'Klik untuk pilih gambar baru'}
                            </button>
                            {editPreviewUrl && (
                              <img src={editPreviewUrl} alt="Preview" className="w-full h-24 object-cover rounded-lg mt-2 border border-gray-700" />
                            )}
                          </div>
                        ) : (
                          <Input
                            type="text"
                            value={editImageUrl}
                            onChange={(e) => setEditImageUrl(e.target.value)}
                            placeholder="URL Gambar"
                            className="text-sm"
                          />
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateImage(image.id)}
                            className="flex-1"
                            disabled={editUploading}
                          >
                            {editUploading ? 'Uploading...' : 'Simpan'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={resetEditState}
                            className="flex-1"
                          >
                            Batal
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs text-gray-400 mb-3 break-all line-clamp-2">
                          {image.image_url}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingImage(image.id);
                              setEditImageUrl(image.image_url);
                              setEditMode('upload');
                            }}
                          >
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleActive(image.id, image.is_active)}
                          >
                            {image.is_active ? 'Hide' : 'Show'}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moveImage(image.id, 'up')}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moveImage(image.id, 'down')}
                            disabled={index === images.length - 1}
                          >
                            ↓
                          </Button>

                          <Button size="sm" variant="destructive" onClick={() => deleteImage(image.id)}>
                            Hapus
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Image Modal */}
      <Modal isOpen={showAddModal} onClose={resetAddModal} title="Tambah Gambar Timetable">
        <div className="space-y-4">

          {/* Mode tabs */}
          <div className="flex gap-1 bg-[#0A0E17] rounded-xl p-1">
            <button
              onClick={() => setAddMode('upload')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                addMode === 'upload'
                  ? 'bg-gradient-to-r from-amber-400/20 to-yellow-400/10 text-amber-300 border border-amber-400/30 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              📁 Upload Gambar
            </button>
            <button
              onClick={() => setAddMode('url')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                addMode === 'url'
                  ? 'bg-gradient-to-r from-amber-400/20 to-yellow-400/10 text-amber-300 border border-amber-400/30 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              🔗 Pakai URL
            </button>
          </div>

          {addMode === 'upload' ? (
            <>
              {/* Drop zone */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e)}
                className={`
                  relative cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200
                  ${dragOver
                    ? 'border-amber-400 bg-amber-400/10 scale-[1.01]'
                    : previewFile
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-gray-700 hover:border-amber-500/50 hover:bg-white/[0.02]'
                  }
                `}
              >
                {previewFile ? (
                  <div className="space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-emerald-300 font-semibold">{previewFile.name}</p>
                    <p className="text-xs text-gray-500">{(previewFile.size / 1024 / 1024).toFixed(2)} MB · Klik untuk ganti</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                      <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-white/80 font-semibold">Drag & drop gambar di sini</p>
                      <p className="text-xs text-gray-500 mt-1">atau klik untuk pilih file · JPG, PNG, WebP · Max 10MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="border border-gray-800 rounded-2xl p-3 bg-[#0A0E17]">
                  <p className="text-xs text-gray-400 mb-2">Preview:</p>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl border border-gray-800"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <Input
                label="URL Gambar"
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                required
              />

              <div className="text-sm text-gray-400 bg-[#0A0E17] border border-gray-800 rounded-2xl p-4">
                <p className="font-semibold mb-2 text-white">Tips:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Gunakan URL gambar yang dapat diakses publik</li>
                  <li>Rekomendasi ukuran: 800x450 px atau rasio 16:9</li>
                  <li>Format: JPG, PNG, atau WebP</li>
                </ul>
              </div>

              {newImageUrl && (
                <div className="border border-gray-800 rounded-2xl p-3 bg-[#0A0E17]">
                  <p className="text-xs text-gray-400 mb-2">Preview:</p>
                  <img
                    src={newImageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl border border-gray-800"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </>
          )}

          <Button
            onClick={addImage}
            className="w-full"
            variant="primary"
            disabled={uploading}
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Mengupload...
              </span>
            ) : (
              'Tambah Gambar'
            )}
          </Button>
        </div>
      </Modal>
    </Section>
  );
}
