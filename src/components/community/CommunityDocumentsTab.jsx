import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { FileText, Download, Pencil, Archive, Tag, Lock, MoreVertical, Folder } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import DocumentUploadModal from '@/components/repository/DocumentUploadModal';
import DocumentPasswordModal from '@/components/repository/DocumentPasswordModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
};

export default function CommunityDocumentsTab({ communityId, communityName, canEdit, currentUser, userProfile, isGlobalAdmin }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [passwordDoc, setPasswordDoc] = useState(null);
  const [unlockedDocs, setUnlockedDocs] = useState(new Set());

  useEffect(() => {
    base44.entities.Document.filter({ community_id: communityId, status: 'active' }, '-created_date', 50)
      .then(setDocuments)
      .finally(() => setLoading(false));
  }, [communityId]);

  const canEditDoc = (doc) => {
    if (isGlobalAdmin) return true;
    if (doc.uploader_id === currentUser?.id) return true;
    if (doc.edit_access === 'editors' && canEdit) return true;
    return false;
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
    base44.entities.Document.update(doc.id, { downloads_count: (doc.downloads_count || 0) + 1 });
  };

  const handleUnlock = (doc) => {
    setUnlockedDocs(prev => new Set([...prev, doc.id]));
    openDoc(doc);
  };

  const handleSaved = (saved, isEdit) => {
    if (isEdit) {
      setDocuments(prev => prev.map(d => d.id === saved.id ? saved : d));
    } else {
      setDocuments(prev => [saved, ...prev]);
    }
  };

  const handleArchive = async (doc) => {
    if (!confirm('Arquivar este documento?')) return;
    await base44.entities.Document.update(doc.id, { status: 'archived' });
    setDocuments(prev => prev.filter(d => d.id !== doc.id));
  };

  if (loading) return <div className="text-sm text-muted-foreground text-center py-8">Carregando...</div>;

  return (
    <div className="space-y-3">
      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={() => { setEditDoc(null); setUploadOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition"
          >
            <FileText className="w-4 h-4" /> Enviar Documento
          </button>
        </div>
      )}

      <div className="space-y-2">
        {documents.map(doc => {
          const ext = doc.file_type?.toLowerCase();
          const extColor = EXT_COLOR[ext] || 'bg-gray-100 text-gray-600';
          const hasPassword = !!doc.password;
          const isLocked = hasPassword && !unlockedDocs.has(doc.id) && !isGlobalAdmin;

          return (
            <div key={doc.id} className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border/60 hover:shadow-md transition-shadow">
              {/* Icon */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 relative ${extColor}`}>
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
                  {isLocked && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" /> Protegido
                    </span>
                  )}
                </div>
                {doc.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{doc.description}</p>}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {doc.category && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{doc.category}</Badge>}
                  {ext && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${extColor}`}>{ext.toUpperCase()}</span>}
                  <span className="text-xs text-muted-foreground">{doc.uploader_name}</span>
                  {doc.access_level === 'admin' && <span className="text-[10px] text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-full font-semibold">Restrito</span>}
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
            </div>
          );
        })}

        {documents.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <Folder className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Nenhum documento nesta comunidade.</p>
            {canEdit && <p className="text-xs mt-1">Clique em "Enviar Documento" para começar.</p>}
          </div>
        )}
      </div>

      <DocumentUploadModal
        open={uploadOpen}
        onClose={() => { setUploadOpen(false); setEditDoc(null); }}
        onSaved={handleSaved}
        editDoc={editDoc}
        currentUser={currentUser}
        userProfile={userProfile}
        communityId={communityId}
        communityName={communityName}
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