import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Home, Users, FileText, Video, Radio, ChevronRight, Plus, Brain } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function LeftSidebar({ currentUser }) {
  const location = useLocation();
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    if (currentUser?.id) {
      base44.entities.Community.filter({ status: 'active' }, 'name', 8).then(setCommunities);
    }
  }, [currentUser?.id]);

  const navItems = [
    { icon: Home, label: 'Feed', path: '/', color: 'text-primary' },
    { icon: Users, label: 'Comunidades', path: '/communities', color: 'text-purple-500' },
    { icon: FileText, label: 'Repositório', path: '/repository', color: 'text-red-500' },
    { icon: Video, label: 'Vídeos', path: '/videos', color: 'text-blue-500' },
    { icon: Radio, label: 'Lives', path: '/lives', color: 'text-red-600' },
    { icon: Brain, label: 'DISC', path: '/disc', color: 'text-yellow-600' },
  ];

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <aside className="w-64 shrink-0 space-y-2 sticky top-[72px] max-h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin pb-4">
      {/* Profile Card */}
      {currentUser && (
        <Link to="/profile" className="block">
          <div className="bg-card rounded-xl p-3 border border-border/60 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-primary/30">
                <AvatarImage src={currentUser.avatar_url} />
                <AvatarFallback className="bg-primary text-white font-bold text-sm">
                  {currentUser.full_name?.slice(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{currentUser.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Main Navigation */}
      <div className="bg-card rounded-xl border border-border/60 p-2">
        {navItems.map(({ icon: Icon, label, path, color }) => (
          <Link key={path} to={path}>
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${isActive(path) ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-foreground'}`}>
              <Icon className={`w-5 h-5 ${isActive(path) ? 'text-primary' : color}`} />
              <span className="text-sm">{label}</span>
              {isActive(path) && <ChevronRight className="w-3 h-3 ml-auto text-primary" />}
            </div>
          </Link>
        ))}
      </div>

      <Separator />

      {/* Communities */}
      <div className="bg-card rounded-xl border border-border/60 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-sm text-foreground">Suas Comunidades</span>
          <Link to="/communities">
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:bg-primary/10 px-2">
              Ver todas
            </Button>
          </Link>
        </div>
        <div className="space-y-0.5">
          {communities.slice(0, 6).map(community => (
            <Link key={community.id} to={`/communities/${community.id}`}>
              <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">{community.name?.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{community.name}</p>
                  <p className="text-[10px] text-muted-foreground">{community.members_count || 0} membros</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <Link to="/communities/create">
          <Button variant="ghost" size="sm" className="w-full mt-2 gap-2 text-xs text-primary hover:bg-primary/10">
            <Plus className="w-3.5 h-3.5" /> Criar grupo
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <div className="px-2 pt-2 text-[10px] text-muted-foreground leading-relaxed">
        <p>© 2026 Gold Pão</p>
        <p>Desenvolvido por LAB485/Avocado</p>
      </div>
    </aside>
  );
}