import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Users, Plus, Lock, Globe, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import LeftSidebar from '@/components/sidebar/LeftSidebar';

export default function Communities() {
  const [communities, setCommunities] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      setUserProfile(profiles[0] || null);
      const c = await base44.entities.Community.filter({ status: 'active' }, 'name', 50);
      setCommunities(c);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  const joinCommunity = async (community) => {
    const isMember = community.members?.includes(currentUser?.id);
    if (isMember) return;

    if (community.visibility === 'closed') {
      const pending = community.pending_members || [];
      await base44.entities.Community.update(community.id, { pending_members: [...pending, currentUser?.id] });
    } else {
      const members = community.members || [];
      await base44.entities.Community.update(community.id, {
        members: [...members, currentUser?.id],
        members_count: (community.members_count || 0) + 1,
      });
    }
    const c = await base44.entities.Community.filter({ status: 'active' }, 'name', 50);
    setCommunities(c);
  };

  const filtered = communities.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'mine' && c.members?.includes(currentUser?.id)) || (filter === 'open' && c.visibility === 'open') || (filter === 'department' && c.type === 'department');
    return matchSearch && matchFilter;
  });

  const enrichedUser = currentUser ? { ...currentUser, job_title: userProfile?.job_title, department: userProfile?.department } : null;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-bold font-heading">Comunidades</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Conecte-se com colegas de toda a empresa</p>
            </div>
            <Link to="/communities/create" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto gold-gradient text-white gap-2 rounded-xl shadow-md hover:shadow-lg">
                <Plus className="w-4 h-4" /> Criar Grupo
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar comunidades..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="bg-muted/60">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="mine">Minhas</TabsTrigger>
                <TabsTrigger value="department">Departamentos</TabsTrigger>
                <TabsTrigger value="open">Abertas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(community => {
              const isMember = community.members?.includes(currentUser?.id);
              const isPending = community.pending_members?.includes(currentUser?.id);

              return (
                <Card key={community.id} className="rounded-xl border-border/60 overflow-hidden hover:shadow-md transition-shadow group">
                  {/* Cover */}
                  <div className="h-20 gold-gradient relative">
                    {community.cover_url && (
                      <img src={community.cover_url} alt="" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-2 right-2">
                      {community.type === 'department' ? (
                        <Badge className="bg-yellow-400 text-yellow-900 text-[10px] border-0">Departamento</Badge>
                      ) : (
                        <Badge className="bg-white/90 text-foreground text-[10px] border-0">Grupo</Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl shrink-0 -mt-8 border-4 border-white shadow-sm overflow-hidden relative z-10">
                        {community.avatar_url ? (
                          <img src={community.avatar_url} alt={community.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full gold-gradient flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{community.name?.slice(0, 2).toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 mt-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm truncate">{community.name}</h3>
                          {community.visibility === 'closed' ? (
                            <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
                          ) : (
                            <Globe className="w-3 h-3 text-green-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3" /> {community.members_count || 0} membros
                        </p>
                      </div>
                    </div>
                    {community.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{community.description}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Link to={`/communities/${community.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs rounded-lg">Ver</Button>
                      </Link>
                      {!isMember && !isPending && (
                        <Button
                          size="sm"
                          onClick={() => joinCommunity(community)}
                          className="flex-1 text-xs rounded-lg bg-primary hover:bg-primary/90"
                        >
                          {community.visibility === 'closed' ? 'Solicitar' : 'Entrar'}
                        </Button>
                      )}
                      {isPending && (
                        <Button size="sm" variant="outline" disabled className="flex-1 text-xs rounded-lg">
                          Pendente
                        </Button>
                      )}
                      {isMember && (
                        <Badge variant="secondary" className="text-xs px-3 self-center">Membro</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhuma comunidade encontrada</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}