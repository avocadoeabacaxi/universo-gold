import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Video, Plus, Search, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import LeftSidebar from '@/components/sidebar/LeftSidebar';

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', embed_url: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      setUserProfile(profiles[0] || null);
      const v = await base44.entities.Video.filter({ status: 'active' }, '-created_date', 30);
      setVideos(v);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    const v = await base44.entities.Video.create({
      ...form,
      uploader_id: currentUser?.id,
      uploader_name: currentUser?.full_name,
      status: 'active',
    });
    setVideos(prev => [v, ...prev]);
    setForm({ title: '', description: '', embed_url: '' });
    setDialogOpen(false);
    setSaving(false);
  };

  const filtered = videos.filter(v => v.title.toLowerCase().includes(search.toLowerCase()));
  const canAdd = userProfile?.role === 'admin' || userProfile?.role === 'department_leader';
  const enrichedUser = currentUser ? { ...currentUser, job_title: userProfile?.job_title, department: userProfile?.department } : null;

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-4">
      <div className="flex gap-4">
        {/* Left Sidebar */}
        <div className="hidden lg:block">
          <LeftSidebar currentUser={enrichedUser} />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 py-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
                <Video className="w-6 h-6 text-blue-500" /> Biblioteca de Vídeos
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">Conteúdos em vídeo da empresa</p>
            </div>
            {canAdd && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gold-gradient text-white gap-2 rounded-xl shadow-md">
                    <Plus className="w-4 h-4" /> Adicionar Vídeo
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader><DialogTitle>Adicionar vídeo</DialogTitle></DialogHeader>
                  <form onSubmit={handleAdd} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Título *</Label>
                      <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título do vídeo" required className="rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>URL embed (YouTube, Vimeo...) *</Label>
                      <Input value={form.embed_url} onChange={e => setForm(f => ({ ...f, embed_url: e.target.value }))} placeholder="https://www.youtube.com/embed/..." required className="rounded-xl" />
                      <p className="text-xs text-muted-foreground">Use o link embed do YouTube: compartilhar → incorporar → copiar URL</p>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Descrição</Label>
                      <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Breve descrição" className="rounded-xl" />
                    </div>
                    <Button type="submit" disabled={saving || !form.title || !form.embed_url} className="w-full gold-gradient text-white rounded-xl">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Adicionar'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="relative max-w-sm mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar vídeos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(video => (
              <div key={video.id} className="bg-card rounded-xl border border-border/60 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="aspect-video bg-black">
                  <iframe src={video.embed_url} className="w-full h-full" allowFullScreen title={video.title} />
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm line-clamp-2">{video.title}</p>
                  {video.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{video.description}</p>}
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" /> {video.views_count || 0} visualizações
                    <span className="ml-auto">{video.uploader_name}</span>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-16 text-muted-foreground">
                <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhum vídeo encontrado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}