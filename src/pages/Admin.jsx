import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, FileText, Video, Radio, Globe, Shield, Trash2, Loader2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function Admin() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
      if (user.role !== 'admin') { setLoading(false); return; }
      const [p, c, d] = await Promise.all([
        base44.entities.UserProfile.list('-created_date', 50),
        base44.entities.Community.list('name', 50),
        base44.entities.Document.list('-created_date', 50),
      ]);
      setProfiles(p);
      setCommunities(c);
      setDocuments(d);
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

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" /> Painel Admin
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gerencie usuários, conteúdos e permissões</p>
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

      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users"><Users className="w-3.5 h-3.5 mr-1.5" /> Usuários</TabsTrigger>
          <TabsTrigger value="communities"><Globe className="w-3.5 h-3.5 mr-1.5" /> Comunidades</TabsTrigger>
          <TabsTrigger value="documents"><FileText className="w-3.5 h-3.5 mr-1.5" /> Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="space-y-2">
            {profiles.map(profile => (
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
                  </div>
                  <Badge className={`text-[10px] border-0 ${roleBadgeColor[profile.role] || roleBadgeColor.user}`}>
                    {roleLabels[profile.role] || 'Colaborador'}
                  </Badge>
                  <Select value={profile.role || 'user'} onValueChange={v => updateProfileRole(profile.id, v)}>
                    <SelectTrigger className="w-32 h-8 text-xs rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Colaborador</SelectItem>
                      <SelectItem value="moderator">Moderador</SelectItem>
                      <SelectItem value="department_leader">Líder</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
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
        </TabsContent>

        <TabsContent value="communities">
          <div className="space-y-2">
            {communities.map(community => (
              <Card key={community.id} className="rounded-xl border-border/60">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{community.name?.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{community.name}</p>
                    <p className="text-xs text-muted-foreground">{community.members_count || 0} membros · {community.type === 'department' ? 'Departamento' : 'Grupo livre'}</p>
                  </div>
                  <Badge variant={community.visibility === 'open' ? 'secondary' : 'outline'} className="text-xs">
                    {community.visibility === 'open' ? 'Aberta' : 'Fechada'}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => deleteCommunity(community.id)} className="w-8 h-8 text-red-500 hover:bg-red-50 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <div className="space-y-2">
            {documents.filter(d => d.status === 'active').map(doc => (
              <Card key={doc.id} className="rounded-xl border-border/60">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.category} · {doc.uploader_name}</p>
                  </div>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="text-xs rounded-lg">Ver</Button>
                  </a>
                  <Button variant="ghost" size="icon" onClick={() => deleteDocument(doc.id)} className="w-8 h-8 text-red-500 hover:bg-red-50 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}