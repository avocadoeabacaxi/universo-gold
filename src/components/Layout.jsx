import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Home, Users, FileText, Video, Radio, Bell, Search, Menu, X, Settings, LogOut, ChevronDown, Megaphone, UserCog, Building2, Briefcase, MapPin, ClipboardList, UsersRound, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import NotificationBell from '@/components/notifications/NotificationBell';

export default function Layout() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      const profile = profiles[0];
      const effectiveRole = u.role === 'admin' ? 'admin' : (profile?.role || u.role);
      setUser({ ...u, role: effectiveRole, avatar_url: profile?.avatar_url || u.avatar_url });
    };
    init().catch(() => {});
  }, []);

  const navItems = [
    { icon: Home, label: 'Feed', path: '/' },
    { icon: Users, label: 'Comunidades', path: '/communities' },
    { icon: FileText, label: 'Repositório', path: '/repository' },
    { icon: Video, label: 'Vídeos', path: '/videos' },
    { icon: Radio, label: 'Lives', path: '/lives' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 gold-gradient shadow-lg overflow-hidden">
        {/* Detalhe curvado amarelo na ponta esquerda */}
        <img
          src="https://media.base44.com/images/public/6a31b47db4d51fa5778edaf8/700f00b66_barra.png"
          alt=""
          aria-hidden="true"
          className="absolute top-0 h-full w-auto pointer-events-none select-none left-[-1%] md:left-0"
        />
        <div className="relative max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0 relative z-10">
            <img
              src="https://media.base44.com/images/public/6a31b47db4d51fa5778edaf8/b87b7fd13_logo.png"
              alt="Universo Gold Pão"
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
            <Input
              placeholder="Pesquisar na plataforma..."
              className="pl-9 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 rounded-full h-9"
            />
          </div>

          {/* Desktop Nav Icons */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ icon: Icon, label, path }) => (
              <Link key={path} to={path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-white/80 hover:text-white hover:bg-white/20 rounded-lg px-3 flex-col h-auto py-1.5 gap-0.5 ${isActive(path) ? 'bg-white/25 text-white' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{label}</span>
                </Button>
              </Link>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <NotificationBell userId={user?.id} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-white/20 rounded-full p-1 transition-colors">
                  <Avatar className="w-8 h-8 border-2 border-white/50">
                    <AvatarImage src={user?.avatar_url} />
                    <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-3 h-3 text-white/70 hidden md:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 mt-1 z-[200]">
                <div className="px-3 py-2 border-b">
                  <p className="font-semibold text-sm">{user?.full_name || 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <Users className="w-4 h-4 mr-2" /> Meu Perfil
                  </Link>
                </DropdownMenuItem>
                {(user?.role === 'admin' || user?.role === 'department_leader' || user?.role === 'moderator') && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="w-3 h-3" /> RH &amp; Administração
                    </DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link to="/admin?tab=aprovacoes" className="cursor-pointer">
                        <UserCheck className="w-4 h-4 mr-2 text-green-600" /> Aprovações
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin?tab=comunicados" className="cursor-pointer">
                        <Megaphone className="w-4 h-4 mr-2 text-orange-500" /> Comunicados
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin?tab=users" className="cursor-pointer">
                        <UserCog className="w-4 h-4 mr-2 text-blue-500" /> Usuários &amp; Permissões
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin?tab=setores" className="cursor-pointer">
                        <Briefcase className="w-4 h-4 mr-2 text-purple-500" /> Setores
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin?tab=funcoes" className="cursor-pointer">
                        <ClipboardList className="w-4 h-4 mr-2 text-green-500" /> Funções
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin?tab=unidades" className="cursor-pointer">
                        <MapPin className="w-4 h-4 mr-2 text-red-500" /> Unidades
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin?tab=fichas" className="cursor-pointer">
                        <ClipboardList className="w-4 h-4 mr-2 text-yellow-600" /> Fichas de Colaborador
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin?tab=comunidades" className="cursor-pointer">
                        <UsersRound className="w-4 h-4 mr-2 text-teal-500" /> Comunidades
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => base44.auth.logout()} className="text-red-600 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-white/20"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1a3a7a] border-t border-white/20 px-3 py-3">
            <div className="grid grid-cols-3 gap-1">
              {navItems.map(({ icon: Icon, label, path }) => (
                <Link key={path} to={path} onClick={() => setMobileMenuOpen(false)}>
                  <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/20 hover:text-white transition-colors ${isActive(path) ? 'bg-white/25 text-white' : ''}`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-14">
        <Outlet />
      </main>
    </div>
  );
}