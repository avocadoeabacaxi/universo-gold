import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Upload, X, Loader2, Lock } from 'lucide-react';

const CATEGORIES = ['Geral', 'RH', 'Financeiro', 'Operacional', 'Treinamentos', 'Comunicados', 'Políticas', 'Procedimentos', 'Jurídico', 'TI', 'Marketing', 'Comercial'];

const ACCESS_LABELS = {
  all: 'Todos os colaboradores',
  department: 'Departamento específico',
  admin: 'Somente administradores',
};

const EDIT_LABELS = {
  only_me: 'Somente eu',
  editors: 'Admins e Editores',
  admin: 'Somente administradores',
};

export default function DocumentUploadModal({ open, onClose, onSaved, editDoc = null, currentUser, userProfile, communityId = null, communityName = null }) {
  const isEdit = !!editDoc;
  const [form, setForm] = useState({
    title: editDoc?.title || '',
    description: editDoc?.description || '',
    category: editDoc?.category || 'Geral',
    access_level: editDoc?.access_level || 'all',
    edit_access: editDoc?.edit_access || 'only_me',
    password: editDoc?.password || '',
    tags: editDoc?.tags?.join(', ') || '',
    file: null,
  });
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const tagsArray = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      access_level: form.access_level,
      edit_access: form.edit_access,
      password: form.password.trim() || null,
      tags: tagsArray,
    };

    if (form.file) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: form.file });
      payload.file_url = file_url;
      payload.file_name = form.file.name;
      payload.file_type = form.file.name.split('.').pop()?.toLowerCase();
      if (isEdit) payload.version = (editDoc.version || 1) + 1;
    }

    let saved;
    if (isEdit) {
      saved = await base44.entities.Document.update(editDoc.id, payload);
    } else {
      payload.uploader_id = currentUser?.id;
      payload.uploader_name = currentUser?.full_name;
      payload.status = 'active';
      if (communityId) {
        payload.community_id = communityId;
        payload.community_name = communityName;
      }
      saved = await base44.entities.Document.create(payload);
    }

    onSaved(saved, isEdit);
    onClose();
    setUploading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar documento' : 'Enviar novo documento'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Título */}
          <div className="space-y-1.5">
            <Label>Título *</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Nome do documento" required className="rounded-xl" />
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} placeholder="Breve descrição do conteúdo..."
              className="w-full border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>

          {/* Categoria */}
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label>Tags <span className="text-muted-foreground text-xs">(separadas por vírgula)</span></Label>
            <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="ex: contrato, modelo, rh" className="rounded-xl" />
          </div>

          {/* Arquivo */}
          <div className="space-y-1.5">
            <Label>{isEdit ? 'Substituir arquivo (opcional)' : 'Arquivo *'}</Label>
            <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition">
              {form.file ? (
                <div className="flex items-center gap-2 justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium truncate max-w-[200px]">{form.file.name}</span>
                  <button type="button" onClick={() => setForm(f => ({ ...f, file: null }))}
                    className="ml-1 text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <input ref={fileRef} type="file" className="hidden" onChange={e => setForm(f => ({ ...f, file: e.target.files[0] }))} />
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Clique para selecionar qualquer arquivo</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX, PPTX, imagens, ZIP e mais</p>
                </label>
              )}
            </div>
            {isEdit && editDoc?.file_name && !form.file && (
              <p className="text-xs text-muted-foreground">Arquivo atual: <span className="font-medium">{editDoc.file_name}</span></p>
            )}
          </div>

          {/* Permissões de visualização */}
          <div className="rounded-xl border border-border/60 p-4 space-y-3 bg-muted/30">
            <p className="text-sm font-semibold flex items-center gap-1.5"><Lock className="w-4 h-4 text-primary" /> Permissões de acesso</p>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Quem pode visualizar</Label>
              <Select value={form.access_level} onValueChange={v => setForm(f => ({ ...f, access_level: v }))}>
                <SelectTrigger className="rounded-xl bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ACCESS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Quem pode editar</Label>
              <Select value={form.edit_access} onValueChange={v => setForm(f => ({ ...f, edit_access: v }))}>
                <SelectTrigger className="rounded-xl bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(EDIT_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Senha de acesso <span className="text-muted-foreground/60">(opcional)</span></Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Deixe em branco para sem senha"
                  className="rounded-xl pr-16 bg-background"
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary font-medium hover:underline">
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              {form.password && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Este documento exigirá senha para acesso
                </p>
              )}
            </div>
          </div>

          <button type="submit" disabled={uploading || !form.title || (!isEdit && !form.file)}
            className="w-full py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition flex items-center justify-center gap-2">
            {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Salvar alterações' : 'Enviar documento'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}