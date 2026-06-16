import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { FileText, Upload, Search, Download, Folder, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LeftSidebar from '@/components/sidebar/LeftSidebar';

const CATEGORIES = ['Geral', 'RH', 'Financeiro', 'Operacional', 'Treinamentos', 'Comunicados', 'Políticas', 'Procedimentos'];

export default function Repository() {
  const [documents, setDocuments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'Geral', file: null });

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      setUserProfile(profiles[0] || null);
      const docs = await base44.entities.Document.filter({ status: 'active' }, '-created_date', 50);
      setDocuments(docs);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: form.file });
    const doc = await base44.entities.Document.create({
      title: form.title,
      description: form.description,
      category: form.category,
      file_url,
      file_name: form.file.name,
      file_type: form.file.name.split('.').pop(),
      uploader_id: currentUser?.id,
      uploader_name: currentUser?.full_name,
      status: 'active',
    });
    setDocuments(prev => [doc, ...prev]);
    setForm({ title: '', description: '', category: 'Geral', file: null });
    setDialogOpen(false);
    setUploading(false);
  };

  const filtered = documents.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'all' || d.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const canUpload = userProfile?.role === 'admin' || userProfile?.role === 'department_leader';
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
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold font-heading">Repositório de Documentos</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Acesse todos os documentos da empresa</p>
            </div>
            {canUpload && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gold-gradient text-white gap-2 rounded-xl shadow-md">
                    <Upload className="w-4 h-4" /> Enviar Documento
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Enviar novo documento</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpload} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Título *</Label>
                      <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Nome do documento" required className="rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Categoria</Label>
                      <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Arquivo *</Label>
                      <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
                        {form.file ? (
                          <div className="flex items-center gap-2 justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                            <span className="text-sm font-medium">{form.file.name}</span>
                            <button type="button" onClick={() => setForm(f => ({ ...f, file: null }))}><X className="w-4 h-4 text-muted-foreground" /></button>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <input type="file" className="hidden" onChange={e => setForm(f => ({ ...f, file: e.target.files[0] }))} />
                            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Clique para selecionar o arquivo</p>
                          </label>
                        )}
                      </div>
                    </div>
                    <Button type="submit" disabled={uploading || !form.title || !form.file} className="w-full gold-gradient text-white rounded-xl">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Pesquisar documentos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="rounded-full text-xs"
              >
                Todos
              </Button>
              {CATEGORIES.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="rounded-full text-xs"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-2">
            {filtered.map(doc => {
              const ext = doc.file_type?.toUpperCase() || 'FILE';
              const extColor = { PDF: 'bg-red-100 text-red-600', DOCX: 'bg-blue-100 text-blue-600', XLSX: 'bg-green-100 text-green-600', PPTX: 'bg-orange-100 text-orange-600' }[ext] || 'bg-gray-100 text-gray-600';

              return (
                <Card key={doc.id} className="rounded-xl border-border/60 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${extColor}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{doc.category}</Badge>
                        <span className="text-xs text-muted-foreground">{doc.uploader_name}</span>
                        {ext && <Badge className={`text-[10px] px-1.5 py-0 border-0 ${extColor}`}>{ext}</Badge>}
                      </div>
                    </div>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="gap-1.5 rounded-lg text-xs shrink-0">
                        <Download className="w-3.5 h-3.5" /> Baixar
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Folder className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhum documento encontrado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}