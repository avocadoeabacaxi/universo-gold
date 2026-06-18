import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Image, Upload, Trash2, Plus, ExternalLink, Search } from 'lucide-react';
import { toast } from 'sonner';

const DEPARTAMENTOS = [
  'Produção', 'Qualidade', 'Logística', 'RH', 'Financeiro',
  'Comercial', 'TI', 'Administrativo', 'Marketing', 'Operações',
];

const ACCESS_LABELS = { all: 'Todos', department: 'Departamento', admin: 'Apenas Admin' };

export default function AdminDocumentosTab() {
  const [documents, setDocuments] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [uploadType, setUploadType] = useState('file'); // 'file' | 'text'
  const [form, setForm] = useState({
    title: '', description: '', category: '', access_level: 'all',
    department: '', who_can_see: 'all',
    text_content: '', file: null,
  });
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState('');
  const [accessFilter, setAccessFilter] = useState('all');

  useEffect(() => {
    loadDocs();
    base44.auth.me().then(setCurrentUser);
  }, []);

  const loadDocs = async () => {
    const docs = await base44.entities.Document.list('-created_date', 100);
    setDocuments(docs.filter(d => d.status === 'active'));
  };

  const resetForm = () => {
    setForm({ title: '', description: '', category: '', access_level: 'all', department: '', who_can_see: 'all', text_content: '', file: null });
    setUploadType('file');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title) { toast.error('Título obrigatório'); return; }
    setUploading(true);
    let file_url = '';
    let file_name = '';
    let file_type = '';

    if (uploadType === 'file') {
      if (!form.file) { toast.error('Selecione um arquivo'); setUploading(false); return; }
      const res = await base44.integrations.Core.UploadFile({ file: form.file });
      file_url = res.file_url;
      file_name = form.file.name;
      file_type = form.file.name.split('.').pop().toLowerCase();
    } else {
      // Texto como blob de texto
      const blob = new Blob([form.text_content], { type: 'text/plain' });
      const textFile = new File([blob], `${form.title}.txt`, { type: 'text/plain' });
      const res = await base44.integrations.Core.UploadFile({ file: textFile });
      file_url = res.file_url;
      file_name = `${form.title}.txt`;
      file_type = 'txt';
    }

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      file_url,
      file_name,
      file_type,
      access_level: form.access_level,
      uploader_id: currentUser?.id || '',
      uploader_name: currentUser?.full_name || 'Admin',
    };

    // Adiciona departamento se necessário
    if (form.access_level === 'department') {
      payload.community_name = form.department; // reusar campo para departamento
    }

    const created = await base44.entities.Document.create(payload);
    setDocuments(prev => [created, ...prev]);
    setCreateOpen(false);
    resetForm();
    setUploading(false);
    toast.success('Documento criado!');
  };

  const deleteDocument = async (id) => {
    if (!confirm('Arquivar este documento?')) return;
    await base44.entities.Document.update(id, { status: 'archived' });
    setDocuments(prev => prev.filter(d => d.id !== id));
    toast.success('Documento arquivado.');
  };

  const fileIcon = (type) => {
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(type)) return <Image className="w-5 h-5 text-green-500" />;
    return <FileText className="w-5 h-5 text-red-500" />;
  };

  const bgColor = (type) => {
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(type)) return 'bg-green-50';
    return 'bg-red-50';
  };

  const term = search.trim().toLowerCase();
  const filteredDocs = documents.filter(d =>
    (!term || d.title?.toLowerCase().includes(term) || d.category?.toLowerCase().includes(term)) &&
    (accessFilter === 'all' || d.access_level === accessFilter)
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={v => { setCreateOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-white rounded-xl gap-2">
              <Plus className="w-4 h-4" /> Novo Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Adicionar Documento</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Tipo de conteúdo */}
              <div className="space-y-1">
                <Label>Tipo de conteúdo</Label>
                <Tabs value={uploadType} onValueChange={setUploadType}>
                  <TabsList className="w-full">
                    <TabsTrigger value="file" className="flex-1"><Upload className="w-3.5 h-3.5 mr-1" /> Arquivo (PDF/Imagem)</TabsTrigger>
                    <TabsTrigger value="text" className="flex-1"><FileText className="w-3.5 h-3.5 mr-1" /> Texto</TabsTrigger>
                  </TabsList>
                  <TabsContent value="file" className="mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl border-border cursor-pointer hover:bg-muted/50 transition-colors">
                      <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                      <span className="text-sm text-muted-foreground">{form.file ? form.file.name : 'Clique para selecionar (PDF, PNG, JPG, DOC...)'}</span>
                      <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={e => setForm(f => ({ ...f, file: e.target.files[0] }))} />
                    </label>
                  </TabsContent>
                  <TabsContent value="text" className="mt-2">
                    <textarea
                      placeholder="Escreva o conteúdo do documento aqui..."
                      value={form.text_content}
                      onChange={e => setForm(f => ({ ...f, text_content: e.target.value }))}
                      rows={5}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none"
                    />
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-1"><Label>Título *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="rounded-xl" placeholder="Nome do documento" required /></div>
              <div className="space-y-1"><Label>Descrição</Label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="Descrição opcional..." /></div>
              <div className="space-y-1"><Label>Categoria</Label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="rounded-xl" placeholder="Ex: Procedimentos, Normas, Manual..." /></div>

              {/* Direcionamento */}
              <div className="space-y-1">
                <Label>Direcionamento</Label>
                <Select value={form.access_level} onValueChange={v => setForm(f => ({ ...f, access_level: v, department: '' }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Geral (todos os colaboradores)</SelectItem>
                    <SelectItem value="department">Departamento específico</SelectItem>
                    <SelectItem value="admin">Apenas Administradores</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.access_level === 'department' && (
                <>
                  <div className="space-y-1">
                    <Label>Departamento</Label>
                    <Select value={form.department} onValueChange={v => setForm(f => ({ ...f, department: v }))}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione o departamento" /></SelectTrigger>
                      <SelectContent>
                        {DEPARTAMENTOS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Quem pode ver dentro do departamento</Label>
                    <Select value={form.who_can_see} onValueChange={v => setForm(f => ({ ...f, who_can_see: v }))}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos do departamento</SelectItem>
                        <SelectItem value="leaders">Apenas líderes</SelectItem>
                        <SelectItem value="admins_only">Apenas admins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Button type="submit" disabled={uploading} className="w-full gold-gradient text-white rounded-xl">
                {uploading ? 'Enviando...' : 'Criar Documento'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Busca e filtro */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar documento ou categoria..." className="pl-9 rounded-xl" />
        </div>
        <Select value={accessFilter} onValueChange={setAccessFilter}>
          <SelectTrigger className="w-full sm:w-52 rounded-xl"><SelectValue placeholder="Direcionamento" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os direcionamentos</SelectItem>
            <SelectItem value="department">Departamento</SelectItem>
            <SelectItem value="admin">Apenas Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de documentos */}
      <div className="space-y-2">
        {filteredDocs.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nenhum documento encontrado.</p>}
        {filteredDocs.map(doc => (
          <Card key={doc.id} className="rounded-xl border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgColor(doc.file_type)}`}>
                {fileIcon(doc.file_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{doc.title}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">{doc.category || 'Sem categoria'} · {doc.uploader_name}</span>
                  <Badge variant="outline" className="text-[10px]">{ACCESS_LABELS[doc.access_level] || 'Geral'}</Badge>
                  {doc.community_name && <Badge variant="secondary" className="text-[10px]">{doc.community_name}</Badge>}
                </div>
              </div>
              {doc.file_url && (
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="text-xs rounded-lg gap-1">
                    <ExternalLink className="w-3 h-3" /> Ver
                  </Button>
                </a>
              )}
              <button onClick={() => deleteDocument(doc.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}