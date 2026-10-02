import { Button } from '@/components/ui/button';
import { Plus, PlayCircle } from 'lucide-react';
import { DISC_PROFILES, DISC_ORDER } from '@/lib/discProfiles';

export default function DiscHero({ isHR, onInvite, onSelfTest, starting }) {
  return (
    <div className="gold-gradient rounded-2xl p-6 text-white relative overflow-hidden">
      <div className="absolute -right-6 -top-6 grid grid-cols-2 gap-2 opacity-25 rotate-12">
        {DISC_ORDER.map(k => <div key={k} className={`w-16 h-16 rounded-2xl ${DISC_PROFILES[k].bg} flex items-center justify-center text-2xl font-extrabold`}>{k}</div>)}
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