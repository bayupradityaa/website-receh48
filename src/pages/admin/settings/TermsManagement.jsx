import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../contexts/ToastContext';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import { Card, CardContent } from '../../../components/ui/Card';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import Section from '../shared/Section';

export default function TermsManagement() {
  const [terms, setTerms] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchTerms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchTerms() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_content')
        .select('value')
        .eq('key', 'terms_videocall')
        .single();

      if (error) throw error;
      setTerms(data.value || '');
    } catch (err) {
      showToast('error', 'Gagal memuat S&K: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveTerms() {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('site_content')
        .upsert(
          { 
            key: 'terms_videocall', 
            value: terms, 
            updated_at: new Date().toISOString() 
          },
          { onConflict: 'key' }
        );

      if (error) throw error;
      showToast('success', 'S&K berhasil disimpan');
    } catch (err) {
      showToast('error', 'Gagal menyimpan S&K: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section
      title="Manajemen Syarat & Ketentuan"
      description="Edit syarat dan ketentuan yang ditampilkan di halaman pemesanan"
    >
      {loading ? (
        <LoadingSpinner size="lg" className="py-20" />
      ) : (
        <Card>
          <CardContent>
            <Textarea
              label="Syarat & Ketentuan Video Call"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              placeholder="Masukkan syarat dan ketentuan di sini..."
            />
            <div className="mt-4 flex gap-2">
              <Button onClick={saveTerms} isLoading={saving} disabled={saving}>
                Simpan Perubahan
              </Button>
              <Button 
                variant="outline" 
                onClick={fetchTerms}
                disabled={saving}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </Section>
  );
}