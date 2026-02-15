import { useState, useEffect } from 'react';
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

export default function TimetableManagement() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [editingImage, setEditingImage] = useState(null);
  const [editImageUrl, setEditImageUrl] = useState('');
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

  async function addImage() {
    try {
      if (!newImageUrl.trim()) {
        showToast('error', 'URL gambar tidak boleh kosong');
        return;
      }

      const maxOrder = images.length > 0 ? Math.max(...images.map((img) => img.order_index)) : 0;

      const { error } = await supabase.from('timetable_images').insert({
        image_url: newImageUrl,
        order_index: maxOrder + 1,
        is_active: true,
      });

      if (error) throw error;

      showToast('success', 'Gambar berhasil ditambahkan');
      setShowAddModal(false);
      setNewImageUrl('');
      fetchImages();
    } catch (err) {
      showToast('error', 'Gagal menambah gambar: ' + err.message);
    }
  }

  async function updateImage(imageId) {
    try {
      if (!editImageUrl.trim()) {
        showToast('error', 'URL gambar tidak boleh kosong');
        return;
      }

      const { error } = await supabase
        .from('timetable_images')
        .update({ image_url: editImageUrl })
        .eq('id', imageId);

      if (error) throw error;

      showToast('success', 'Gambar berhasil diupdate');
      setEditingImage(null);
      setEditImageUrl('');
      fetchImages();
    } catch (err) {
      showToast('error', 'Gagal update gambar: ' + err.message);
    }
  }

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
                        e.currentTarget.src =
                          'https://via.placeholder.com/800x450/0A0E17/9CA3AF?text=Image+Error';
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
                        <Input
                          type="text"
                          value={editImageUrl}
                          onChange={(e) => setEditImageUrl(e.target.value)}
                          placeholder="URL Gambar"
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => updateImage(image.id)} className="flex-1">
                            Simpan
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingImage(null);
                              setEditImageUrl('');
                            }}
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
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Tambah Gambar Baru">
        <div className="space-y-4">
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
                  e.currentTarget.src =
                    'https://via.placeholder.com/800x450/0A0E17/9CA3AF?text=Invalid+URL';
                }}
              />
            </div>
          )}

          <Button onClick={addImage} className="w-full" variant="primary">
            Tambah Gambar
          </Button>
        </div>
      </Modal>
    </Section>
  );
}
