import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Megaphone, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ComunicadoCard from './ComunicadoCard';

const DEPARTMENTS = [
  'RH', 'TI', 'Financeiro', 'Operações', 'Comercial', 'Marketing', 'Logística', 'Produção', 'Qualidade', 'Administrativo'
];

export default function ComunicadosSection({ currentUser }) {
  const [comunicados, setComunicados] = useState([]);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'message',
    target_audience: 'all',
    target_department: '',
    target_level: '',
    image_url: '',
    pinned: true,
  });

  const isManager = ['admin', 'department_leader'].includes(currentUser?.role);

  useEffect(() => {
    base44.entities.Comunicado.filter({ status: 'active' }, '-created_date', 10).then(setComunicados);
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, image_url: file_url }));
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.content) return;
    const data = {
      ...form,
      author_id: currentUser.id,
      author_name: currentUser.full_name,
      status: 'active',
    };
    const created = await base44.entities.Comunicado.create(data);
    setComunicados(prev => [created, ...prev]);
    setOpen(false);
    setForm({ title: '', content: '', type: 'message', target_audience: 'all', target_department: '', target_level: '', image_url: '', pinned: true });
  };

  const handleArchive = async (id) => {
    await base44.entities.Comunicado.update(id, { status: 'archived' });
    setComunicados(prev => prev.filter(c => c.id !== id));
  };

  if (comunicados.length === 0 && !isManager) return null;

  return (
    <div className="space-y-3">
      {/* Header com botão para gestores */}
      {isManager && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Megaphone className="w-4 h-4" />
            <span className="text-sm font-semibold">Comunicados</span>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Novo comunicado
          </button>
        </div>
      )}

      {/* Lista de comunicados */}
      {comunicados.map(c => (
        <ComunicadoCard
          key={c.id}
          comunicado={c}
          canManage={isManager}
          onArchive={handleArchive}
        />
      ))}

      {/* Modal de criação */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-primary" />
              Novo Comunicado
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo</label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="message">Mensagem</SelectItem>
                    <SelectItem value="banner">Banner com imagem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Público alvo</label>
                <Select value={form.target_audience} onValueChange={v => setForm(f => ({ ...f, target_audience: v }))}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="department">Por Setor</SelectItem>
                    <SelectItem value="level">Por Nível</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.target_audience === 'department' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Setor</label>
                <Select value={form.target_department} onValueChange={v => setForm(f => ({ ...f, target_department: v }))}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {form.target_audience === 'level' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Nível</label>
                <Select value={form.target_level} onValueChange={v => setForm(f => ({ ...f, target_level: v }))}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operacional">Operacional</SelectItem>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                    <SelectItem value="supervisao">Supervisão</SelectItem>
                    <SelectItem value="gerencia">Gerência</SelectItem>
                    <SelectItem value="diretoria">Diretoria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Título</label>
              <Input
                placeholder="Ex: Aviso importante sobre férias coletivas"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Mensagem</label>
              <Textarea
                placeholder="Escreva o comunicado aqui..."
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                className="h-28 resize-none"
              />
            </div>

            {form.type === 'banner' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Imagem do banner</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="text-xs w-full" />
                {uploading && <p className="text-xs text-muted-foreground mt-1">Enviando imagem...</p>}
                {form.image_url && <img src={form.image_url} className="mt-2 rounded-lg max-h-32 object-cover w-full" />}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.title || !form.content}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                Publicar comunicado
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}