import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Plus, Archive, Loader2, Pin, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminComunicadosTab() {
  const [comunicados, setComunicados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'message',
    target_audience: 'all',
    target_department: '',
    image_url: '',
    pinned: true,
  });

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setCurrentUser(u);
      const [data, setores] = await Promise.all([
        base44.entities.Comunicado.list('-created_date', 50),
        base44.entities.Setor.filter({ status: 'active' }),
      ]);
      setComunicados(data);
      // Extrair departamentos únicos dos setores
      const deps = [...new Set(setores.map(s => s.name).filter(Boolean))];
      setDepartments(deps);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, image_url: file_url }));
    setUploadingImage(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    const novo = await base44.entities.Comunicado.create({
      ...form,
      author_id: currentUser.id,
      author_name: currentUser.full_name,
      status: 'active',
    });
    setComunicados(prev => [novo, ...prev]);
    setForm({ title: '', content: '', type: 'message', target_audience: 'all', target_department: '', image_url: '', pinned: true });
    setDialogOpen(false);
    setSaving(false);
    toast.success('Comunicado publicado!');
  };

  const handleArchive = async (id) => {
    await base44.entities.Comunicado.update(id, { status: 'archived' });
    setComunicados(prev => prev.map(c => c.id === id ? { ...c, status: 'archived' } : c));
    toast.success('Comunicado arquivado.');
  };

  const typeLabel = { banner: 'Banner', message: 'Mensagem' };
  const audienceLabel = { all: 'Todos', department: 'Departamento', level: 'Nível' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base">Comunicados</h2>
          <p className="text-xs text-muted-foreground">Publique avisos e banners para todos os colaboradores</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-white gap-2 rounded-xl shadow-md">
              <Plus className="w-4 h-4" /> Novo Comunicado
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-lg">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Megaphone className="w-4 h-4 text-orange-500" /> Novo Comunicado</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <Label>Título *</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Aviso importante" required className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label>Mensagem *</Label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  rows={4}
                  required
                  placeholder="Digite a mensagem do comunicado..."
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Tipo</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="message">Mensagem</SelectItem>
                      <SelectItem value="banner">Banner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Público alvo</Label>
                  <Select value={form.target_audience} onValueChange={v => setForm(f => ({ ...f, target_audience: v, target_department: '' }))}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="department">Departamento</SelectItem>
                      <SelectItem value="level">Nível</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Departamento (visível só quando target = department) */}
              {form.target_audience === 'department' && (
                <div className="space-y-1">
                  <Label>Departamento / Setor *</Label>
                  <Select value={form.target_department} onValueChange={v => setForm(f => ({ ...f, target_department: v }))}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione um setor" /></SelectTrigger>
                    <SelectContent>
                      {departments.length === 0 && (
                        <SelectItem value="_none" disabled>Nenhum setor cadastrado</SelectItem>
                      )}
                      {departments.map(dep => (
                        <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Upload de imagem (visível para banners ou opcional) */}
              {form.type === 'banner' && (
                <div className="space-y-1">
                  <Label>Imagem do banner</Label>
                  {form.image_url ? (
                    <div className="relative rounded-xl overflow-hidden border border-border">
                      <img src={form.image_url} alt="Banner" className="w-full h-32 object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-border cursor-pointer hover:bg-muted/40 transition-colors">
                      {uploadingImage ? (
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <ImagePlus className="w-5 h-5 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">Clique para fazer upload</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinned"
                  checked={form.pinned}
                  onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="pinned" className="cursor-pointer">Fixar no topo do Feed</Label>
              </div>
              <Button type="submit" disabled={saving} className="w-full gold-gradient text-white rounded-xl">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publicar comunicado'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : comunicados.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhum comunicado publicado ainda.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {comunicados.map(c => (
            <Card key={c.id} className={`rounded-xl border-border/60 ${c.status === 'archived' ? 'opacity-50' : ''}`}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                  <Megaphone className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{c.title}</p>
                    {c.pinned && <Pin className="w-3 h-3 text-primary" />}
                    <Badge variant="outline" className="text-[10px]">{typeLabel[c.type] || c.type}</Badge>
                    <Badge variant="outline" className="text-[10px]">{audienceLabel[c.target_audience] || 'Todos'}</Badge>
                    {c.status === 'archived' && <Badge variant="outline" className="text-[10px] text-muted-foreground">Arquivado</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Por {c.author_name}</p>
                </div>
                {c.status === 'active' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleArchive(c.id)}
                    className="w-8 h-8 text-muted-foreground hover:text-orange-500 hover:bg-orange-50 shrink-0"
                    title="Arquivar"
                  >
                    <Archive className="w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}