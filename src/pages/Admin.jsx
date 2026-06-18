import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Users, FileText, Globe, Shield, Trash2, Loader2, UserPlus, Building2, MapPin, Briefcase, UserCircle, Lock, Pencil, Plug, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import SetoresTab from '@/components/admin/SetoresTab';
import UnidadesTab from '@/components/admin/UnidadesTab';
import FuncoesTab from '@/components/admin/FuncoesTab';
import FichaColaboradorTab from '@/components/admin/FichaColaboradorTab';
import AdminComunidadesTab from '@/components/admin/AdminComunidadesTab';
import AdminDocumentosTab from '@/components/admin/AdminDocumentosTab';
import AdminComunicadosTab from '@/components/admin/AdminComunicadosTab';
import AdminIntegracoesTab from '@/components/admin/AdminIntegracoesTab';

// Tab aliases: map URL params to internal tab values
const TAB_ALIAS = {
  comunicados: 'comunicados',
  users: 'users',
  permissions: 'permissions',
  setores: 'setores',
  funcoes: 'funcoes',
  unidades: 'unidades',
  fichas: 'fichas',
  comunidades: 'communities',
};

export default function Admin() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [setores, setSetores] = useState([]);
  const [funcoes, setFuncoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [editProfileForm, setEditProfileForm] = useState({});
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userSetorFilter, setUserSetorFilter] = useState('all');
  const [permSearch, setPermSearch] = useState('');
  const [permRoleFilter, setPermRoleFilter] = useState('all');

  const urlTab = new URLSearchParams(location.search).get('tab');
  const defaultTab = TAB_ALIAS[urlTab] || 'users';

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
      if (user.role !== 'admin') { setLoading(false); return; }
      const [p, c, d, s, f] = await Promise.all([
        base44.entities.UserProfile.list('-created_date', 50),
        base44.entities.Community.list('name', 50),
        base44.entities.Document.list('-created_date', 50),
        base44.entities.Setor.filter({ status: 'active' }, 'name', 200),
        base44.entities.Funcao.filter({ status: 'active' }, 'name', 200),
      ]);
      setProfiles(p);
      setCommunities(c);
      setDocuments(d);
      setSetores(s);
      setFuncoes(f);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    await base44.users.inviteUser(inviteEmail, inviteRole);
    toast.success(`Convite enviado para ${inviteEmail}`);
    setInviteEmail('');
    setDialogOpen(false);
    setInviting(false);
  };

  const updateProfileRole = async (profileId, role) => {
    await base44.entities.UserProfile.update(profileId, { role });
    setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, role } : p));
    toast.success('Perfil atualizado!');
  };

  const deactivateProfile = async (profileId) => {
    await base44.entities.UserProfile.update(profileId, { status: 'inactive' });
    setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, status: 'inactive' } : p));
    toast.success('Usuário desativado.');
  };

  const deleteCommunity = async (id) => {
    await base44.entities.Community.update(id, { status: 'inactive' });
    setCommunities(prev => prev.filter(c => c.id !== id));
    toast.success('Comunidade arquivada.');
  };

  const openEditProfile = (profile) => {
    setEditingProfile(profile);
    setEditProfileForm({ full_name: profile.full_name || '', department: profile.department || '', job_title: profile.job_title || '', gestor: profile.gestor || '', phone: profile.phone || '', bio: profile.bio || '' });
    setEditProfileOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await base44.entities.UserProfile.update(editingProfile.id, editProfileForm);
    setProfiles(prev => prev.map(p => p.id === editingProfile.id ? { ...p, ...editProfileForm } : p));
    setEditProfileOpen(false);
    toast.success('Perfil atualizado!');
  };

  const deleteDocument = async (id) => {
    await base44.entities.Document.update(id, { status: 'archived' });
    setDocuments(prev => prev.filter(d => d.id !== id));
    toast.success('Documento arquivado.');
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (currentUser?.role !== 'admin') return (
    <div className="text-center py-16 text-muted-foreground">
      <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p className="font-medium">Acesso restrito a administradores</p>
    </div>
  );

  const stats = [
    { icon: Users, label: 'Usuários', value: profiles.length, color: 'text-blue-500 bg-blue-50' },
    { icon: Globe, label: 'Comunidades', value: communities.filter(c => c.status === 'active').length, color: 'text-purple-500 bg-purple-50' },
    { icon: FileText, label: 'Documentos', value: documents.filter(d => d.status === 'active').length, color: 'text-red-500 bg-red-50' },
  ];

  const roleLabels = { admin: 'Admin', department_leader: 'Líder', moderator: 'Moderador', user: 'Colaborador' };
  const roleBadgeColor = { admin: 'bg-red-100 text-red-700', department_leader: 'bg-orange-100 text-orange-700', moderator: 'bg-blue-100 text-blue-700', user: 'bg-gray-100 text-gray-600' };

  // Agrupa perfis por setor (departamento) com busca e filtro
  const groupedProfiles = (() => {
    const term = userSearch.trim().toLowerCase();
    const filtered = profiles.filter(p => {
      const matchSearch = !term || p.full_name?.toLowerCase().includes(term) || p.email?.toLowerCase().includes(term);
      const matchSetor = userSetorFilter === 'all' || (p.department?.trim() || 'Sem setor') === userSetorFilter;
      return matchSearch && matchSetor;
    });
    const map = {};
    filtered.forEach(p => {
      const key = p.department?.trim() || 'Sem setor';
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return Object.entries(map)
      .map(([setor, items]) => ({ setor, items }))
      .sort((a, b) => {
        if (a.setor === 'Sem setor') return 1;
        if (b.setor === 'Sem setor') return -1;
        return a.setor.localeCompare(b.setor);
      });
  })();

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" /> Painel Admin
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gerencie usuários, setores, unidades e permissões</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-white gap-2 rounded-xl shadow-md">
              <UserPlus className="w-4 h-4" /> Convidar usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>Convidar colaborador</DialogTitle></DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-1.5">
                <Label>E-mail corporativo *</Label>
                <Input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colaborador@goldpao.com.br" required className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Perfil de acesso</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Colaborador</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={inviting} className="w-full gold-gradient text-white rounded-xl">
                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar convite'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="rounded-xl border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.split(' ')[1]}`}>
                <Icon className={`w-5 h-5 ${color.split(' ')[0]}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue={defaultTab} key={defaultTab}>
        <TabsList className="mb-4 flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="comunicados"><Globe className="w-3.5 h-3.5 mr-1.5 text-orange-500" /> Comunicados</TabsTrigger>
          <TabsTrigger value="users"><Users className="w-3.5 h-3.5 mr-1.5" /> Usuários</TabsTrigger>
          <TabsTrigger value="permissions"><Lock className="w-3.5 h-3.5 mr-1.5" /> Permissões</TabsTrigger>
          <TabsTrigger value="setores"><Building2 className="w-3.5 h-3.5 mr-1.5" /> Setores</TabsTrigger>
          <TabsTrigger value="funcoes"><Briefcase className="w-3.5 h-3.5 mr-1.5" /> Funções</TabsTrigger>
          <TabsTrigger value="unidades"><MapPin className="w-3.5 h-3.5 mr-1.5" /> Unidades</TabsTrigger>
          <TabsTrigger value="fichas"><UserCircle className="w-3.5 h-3.5 mr-1.5" /> Fichas</TabsTrigger>
          <TabsTrigger value="communities"><Globe className="w-3.5 h-3.5 mr-1.5" /> Comunidades</TabsTrigger>
          <TabsTrigger value="documents"><FileText className="w-3.5 h-3.5 mr-1.5" /> Documentos</TabsTrigger>
          <TabsTrigger value="integracoes"><Plug className="w-3.5 h-3.5 mr-1.5 text-blue-500" /> Integrações</TabsTrigger>
        </TabsList>

        {/* Comunicados */}
        <TabsContent value="comunicados"><AdminComunicadosTab /></TabsContent>

        {/* Usuários */}
        <TabsContent value="users">
          {/* Edit Profile Dialog */}
          <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>Editar Perfil</DialogTitle></DialogHeader>
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div className="space-y-1"><Label>Nome completo</Label><Input value={editProfileForm.full_name || ''} onChange={e => setEditProfileForm(f => ({ ...f, full_name: e.target.value }))} className="rounded-xl" /></div>
                <div className="space-y-1">
                  <Label>Departamento</Label>
                  <Select value={editProfileForm.department || ''} onValueChange={v => setEditProfileForm(f => ({ ...f, department: v }))}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione o setor" /></SelectTrigger>
                    <SelectContent>
                      {setores.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Cargo</Label>
                  <Select value={editProfileForm.job_title || ''} onValueChange={v => setEditProfileForm(f => ({ ...f, job_title: v }))}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione a função" /></SelectTrigger>
                    <SelectContent>
                      {funcoes.map(fn => <SelectItem key={fn.id} value={fn.name}>{fn.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Gestor</Label><Input value={editProfileForm.gestor || ''} onChange={e => setEditProfileForm(f => ({ ...f, gestor: e.target.value }))} className="rounded-xl" /></div>
                <div className="space-y-1"><Label>Telefone</Label><Input value={editProfileForm.phone || ''} onChange={e => setEditProfileForm(f => ({ ...f, phone: e.target.value }))} className="rounded-xl" /></div>
                <div className="space-y-1"><Label>Bio</Label><textarea value={editProfileForm.bio || ''} onChange={e => setEditProfileForm(f => ({ ...f, bio: e.target.value }))} rows={2} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" /></div>
                <Button type="submit" className="w-full gold-gradient text-white rounded-xl">Salvar alterações</Button>
              </form>
            </DialogContent>
          </Dialog>

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Buscar por nome ou e-mail..." className="pl-9 rounded-xl" />
            </div>
            <Select value={userSetorFilter} onValueChange={setUserSetorFilter}>
              <SelectTrigger className="w-full sm:w-56 rounded-xl"><SelectValue placeholder="Todos os setores" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os setores</SelectItem>
                {setores.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {groupedProfiles.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">Nenhum usuário encontrado.</p>
          )}

          <div className="space-y-5">
            {groupedProfiles.map(({ setor, items }) => (
              <div key={setor}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <Building2 className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-sm text-foreground">{setor}</h3>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">{items.length}</Badge>
                </div>
                <div className="space-y-2">
                  {items.map(profile => (
                    <Card key={profile.id} className="rounded-xl border-border/60">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Avatar className="w-9 h-9 shrink-0">
                          <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                            {profile.full_name?.slice(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{profile.full_name}</p>
                          <p className="text-xs text-muted-foreground">{profile.email} · {profile.department}</p>
                          {profile.gestor && <p className="text-xs text-muted-foreground">Gestor: {profile.gestor}</p>}
                        </div>
                        <Badge className={`text-[10px] border-0 ${roleBadgeColor[profile.role] || roleBadgeColor.user}`}>
                          {roleLabels[profile.role] || 'Colaborador'}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={() => openEditProfile(profile)} className="w-8 h-8 text-primary hover:bg-primary/10 shrink-0">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {profile.status === 'active' && (
                          <Button variant="ghost" size="icon" onClick={() => deactivateProfile(profile.id)} className="w-8 h-8 text-red-500 hover:bg-red-50 shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                        {profile.status === 'inactive' && <Badge variant="outline" className="text-[10px] text-muted-foreground">Inativo</Badge>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Permissões */}
        <TabsContent value="permissions">
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={permSearch} onChange={e => setPermSearch(e.target.value)} placeholder="Buscar por nome ou e-mail..." className="pl-9 rounded-xl" />
            </div>
            <Select value={permRoleFilter} onValueChange={setPermRoleFilter}>
              <SelectTrigger className="w-full sm:w-56 rounded-xl"><SelectValue placeholder="Todos os perfis" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os perfis</SelectItem>
                <SelectItem value="user">Colaborador</SelectItem>
                <SelectItem value="moderator">Moderador</SelectItem>
                <SelectItem value="department_leader">Líder de Dep.</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            {profiles
              .filter(profile => {
                const term = permSearch.trim().toLowerCase();
                const matchSearch = !term || profile.full_name?.toLowerCase().includes(term) || profile.email?.toLowerCase().includes(term);
                const matchRole = permRoleFilter === 'all' || (profile.role || 'user') === permRoleFilter;
                return matchSearch && matchRole;
              })
              .map(profile => (
              <Card key={profile.id} className="rounded-xl border-border/60">
                <CardContent className="p-4 flex items-center gap-3">
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                      {profile.full_name?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{profile.full_name}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  </div>
                  <Select value={profile.role || 'user'} onValueChange={v => updateProfileRole(profile.id, v)}>
                    <SelectTrigger className="w-36 h-8 text-xs rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Colaborador</SelectItem>
                      <SelectItem value="moderator">Moderador</SelectItem>
                      <SelectItem value="department_leader">Líder de Dep.</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              ))}
            {profiles.filter(profile => {
              const term = permSearch.trim().toLowerCase();
              const matchSearch = !term || profile.full_name?.toLowerCase().includes(term) || profile.email?.toLowerCase().includes(term);
              const matchRole = permRoleFilter === 'all' || (profile.role || 'user') === permRoleFilter;
              return matchSearch && matchRole;
            }).length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Nenhum usuário encontrado.</p>}
          </div>
        </TabsContent>

        {/* Setores */}
        <TabsContent value="setores"><SetoresTab /></TabsContent>

        {/* Funções */}
        <TabsContent value="funcoes"><FuncoesTab /></TabsContent>

        {/* Unidades */}
        <TabsContent value="unidades"><UnidadesTab /></TabsContent>

        {/* Fichas de Colaborador */}
        <TabsContent value="fichas"><FichaColaboradorTab /></TabsContent>

        {/* Comunidades */}
        <TabsContent value="communities"><AdminComunidadesTab /></TabsContent>

        {/* Documentos */}
        <TabsContent value="documents"><AdminDocumentosTab /></TabsContent>

        {/* Integrações Microsoft */}
        <TabsContent value="integracoes"><AdminIntegracoesTab /></TabsContent>
      </Tabs>
    </div>
  );
}