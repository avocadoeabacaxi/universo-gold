import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Radio, Users, Video, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AniversariantesSection from '@/components/feed/AniversariantesSection';

export default function RightSidebar({ currentUser }) {
  const [lives, setLives] = useState([]);
  const [suggestedCommunities, setSuggestedCommunities] = useState([]);

  useEffect(() => {
    base44.entities.Live.filter({ status: 'live' }, '-created_date', 3).then(setLives);
    base44.entities.Community.filter({ status: 'active', visibility: 'open' }, '-members_count', 4).then(setSuggestedCommunities);
  }, []);

  return (
    <aside className="w-64 shrink-0 space-y-3 sticky top-[72px] max-h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin pb-4">
      {/* Aniversariantes */}
      <AniversariantesSection currentUser={currentUser} />

      {/* Lives ao vivo */}
      {lives.length > 0 && (
        <div className="bg-card rounded-xl border border-border/60 p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="font-bold text-sm">Ao Vivo Agora</span>
          </div>
          <div className="space-y-2">
            {lives.map(live => (
              <Link key={live.id} to={`/lives/${live.id}`}>
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-100 hover:bg-red-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-red-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate text-foreground">{live.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Badge className="bg-red-500 text-white text-[10px] px-1 py-0 h-4">AO VIVO</Badge>
                        <span className="text-[10px] text-muted-foreground">{live.viewers_count || 0} assistindo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sugestão de comunidades */}
      <div className="bg-card rounded-xl border border-border/60 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-sm">Sugestões para você</span>
        </div>
        <div className="space-y-2">
          {suggestedCommunities.map(community => (
            <Link key={community.id} to={`/communities/${community.id}`}>
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">{community.name?.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{community.name}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Users className="w-2.5 h-2.5" /> {community.members_count || 0} membros
                  </p>
                </div>
                <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 text-primary border-primary/30 hover:bg-primary/5">
                  Entrar
                </Button>
              </div>
            </Link>
          ))}
        </div>
        <Link to="/communities">
          <Button variant="ghost" size="sm" className="w-full mt-2 text-xs text-primary hover:bg-primary/10 gap-1">
            Ver todas <ChevronRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>

      {/* Vídeos recentes */}
      <div className="bg-card rounded-xl border border-border/60 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-sm flex items-center gap-1.5">
            <Video className="w-4 h-4 text-blue-500" /> Vídeos
          </span>
          <Link to="/videos">
            <Button variant="ghost" size="sm" className="h-6 text-[10px] text-primary hover:bg-primary/10 px-2">Ver mais</Button>
          </Link>
        </div>
        <Link to="/videos">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors text-xs text-blue-700 font-medium text-center">
            Acessar biblioteca de vídeos
          </div>
        </Link>
      </div>

      {/* Footer */}
      <div className="px-2 text-[10px] text-muted-foreground leading-relaxed">
        <p>Universo Gold © 2024 · Gold Pão</p>
        <p>Plataforma interna corporativa</p>
      </div>
    </aside>
  );
}