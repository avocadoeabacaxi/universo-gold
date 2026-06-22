import { Link, useLocation } from 'react-router-dom';
import { Home, Users, FileText, Video, Radio } from 'lucide-react';

const items = [
  { icon: Home, label: 'Feed', path: '/' },
  { icon: Users, label: 'Grupos', path: '/communities' },
  { icon: FileText, label: 'Docs', path: '/repository' },
  { icon: Video, label: 'Vídeos', path: '/videos' },
  { icon: Radio, label: 'Lives', path: '/lives' },
];

export default function BottomNav() {
  const location = useLocation();
  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/60 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around">
        {items.map(({ icon: Icon, label, path }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors"
            >
              <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}