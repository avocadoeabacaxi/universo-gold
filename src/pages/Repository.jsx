import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { FileText, Upload, Search, Download, Folder, Loader2, Lock, Pencil, Archive, Tag, MoreVertical, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import LeftSidebar from '@/components/sidebar/LeftSidebar';
import DocumentUploadModal from '@/components/repository/DocumentUploadModal';
import DocumentPasswordModal from '@/components/repository/DocumentPasswordModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const CATEGORIES = ['Geral', 'RH', 'Financeiro', 'Operacional', 'Treinamentos', 'Comunicados', 'Políticas', 'Procedimentos', 'Jurídico', 'TI', 'Marketing', 'Comercial'];

const EXT_COLOR = {
  pdf: 'bg-red-100 text-red-600',
  docx: 'bg-blue-100 text-blue-600',
  doc: 'bg-blue-100 text-blue-600',
  xlsx: 'bg-green-100 text-green-600',
  xls: 'bg-green-100 text-green-600',
  pptx: 'bg-orange-100 text-orange-600',
  ppt: 'bg-orange-100 text-orange-600',
  png: 'bg-purple-100 text-purple-600',
  jpg: 'bg-purple-100 text-purple-600',
  jpeg: 'bg-purple-100 text-purple-600',
  zip: 'bg-yellow-100 text-yellow-700',
  rar: 'bg-yellow-100 text-yellow-700',
};

export default function Repository() {
  const [documents, setDocuments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [passwordDoc, setPasswordDoc] = useState(null); // doc aguardando senha
  const [unlockedDocs, setUnlockedDocs] = useState(new Set()); // ids desbloqueados nessa sessão

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      setUserProfile(profiles[0] || null);
      const docs = await base44.entities.Document.filter({ status: 'active' }, '-created_date', 100);
      setDocuments(docs);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  const isGlobalAdmin = currentUser?.role === 'admin' || userProfile?.role === 'admin';
  const isLeader = userProfile?.role === 'department_leader';
  const canUpload = isGlobalAdmin || isLeader;

  const canEditDoc = (doc) => {
    if (isGlobalAdmin) return true;
    if (doc.uploader_id === currentUser?.id) return true;
    if (doc.edit_access === 'editors' && (isLeader || isGlobalAdmin)) return true;
    return false;
  };

  const canViewDoc = (doc) => {
    if (isGlobalAdmin) return true;
    if (doc.access_level === 'admin') return isGlobalAdmin;
    if (doc.access_level === 'department') {
      return doc.allowed_departments?.includes(userProfile?.department) || doc.uploader_id === currentUser?.id;
    }
    return true;
  };

  const handleDocClick = (doc) => {
    if (doc.password && !unlockedDocs.has(doc.id) && !isGlobalAdmin) {
      setPasswordDoc(doc);
    } else {
      openDoc(doc);
    }
  };

  const openDoc = (doc) => {
    window.open(doc.file_url, '_blank');
    // Incrementa downloads
    base44.entities.Document.update(doc.id, { downloads_count: (doc.downloads_count || 0) + 1 });
  };

  const handleUnlock = (doc) => {
    setUnlockedDocs(prev => new Set([...prev, doc.id]));
    openDoc(doc);
  };

  const handleArchive = async (doc) => {
    if (!confirm('Arquivar este documento?')) return;
    await base44.entities.Document.update(doc.id, { status: 'archived' });
    setDocuments(prev => prev.filter(d => d.id !== doc.id));
  };

  const handleSaved = (saved, isEdit) => {
    if (isEdit) {
      setDocuments(prev => prev.map(d => d.id === saved.id ? saved : d));
    } else {
      setDocuments(prev => [saved, ...prev]);
    }
  };

  const enrichedUser = currentUser ? { ...currentUser, avatar_url: userProfile?.avatar_url, job_title: userProfile?.job_title, department: userProfile?.department } : null;

  const filtered = documents
    .filter(canViewDoc)
    .filter(d => {
      const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.description?.toLowerCase().includes(search.toLowerCase()) ||
        d.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchCat = selectedCategory === 'all' || d.category === selectedCategory;
      return matchSearch && matchCat;
    });

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-4">
      <div className="flex gap-4">
        <div className="hidden lg:block">
          <LeftSidebar currentUser={enrichedUser} />
        </div>

        <div className="flex-1 min-w-0 py-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold font-heading">Repositório de Documentos</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Acesse todos os documentos da empresa</p>
            </div>
            {canUpload && (
              <button
                onClick={() => { setEditDoc(null); setUploadOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition shadow-md"
              >
                <Upload className="w-4 h-4" /> Enviar Documento
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="bg-card border border-border/60 rounded-2xl p-4 mb-6 space-y-3 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por título, descrição ou tag..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 rounded-xl bg-muted/40 border-border/60 focus:bg-white"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`shrink-0 text-xs px-4 py-1.5 rounded-full font-semibold border transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'border-border/70 text-muted-foreground bg-background hover:border-primary/50 hover:text-primary'
                }`}
              >
                Todos
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 text-xs px-4 py-1.5 rounded-full font-semibold border transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'border-border/70 text-muted-foreground bg-background hover:border-primary/50 hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <p className="text-xs text-muted-foreground mb-3">{filtered.length} documento{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>

          {/* Documents List */}
          <div className="space-y-2">
            {filtered.map(doc => {
              const ext = doc.file_type?.toLowerCase();
              const extColor = EXT_COLOR[ext] || 'bg-gray-100 text-gray-600';
              const hasPassword = !!doc.password;
              const isLocked = hasPassword && !unlockedDocs.has(doc.id) && !isGlobalAdmin;

              return (
                <Card key={doc.id} className="rounded-xl border-border/60 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative ${extColor}`}>
                      <FileText className="w-5 h-5" />
                      {hasPassword && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                          <Lock className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm truncate">{doc.title}</p>
                        {doc.version > 1 && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">v{doc.version}</span>
                        )}
                        {isLocked && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" /> Protegido</span>}
                      </div>
                      {doc.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{doc.description}</p>}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{doc.category}</Badge>
                        {ext && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${extColor}`}>{ext.toUpperCase()}</span>}
                        <span className="text-xs text-muted-foreground">{doc.uploader_name}</span>
                        {doc.access_level === 'admin' && <span className="text-[10px] text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-full font-semibold">Restrito</span>}
                        {doc.access_level === 'department' && <span className="text-[10px] text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-full font-semibold">Departamento</span>}
                        {doc.downloads_count > 0 && <span className="text-[10px] text-muted-foreground">{doc.downloads_count} download{doc.downloads_count !== 1 ? 's' : ''}</span>}
                      </div>
                      {doc.tags?.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          <Tag className="w-3 h-3 text-muted-foreground" />
                          {doc.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDocClick(doc)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-primary/30 text-primary rounded-xl hover:bg-primary/10 transition"
                      >
                        {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                        {isLocked ? 'Acessar' : 'Baixar'}
                      </button>

                      {canEditDoc(doc) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditDoc(doc); setUploadOpen(true); }}>
                              <Pencil className="w-4 h-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleArchive(doc)} className="text-destructive">
                              <Archive className="w-4 h-4 mr-2" /> Arquivar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Folder className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhum documento encontrado</p>
                <p className="text-sm mt-1">Tente mudar os filtros ou envie um novo documento.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DocumentUploadModal
        open={uploadOpen}
        onClose={() => { setUploadOpen(false); setEditDoc(null); }}
        onSaved={handleSaved}
        editDoc={editDoc}
        currentUser={currentUser}
        userProfile={userProfile}
      />

      <DocumentPasswordModal
        open={!!passwordDoc}
        onClose={() => setPasswordDoc(null)}
        doc={passwordDoc}
        onUnlock={handleUnlock}
      />
    </div>
  );
}