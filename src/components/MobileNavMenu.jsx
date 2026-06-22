import { Link } from 'react-router-dom';

export default function MobileNavMenu({ navItems, isActive, onNavigate }) {
  return (
    <nav className="md:hidden bg-[#1a3a7a] border-t border-white/15 px-3 py-3 space-y-1">
      {navItems.map(({ icon: Icon, label, path }) => (
        <Link key={path} to={path} onClick={onNavigate}>
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white/85 hover:bg-white/15 hover:text-white transition-colors ${
              isActive(path) ? 'bg-white/20 text-white font-semibold' : 'font-medium'
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-[15px]">{label}</span>
          </div>
        </Link>
      ))}
    </nav>
  );
}