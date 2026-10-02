import { Button } from '@/components/ui/button';
import { Plus, PlayCircle } from 'lucide-react';

export default function DiscHero({ isHR, onInvite, onSelfTest, starting }) {
  return (
    <div className="gold-gradient rounded-2xl p-6 text-white relative overflow-hidden">
      <div className="hidden sm:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col items-center gap-2">
        <div className="grid grid-cols-2 gap-1.5 rotate-12">
          {['bg-red-500', 'bg-yellow-400', 'bg-green-500', 'bg-blue-500'].map((c, i) => (
            <div key={c} className={`w-12 h-12 rounded-xl ${c} shadow-lg flex items-center justify-center text-lg font-extrabold`}>{'PCG✦'[i]}</div>
          ))}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 mt-2">Perfil Comportamental Gold</span>
      </div>
      <div className="relative max-w-xl">
        <p className="text-xs uppercase tracking-widest font-bold text-white/70">Perfil Comportamental Gold</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">PCG</h1>
        <p className="text-sm text-white/80 mt-2">Descubra como cada pessoa age, se comunica e toma decisões. Dominância, Influência, Estabilidade e Conformidade.</p>
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button onClick={onSelfTest} disabled={starting} className="bg-white text-primary hover:bg-white/90 gap-2"><PlayCircle /> Fazer meu teste</Button>
          {isHR && <Button onClick={onInvite} className="bg-yellow-400 text-foreground hover:bg-yellow-300 gap-2"><Plus /> Novo teste / link</Button>}
        </div>
      </div>
    </div>
  );
}