import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Trash2, Pencil, Users, FileText, Image, X, UserPlus, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminComunidadesTab() {
  const [communities, setCommunities] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [modalTab, setModalTab] = useState('members');
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [addMemberSearch, setAddMemberSearch] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const [c, p, po] = await Promise.all([
      base44.entities.Community.list('name', 100),
      base44.entities.UserProfile.list('full_name', 200),
      base44.entities.Post.filter({ status: 'active' }, '-created_date', 200),
    ]);
    setCommunities(c.filter(x => x.status === 'active'));
    setProfiles(p);
    setPosts(po);
  };

  const openDetail = (community) => {
    setSelectedCommunity(community);
    setModalTab('members');
    setDetailOpen(true);
  };

  const openEdit = (community) => {
    setEditForm({
      name: community.name || '',
      description: community.description || '',
      type: community.type || 'free_group',
      visibility: community.visibility || 'open',
      department: community.department || '',
    });
    setSelectedCommunity(community);
    setEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    await base44.entities.Community.update(selectedCommunity.id, editForm);
    setCommunities(prev => prev.map(c => c.id === selectedCommunity.id ? { ...c, ...editForm } : c));
    setEditOpen(false);
    toast.success('Comunidade atualizada!');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Community.update(selectedCommunity.id, { avatar_url: file_url });
    setCommunities(prev => prev.map(c => c.id === selectedCommunity.id ? { ...c, avatar_url: file_url } : c));
    setSelectedCommunity(prev => ({ ...prev, avatar_url: file_url }));
    setUploading(false);
    toast.success('Imagem atualizada!');
  };

  const removeMember = async (memberId) => {
    const newMembers = (selectedCommunity.members || []).filter(m => m !== memberId);
    await base44.entities.Community.update(selectedCommunity.id, { members: newMembers, members_count: newMembers.length });
    const updated = { ...selectedCommunity, members: newMembers, members_count: newMembers.length };
    setSelectedCommunity(updated);
    setCommunities(prev => prev.map(c => c.id === selectedCommunity.id ? updated : c));
    toast.success('Membro removido!');
  };

  const addMember = async (profileUserId) => {
    const current = selectedCommunity.members || [];
    if (current.includes(profileUserId)) { toast.error('Já é membro!'); return; }
    const newMembers = [...current, profileUserId];
    await base44.entities.Community.update(selectedCommunity.id, { members: newMembers, members_count: newMembers.length });
    const updated = { ...selectedCommunity, members: newMembers, members_count: newMembers.length };
    setSelectedCommunity(updated);
    setCommunities(prev => prev.map(c => c.id === selectedCommunity.id ? updated : c));
    toast.success('Membro adicionado!');
  };

  const deletePost = async (postId) => {
    await base44.entities.Post.update(postId, { status: 'deleted' });
    setPosts(prev => prev.filter(p => p.id !== postId));
    toast.success('Post excluído!');
  };

  const deleteCommunity = async (id) => {
    if (!confirm('Excluir esta comunidade?')) return;
    await base44.entities.Community.update(id, { status: 'inactive' });
    setCommunities(prev => prev.filter(c => c.id !== id));
    setDetailOpen(false);
    toast.success('Comunidade excluída!');
  };

  const communityMembers = selectedCommunity
    ? profiles.filter(p => (selectedCommunity.members || []).includes(p.user_id))
    : [];

  const communityPosts = selectedCommunity
    ? posts.filter(p => p.community_id === selectedCommunity.id)
    : [];

  const filteredProfiles = profiles.filter(p =>
    p.full_name?.toLowerCase().includes(addMemberSearch.toLowerCase()) &&
    !(selectedCommunity?.members || []).includes(p.user_id)
  );

  return (
    <div className="space-y-3">
      {communities.map(community => (
        <Card key={community.id} className="rounded-xl border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center shrink-0 overflow-hidden">
              {community.avatar_url
                ? <img src={community.avatar_url} className="w-full h-full object-cover" />
                : <span className="text-white text-xs font-bold">{community.name?.slice(0, 2).toUpperCase()}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{community.name}</p>
              <p className="text-xs text-muted-foreground">{community.members_count || 0} membros · {community.type === 'department' ? 'Departamento' : 'Grupo livre'}</p>
            </div>
            <Badge variant={community.visibility === 'open' ? 'secondary' : 'outline'} className="text-xs">
              {community.visibility === 'open' ? 'Aberta' : 'Fechada'}
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => openEdit(community)} className="w-8 h-8 text-primary hover:bg-primary/10 shrink-0">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => openDetail(community)} className="text-xs text-primary hover:bg-primary/10 shrink-0 gap-1">
              <Users className="w-3.5 h-3.5" /> Gerenciar
            </Button>
            <Button variant="ghost" size="icon" onClick={() => deleteCommunity(community.id)} className="w-8 h-8 text-red-500 hover:bg-red-50 shrink-0">
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* Modal Detalhe / Gerenciar */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="rounded-2xl max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedCommunity?.avatar_url
                ? <img src={selectedCommunity.avatar_url} className="w-8 h-8 rounded-lg object-cover" />
                : <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-white text-xs font-bold">{selectedCommunity?.name?.slice(0, 2).toUpperCase()}</div>
              }
              {selectedCommunity?.name}
            </DialogTitle>
          </DialogHeader>

          {/* Imagem da comunidade */}
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="w-16 h-16 rounded-xl overflow-hidden gold-gradient flex items-center justify-center">
              {selectedCommunity?.avatar_url
                ? <img src={selectedCommunity.avatar_url} className="w-full h-full object-cover" />
                : <span className="text-white font-bold">{selectedCommunity?.name?.slice(0, 2).toUpperCase()}</span>
              }
            </div>
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <Button type="button" variant="outline" size="sm" className="rounded-xl gap-2" disabled={uploading} asChild>
                <span><Image className="w-4 h-4" /> {uploading ? 'Enviando...' : 'Trocar imagem'}</span>
              </Button>
            </label>
          </div>

          <Tabs value={modalTab} onValueChange={setModalTab}>
            <TabsList className="w-full">
              <TabsTrigger value="members" className="flex-1"><Users className="w-3.5 h-3.5 mr-1" /> Membros ({communityMembers.length})</TabsTrigger>
              <TabsTrigger value="add" className="flex-1"><UserPlus className="w-3.5 h-3.5 mr-1" /> Adicionar</TabsTrigger>
              <TabsTrigger value="posts" className="flex-1"><FileText className="w-3.5 h-3.5 mr-1" /> Posts ({communityPosts.length})</TabsTrigger>
            </TabsList>

            {/* Membros */}
            <TabsContent value="members" className="space-y-2 mt-3">
              {communityMembers.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum membro cadastrado.</p>}
              {communityMembers.map(member => (
                <div key={member.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback className="text-xs bg-primary/20 text-primary">{member.full_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.department} · {member.job_title}</p>
                  </div>
                  <button onClick={() => removeMember(member.user_id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </TabsContent>

            {/* Adicionar membro */}
            <TabsContent value="add" className="mt-3 space-y-3">
              <Input placeholder="Buscar colaborador..." value={addMemberSearch} onChange={e => setAddMemberSearch(e.target.value)} className="rounded-xl" />
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredProfiles.slice(0, 20).map(profile => (
                  <div key={profile.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">{profile.full_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{profile.full_name}</p>
                      <p className="text-xs text-muted-foreground">{profile.department}</p>
                    </div>
                    <button onClick={() => addMember(profile.user_id)} className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90">
                      Adicionar
                    </button>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Posts */}
            <TabsContent value="posts" className="mt-3 space-y-2">
              {communityPosts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum post nesta comunidade.</p>}
              {communityPosts.map(post => (
                <div key={post.id} className="flex items-start gap-2 p-3 rounded-lg bg-muted/40">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium">{post.author_name}</p>
                    <p className="text-sm line-clamp-2">{post.content}</p>
                  </div>
                  <button onClick={() => deletePost(post.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Modal Editar */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader><DialogTitle>Editar Comunidade</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-3">
            <div className="space-y-1"><Label>Nome</Label><Input value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="rounded-xl" /></div>
            <div className="space-y-1"><Label>Descrição</Label><textarea value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" /></div>
            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select value={editForm.type} onValueChange={v => setEditForm(f => ({ ...f, type: v }))}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free_group">Grupo livre</SelectItem>
                  <SelectItem value="department">Departamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Visibilidade</Label>
              <Select value={editForm.visibility} onValueChange={v => setEditForm(f => ({ ...f, visibility: v }))}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Aberta</SelectItem>
                  <SelectItem value="closed">Fechada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editForm.type === 'department' && (
              <div className="space-y-1"><Label>Departamento</Label><Input value={editForm.department || ''} onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))} className="rounded-xl" /></div>
            )}
            <Button type="submit" className="w-full gold-gradient text-white rounded-xl">Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}